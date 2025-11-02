import { MEETER_DEFAULTS } from '@constants/meeter';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { getPermissionsForActiveOrg, printObject } from '@utils/helpers';
import { ApiError, Person, UserProfile } from '../../types/interfaces';
import type { RootState } from '../../utils/store';
import {
    fetchPerson,
    fetchUserProfilePicture,
    getAPIToken,
    updateHeroMessage,
} from './userAPI';

// Lightweight ThunkAPI typing used across these thunks
// Proper RTK ThunkApi config so createAsyncThunk infers getState correctly
type ThunkApiConfig = {
    state: RootState;
    dispatch: any;
    rejectValue: any;
};

// Helpers: type guards for API response shapes
function isSuccessResponse<T>(
    res: unknown
): res is { status: number; data: T } {
    return (
        !!res &&
        typeof res === 'object' &&
        'status' in (res as any) &&
        typeof (res as any).status === 'number'
    );
}

function isApiError(res: unknown): res is ApiError {
    return (
        !!res &&
        typeof res === 'object' &&
        ('message' in (res as any) ||
            'details' in (res as any) ||
            'status' in (res as any))
    );
}
export const loginUser = createAsyncThunk<
    any,
    { inputs: any; apiToken: string },
    ThunkApiConfig
>(
    'user/loginUser',
    async (args: { inputs: any; apiToken: string }, thunkAPI) => {
        try {
            const { inputs } = args;
            //-------------------------------------------
            // check for apiToken, refresh if necessary
            //-------------------------------------------

            const userData = inputs.signInUserSession.accessToken.payload;

            const username = userData.username;
            const sub = userData.sub; // Sub is already available in accessToken.payload

            // console.log('🟨  ➡️  userThunks.ts:60  ➡️  sub:\n', sub);

            const email = inputs.signInUserSession.idToken.payload.email;

            // printObject(
            //     '🟨 🟨 🟨=> file: userThunks.js:25=>username:\n',
            //     username
            // );
            // printObject('🟨 🟨 🟨=> file: userThunks.js:26=>sub:\n', sub);
            // printObject('🟨 🟨 🟨=> file: userThunks.js:27=>email:\n', email);

            const tokenResponse = await getAPIToken(username, email, sub);

            let token: any = null;

            if (isSuccessResponse<any>(tokenResponse)) {
                token = tokenResponse.data;
            } else if (isApiError(tokenResponse)) {
                // Handle specific error codes
                const respStatus = (tokenResponse as any).status;
                if (respStatus === 422) {
                    token = {
                        plainTextToken: 'limited_access_token',
                        isLimited: true,
                    };
                } else {
                    throw new Error(
                        `TOKEN_ERROR: Authentication token request failed (${String(
                            respStatus
                        )})`
                    );
                }
            }

            //*****************************************************
            //* fetch person from database
            //*****************************************************
            let person: UserProfile | Record<string, any> | null = null;
            let isLimitedUser = false;
            let fetchResponse: unknown = null;

            if (token?.isLimited) {
                // Skip fetchPerson for limited users and directly create limited profile
                isLimitedUser = true;
                // Create a limited DEFAULT user profile
                person = {
                    id: null, // No database ID
                    sub: sub,
                    username: username,
                    email: email,
                    phone: null,
                    shirt: null,
                    birthday: null,
                    picture: null,
                    affiliations: [], // No affiliations
                    location: null,
                    organizationDefaultUsersId: null,
                    defaultOrg: null,
                    locationUsersId: null,
                    createdAt: null,
                    updatedAt: null,
                    firstName: userData.given_name || username,
                    lastName: userData.family_name || '',
                    awsId: sub,
                    awsDefOrgId: null,
                    awsLocationId: null,
                    forgotPasswordToken: '',
                    verifyToken: '',
                    forgotPasswordTokenExpiry: null,
                    verifyTokenExpiry: null,
                    isLimitedUser: true, // Flag to indicate limited access
                };

                fetchResponse = { status: 200, data: person }; // Simulate successful fetch
            } else {
                // printObject('🔲 🔲 🔲 UT:38->sub:', token);
                fetchResponse = await fetchPerson(sub, token);
            }

            // console.log(
            //     '🟨  ➡️  userThunks.ts:140  ➡️  fetchResponse:\n',
            //     fetchResponse
            // );

            if (
                isSuccessResponse<Person | Record<string, any>>(
                    fetchResponse
                ) &&
                fetchResponse.status === 200
            ) {
                // Person fetched successfully
                person = fetchResponse.data as Person | Record<string, any>;

                // Only apply transformations to data from the database, not limited users
                if (!isLimitedUser) {
                    // printObject('🔲 🔲 🔲 UT:44->fetchResponse (Person):', fetchResponse);
                    //*****************************************************
                    //* this function is called a ways down to rename keys
                    //*****************************************************
                    function renameKeys(
                        obj: Record<string, any>,
                        renamingMap: Record<string, string>
                    ): Record<string, any> {
                        const updatedObject: Record<string, any> =
                            Object.assign({}, obj); // Create a shallow copy

                        for (const [oldKey, newKey] of Object.entries(
                            renamingMap
                        )) {
                            if (oldKey in updatedObject) {
                                // Check if the old key exists
                                updatedObject[newKey] = updatedObject[oldKey]; // Assign value to new key
                                delete updatedObject[oldKey]; // Remove old key
                            } else {
                                console.warn(
                                    `Key "${oldKey}" not found in the object.`
                                );
                            }
                        }
                        return updatedObject;
                    }
                    //***********************************************
                    //* identify the keys and new key names
                    //***********************************************
                    const renamingMap = {
                        // default_org: 'defaultOrg',
                        default_org_id: 'organizationDefaultUsersId',
                        default_org: 'defaultOrg',
                        location_id: 'locationUsersId',
                    };
                    //***********************************************
                    //* change the php keys for meeter use
                    //***********************************************
                    const updatedPerson = renameKeys(person, renamingMap);
                    person = { ...updatedPerson };

                    function transformKeysRecursively(
                        obj: Record<string, any>
                    ): Record<string, any> {
                        // Helper function to transform a single key
                        function transformKey(key: string) {
                            return key.replace(
                                /_([a-z])/g,
                                (match: string, char: string) =>
                                    char.toUpperCase()
                            );
                        }
                        for (const [key, value] of Object.entries(obj)) {
                            // Handle array values (affiliations)
                            if (Array.isArray(value)) {
                                obj[key] = value.map((v: any) =>
                                    transformKeysRecursively(v)
                                );
                            } else if (
                                typeof value === 'object' &&
                                value !== null
                            ) {
                                // Handle child objects (defaultOrg)
                                obj[key] = transformKeysRecursively(
                                    value as Record<string, any>
                                );
                            } else {
                                // Handle primitive values
                                if (key.includes('_')) {
                                    // Transform keys with underscore
                                    obj[transformKey(key)] = value;
                                    delete obj[key];
                                } else {
                                    // Keep unchanged keys
                                    obj[key] = value; // No need to delete here
                                }
                            }
                        }
                        return obj;
                    }
                    //***********************************************
                    //* get rid of "_" values and camelcase keys
                    //***********************************************
                    const transformedObject = transformKeysRecursively(person);
                    person = { ...transformedObject };
                }
                // All the commented code below would also only apply to database users
                // function wrapArrayWithKey(obj, key, newKey) {
                //     // Check if the key exists and is an array
                //     if (key in obj && Array.isArray(obj[key])) {
                //         obj[key] = {
                //             [newKey]: obj[key], // Wrap the array with the new key
                //         };
                //     }
                //     // Recursively process child objects
                //     for (const childKey in obj) {
                //         if (
                //             typeof obj[childKey] === 'object' &&
                //             obj[childKey] !== null
                //         ) {
                //             wrapArrayWithKey(obj[childKey], key, newKey);
                //         }
                //     }
                // }
                // //***********************************************
                // //* put the affiliations array into items object
                // //***********************************************
                // wrapArrayWithKey(person, 'affiliations', 'items');
                // const immatureAffs = person.affiliations.items;
                // const returnOrgs = await fetchOrgs();
                // const allOrgs = returnOrgs.data;
                // //* ********************************
                // //* add org info to affiliations
                // //* ********************************
                // const completeAffs = immatureAffs.map((a) => {
                //     // Use findIndex instead of find for stricter comparison
                //     const orgIndex = allOrgs.findIndex(
                //         (o) => o.id === a.organizationId
                //     );
                //     // Check if org is found before accessing properties
                //     if (orgIndex >= 0) {
                //         const org = allOrgs[orgIndex];
                //         return {
                //             ...a,
                //             name: org.name,
                //             code: org.code,
                //             hero_message: org.hero_message,
                //             location_id: org.location_id,
                //         };
                //     } else {
                //         console.log('UT153--> 🅾️ orgIndex: ', orgIndex);
                //         printObject(
                //             'UT154--> 🅾️ aff not found in allOrgs:\n',
                //             a
                //         );
                //         return {
                //             ...a,
                //             name: 'UNKNOWN',
                //             code: 'unk',
                //             hero_message:
                //                 'Organization not determined from affiliation.',
                //             location_id: null,
                //         };
                //     }
                // });
                // const done = { items: completeAffs };
                // person = {
                //     ...person,
                //     affiliations: done,
                // };
            } else {
                // User has valid token but person not found in database
                // This shouldn't happen for normal users, so treat as error
                console.log(
                    'Person not found in database for authenticated user'
                );
                throw new Error('User profile not found in system database');
            }
            //************************************** */
            //*  load perms (use helper to derive permissions for activeOrg)
            //*************************************** */
            let permissions: string[] = [];
            let activeOrg: Record<string, any> = {};

            if (isLimitedUser) {
                // Limited user - no permissions, no organization access
                permissions = [];
                activeOrg = {
                    id: null,
                    code: 'limited',
                    name: 'Limited Access',
                    heroMessage:
                        'You have limited access. Please contact support to activate your account.',
                    role: 'limited',
                    status: 'limited',
                };
            } else {
                // Determine activeOrg from defaultOrg presence and set permissions
                const defaultOrgId = (person as any)?.defaultOrg?.id;
                if (defaultOrgId) {
                    activeOrg = {
                        id: person?.defaultOrg?.id,
                        code: person?.defaultOrg?.code,
                        name: person?.defaultOrg?.name,
                        heroMessage: person?.defaultOrg?.heroMessage,
                        role: 'guest', // temporary, may be recalculated below
                        status: 'active',
                    };
                } else {
                    activeOrg = {
                        id: MEETER_DEFAULTS.ORGANIZATION_ID,
                        code: MEETER_DEFAULTS.CODE,
                        name: MEETER_DEFAULTS.NAME,
                        heroMessage: MEETER_DEFAULTS.HERO_MESSAGE,
                        role: MEETER_DEFAULTS.ROLE,
                        status: 'active',
                    };
                }

                // assign permissions using helper - it will handle different affiliation shapes
                try {
                    // make a shallow copy so helper can read activeOrg
                    const tempProfile = {
                        ...(person as any),
                        activeOrg,
                    } as any;
                    permissions = getPermissionsForActiveOrg(
                        tempProfile as any
                    );
                } catch (err) {
                    console.error('Error deriving permissions:', err);
                    permissions = [];
                }

                // derive a higher-level role for activeOrg.role if present
                if (permissions.some((perm) => perm === 'director')) {
                    activeOrg.role = 'director';
                } else if (permissions.some((perm) => perm === 'lead')) {
                    activeOrg.role = 'lead';
                } else if (permissions.some((perm) => perm === 'manager')) {
                    activeOrg.role = 'manager';
                } else if (isLimitedUser) {
                    activeOrg.role = 'limited';
                } else {
                    activeOrg.role = 'guest';
                }
            }

            person = {
                ...person,
                activeOrg: activeOrg,
                permissions: permissions,
            };
            //  printObject('🟨 🟨 🟨 UT:187-->person:\n', person);
            //  printObject('🟨 🟨 🟨 UT:188->permissions:\n', permissions);
            const results = {
                profile: person,
                apiToken: token,
                isAuthenticated: !!person?.id, // or whatever logic you use
                isLoading: false,
                isLimitedUser: isLimitedUser,
            };

            return results;
        } catch (error: unknown) {
            const e = error as any;
            const message = e?.message || String(e);
            if (
                typeof message === 'string' &&
                message.includes('CLERK_USER_NOT_FOUND')
            ) {
                throw new Error(
                    'User authenticated but not found in system. Please contact support.'
                );
            } else if (
                typeof message === 'string' &&
                message.includes('TOKEN_ERROR')
            ) {
                throw new Error(
                    'Authentication token error. Please try again or contact support.'
                );
            } else {
                throw new Error(
                    'Login failed. Please try again or contact support.'
                );
            }
        }
    }
);

export const errorTest = createAsyncThunk('user/errorTest', async () => {
    // Simple test thunk used by the legacy user slice for QA hooks
    return { results: 'PASS' };
});

/**
 * Thunk to refresh the API token for the current user.
 * If `profile` is provided it will use that; otherwise it will read the
 * profile from the current state.
 */
export const refreshApiToken = createAsyncThunk<
    any,
    { profile?: any } | void,
    ThunkApiConfig
>('user/refreshApiToken', async (args: any | void, thunkAPI) => {
    try {
        const profile =
            (args && args.profile) ||
            (thunkAPI.getState() as RootState).user.profile;
        if (!profile) {
            return thunkAPI.rejectWithValue(
                'No profile available to refresh token'
            );
        }
        const username = profile.username || profile.firstName || profile.email;
        const email = profile.email || '';
        const sub = profile.sub || profile.awsId || '';
        if (!username || !sub) {
            return thunkAPI.rejectWithValue('Insufficient profile info');
        }

        const tokenResponse = await getAPIToken(username, email, sub);
        if (
            tokenResponse &&
            typeof tokenResponse === 'object' &&
            'status' in (tokenResponse as any) &&
            (tokenResponse as any).status === 200
        ) {
            const token = (tokenResponse as any).data;
            // dispatch the slice action to update the token in state
            thunkAPI.dispatch({ type: 'user/setAPIToken', payload: token });
            return token;
        }
        return thunkAPI.rejectWithValue(tokenResponse);
    } catch (err: any) {
        return thunkAPI.rejectWithValue(String(err));
    }
});
/**
 * Thunk to update permissions for the active organization in the user profile.
 * It reads the current profile from state, computes permissions, and updates the profile.
 */
export const updateActiveOrgPermissions = createAsyncThunk<
    string[],
    void,
    ThunkApiConfig
>('user/updateActiveOrgPermissions', async (_, { getState }) => {
    const state = getState();
    const { profile } = state.user as any;
    const activeOrg = (state as any).system?.activeOrg || {};
    if (!profile?.affiliations || !activeOrg?.id) return [];

    const orgId = activeOrg.id;
    const permissions = (profile.affiliations as any[])
        .filter(
            (aff: any) =>
                aff.organizationId === orgId && aff.status === 'active'
        )
        .map((aff: any) => aff.role)
        .sort((a: string, b: string) =>
            String(a || '').localeCompare(String(b || ''))
        );

    return permissions;
});
export const saveUserProfile = createAsyncThunk<any, any, ThunkApiConfig>(
    'user/saveUserProfile',
    async (inputs: any, thunkAPI) => {
        try {
            // inputs should now be { userProfile, apiToken, perms } OR just the profile data

            // Check if inputs is the new format (object with userProfile, apiToken, perms)
            // or old format (just the profile data)
            let userProfile, apiToken, perms;

            if (
                inputs &&
                typeof inputs === 'object' &&
                'userProfile' in inputs
            ) {
                // New format: { userProfile, apiToken, perms }
                userProfile = inputs.userProfile;
                apiToken = inputs.apiToken;
                perms = inputs.perms;
            } else {
                // Old/simple format: just the profile data
                userProfile = inputs;
                // Get current auth state from Redux to preserve it
                const currentState = thunkAPI.getState() as RootState;
                apiToken = (currentState.user as any)?.apiToken || null;
                perms = (currentState.user as any)?.perms || [];
            }

            const inputValues = {
                userProfile: userProfile,
                apiToken: apiToken,
                perms: perms,
            };

            return inputValues;
        } catch (error) {
            printObject('UT:436-->ERROR saveUserProfile', { inputs, error });
            // Rethrow the error to let createAsyncThunk handle it
            throw new Error('UT:438-->Failed to saveUserProfile thunk');
        }
    }
);

export const changeOrg = createAsyncThunk<any, any, ThunkApiConfig>(
    'user/changeOrg',
    async (inputs: any, thunkAPI) => {
        //* ------------------------------------
        //* inputs will be a new userProfile
        //* ------------------------------------
        const theProfile = inputs;
        try {
            //      set activeOrg based on profile defaultOrg and affiliations
            let clientData: any[] = [];
            if (theProfile?.defaultOrg?.id) {
                const items = (theProfile.affiliations?.items ||
                    []) as unknown[];
                clientData = items.filter(
                    (a: unknown) =>
                        (a as any)?.organization?.id ===
                        theProfile.defaultOrg.id
                ) as any[];
            }
            let perms: string[] = [];
            clientData.forEach((cd: unknown) => {
                const c = cd as any;
                perms.push(c.role);
            });
            let client: any = {};
            let activeOrg: any = {};
            //* affiliation found...
            client = clientData[0] || {};
            activeOrg = {
                id: client.organization.id,
                code: client.organization.code,
                name: client.organization.name,
                heroMessage: client.organization.heroMessage,
                role: client.role,
                status: client.status,
            };
            // Do NOT store activeOrg on the user.profile. Instead, persist it to system state.
            const newProfile = { ...theProfile };
            try {
                thunkAPI.dispatch({
                    type: 'system/setActiveOrg',
                    payload: activeOrg,
                });
            } catch {
                // ignore dispatch errors
            }
            const results = { profile: newProfile, perms: perms };
            // printObject('UT:64-->profile&perms:', results);

            return results;
        } catch (error) {
            printObject('UT:580-->saveUserProfile ERROR', inputs);
            printObject('UT:581-->error:\n', error);
            // Rethrow the error to let createAsyncThunk handle it
            throw new Error('UT:583-->Failed to saveUserProfile thunk');
        }
    }
);

export const changeActiveOrg = createAsyncThunk<
    any,
    { profile: any; newActiveOrg: any },
    ThunkApiConfig
>(
    'user/changeActiveOrg',
    async (inputs: { profile: any; newActiveOrg: any }, thunkAPI) => {
        //* ------------------------------------
        //* Changes only the activeOrg without
        //* updating the database default
        //* inputs: { profile, newActiveOrg }
        //* ------------------------------------
        try {
            const theProfile = inputs.profile;
            const newActiveOrg = inputs.newActiveOrg;

            printObject('UT:changeActiveOrg-->inputs:\n', inputs);

            // Create a temporary updatedProfile with activeOrg so helpers can compute perms
            const updatedProfile = {
                ...theProfile,
                activeOrg: newActiveOrg,
            };

            // Extract permissions for the new active org using helper
            try {
                const perms = getPermissionsForActiveOrg(updatedProfile as any);
                updatedProfile.permissions = perms;
            } catch (err) {
                console.error(
                    'Error extracting permissions in changeActiveOrg',
                    err
                );
                updatedProfile.permissions = [];
            }

            // Persist activeOrg on system state and return a userProfile WITHOUT activeOrg
            try {
                thunkAPI.dispatch({
                    type: 'system/setActiveOrg',
                    payload: newActiveOrg,
                });
            } catch {
                // ignore
            }

            const inputValues = {
                userProfile: {
                    ...theProfile,
                    permissions: updatedProfile.permissions || [],
                },
                perms: updatedProfile.permissions || [],
            };

            console.log(
                'UT:changeActiveOrg-->Updated activeOrg to:',
                newActiveOrg.name
            );
            printObject(
                'UT:changeActiveOrg-->New permissions:',
                updatedProfile.permissions || []
            );

            // Return the result (userProfile does not contain activeOrg)
            return inputValues;
        } catch (error) {
            console.error('UT:changeActiveOrg ERROR', inputs);
            console.error('UT:changeActiveOrg error:\n', error);

            // Throw the error to let createAsyncThunk handle it as a rejected promise
            throw error;
        }
    }
);

export const updatePermissions = createAsyncThunk<
    string[],
    { affiliations: any[]; orgId: string },
    ThunkApiConfig
>(
    'user/updatePermissions',
    async (inputs: { affiliations: any[]; orgId: string }, thunkAPI) => {
        //* ------------------------------
        //* expecting...
        //* inputs.affiliations as []
        //* inputs.orgid as string
        //* ------------------------------
        try {
            printObject('UT:530-->inputs:\n', inputs);
            const affiliations = inputs.affiliations as unknown[];
            const orgId = inputs.orgId;
            let clientData: any[] = [];
            clientData = affiliations.filter(
                (a: unknown) => (a as any)?.organization?.id === orgId
            ) as any[];
            let perms: string[] = [];
            clientData.forEach((cd: unknown) => {
                const c = cd as any;
                perms.push(c.role);
            });
            printObject('UT:546-->perms:\n', perms);
            return perms;
        } catch (error) {
            printObject('UT:541-->updatePermissions ERROR', inputs);
            printObject('UT:542-->error:\n', error);
            // Rethrow the error to let createAsyncThunk handle it
            throw new Error('UT:544-->Failed to updatePermissions thunk');
        }
    }
);
export const getUserProfile = createAsyncThunk<
    UserProfile | null,
    void,
    ThunkApiConfig
>('user/getUserProfile', async (_, { getState }) => {
    const state = getState() as RootState;
    return (state.user as any).profile || null;
});
export const getPerms = createAsyncThunk<string[], void, ThunkApiConfig>(
    'user/getPerms',
    async (_, { getState }) => {
        const state = getState() as RootState;
        return (state.user as any).perms || [];
    }
);
//*************************************************
//* THIS UPDATES THE Hero Message
//*************************************************
export const saveHeroMessage = createAsyncThunk<
    any,
    { api_token: any; organization_id: string; message: string },
    ThunkApiConfig
>(
    'meetings/saveHeroMessage',
    async (
        inputs: { api_token: any; organization_id: string; message: string },
        thunkAPI
    ) => {
        try {
            //* ************************************
            // api_token
            // organization_id
            // message
            //* ************************************
            const { api_token, organization_id, message } = inputs;

            const updatedOrganization = await updateHeroMessage(
                api_token,
                organization_id,
                message
            );
            if (
                isSuccessResponse<any>(updatedOrganization) &&
                updatedOrganization.status === 200
            ) {
                //this goes to slice
                return {
                    status: updatedOrganization.status,
                    organization_id: organization_id,
                    message: (updatedOrganization as any)?.message,
                    data: updatedOrganization.data,
                };
            }
            // printObject('🔴 UT:699-->saveHeroMessage', {
            //     status: requestedPage.status,
            //     message: request,
            //     error: 'unexpected response from saveHeroMessage',
            // });
            throw new Error('UT:702-->Failed to saveHeroMessage');
        } catch (error) {
            printObject('🔴 UT:704-->saveHeroMessage', {
                status: 'fail',
                error: error,
            });
            throw new Error('UT:708-->Failed saveHeroMessage');
        }
    }
);
//const PUBLIC_PATH = 'https://fortsonguru.com/jericho/public/api/person/';

//*************************************************
//* THIS UPDATES THE Hero Message
//*************************************************
export const getUserProfilePic = (profile: {
    id: string;
    picture: string | null;
}) => {
    //* **********************************************
    // this formulates the userProfile.profilePic value
    //* **********************************************
    const PUBLIC_PATH = 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
    const returnValue = `${PUBLIC_PATH}/${profile.id}/image/${profile.picture}`;
    return returnValue;
};

//*************************************************
//* FETCH USER PROFILE PICTURE FROM API
//*************************************************
export const fetchProfilePicture = createAsyncThunk<
    string,
    { userId: string; pictureId: string },
    ThunkApiConfig
>(
    'user/fetchProfilePicture',
    async (args: { userId: string; pictureId: string }, thunkAPI) => {
        try {
            const state = thunkAPI.getState();
            const token = (state.user as any)?.apiToken;

            if (!token) {
                throw new Error('No authentication token available');
            }

            const response = await fetchUserProfilePicture(
                args.userId,
                args.pictureId,
                token
            );

            // Check if response has imageUri property (success case)
            if (
                response &&
                typeof response === 'object' &&
                'imageUri' in response
            ) {
                return (response as { imageUri: string }).imageUri;
            } else if (isApiError(response)) {
                throw new Error(
                    response.message || 'Failed to fetch profile picture'
                );
            } else {
                throw new Error('Unexpected response format');
            }
        } catch (error) {
            printObject('🔴 fetchProfilePicture error:', error);
            throw error;
        }
    }
);
