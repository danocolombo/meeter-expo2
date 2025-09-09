import { createAsyncThunk } from '@reduxjs/toolkit';
// import axios from 'axios';
import { API, graphqlOperation } from 'aws-amplify';
import * as queries from '../../jerichoQL/queries';
import * as gQueries from '../../graphql/queries';
import * as mutations from '../../jerichoQL/mutations';
import { MEETER_DEFAULTS } from '../../constants/meeter';
import { createAWSUniqueID, printObject } from '../../utils/helpers';
import { getAPIToken } from './userAPI';
import { fetchOrgs, updateHeroMessage, fetchPerson } from './userAPI';
import { NewHeroMessageType } from '../../gauchoTypes';
export const loginUser = createAsyncThunk(
    'user/loginUser',
    async ({ inputs, apiToken }, thunkAPI) => {
        try {
            let updatedProfile = null;
            //-------------------------------------------
            // check for apiToken, refresh if necessary
            //-------------------------------------------
            const userData = inputs.signInUserSession.accessToken.payload;
            const username = userData.username;
            const sub = userData.sub; // Sub is already available in accessToken.payload

            // console.log('🟨  ➡️  userThunks.js:24  ➡️  sub:\n', sub);

            const email = inputs.signInUserSession.idToken.payload.email;
            // printObject(
            //     '🟨 🟨 🟨=> file: userThunks.js:24=>userData:\n',
            //     userData
            // );
            // printObject(
            //     '🟨 🟨 🟨=> file: userThunks.js:25=>username:\n',
            //     username
            // );
            // printObject('🟨 🟨 🟨=> file: userThunks.js:26=>sub:\n', sub);
            // printObject('🟨 🟨 🟨=> file: userThunks.js:27=>email:\n', email);

            const tokenResponse = await getAPIToken(username, email, sub);

            let token = null;

            if (tokenResponse.status !== 200) {
                // Handle specific error cases
                if (tokenResponse.status === 422) {
                    // Create a limited access token for basic functionality
                    token = {
                        plainTextToken: 'limited_access_token',
                        isLimited: true,
                    };
                } else {
                    throw new Error(
                        `TOKEN_ERROR: Authentication token request failed (${tokenResponse.status})`
                    );
                }
            } else {
                token = tokenResponse.data;
                // printObject('🔲 🔲 🔲 UT:29->token:', token);
            }

            //*****************************************************
            //* fetch person from database
            //*****************************************************
            let person = null;
            let isLimitedUser = false;
            let fetchResponse = null;

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
            //     '🟨  ➡️  userThunks.js:52  ➡️  fetchResponse:\n',
            //     fetchResponse
            // );

            if (fetchResponse?.status === 200) {
                // Person fetched successfully
                person = fetchResponse?.data;

                // Only apply transformations to data from the database, not limited users
                if (!isLimitedUser) {
                    // printObject('🔲 🔲 🔲 UT:44->fetchResponse (Person):', fetchResponse);
                    //*****************************************************
                    //* this function is called a ways down to rename keys
                    //*****************************************************
                    function renameKeys(obj, renamingMap) {
                        const updatedObject = Object.assign({}, obj); // Create a shallow copy

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

                    function transformKeysRecursively(obj) {
                        // Helper function to transform a single key
                        function transformKey(key) {
                            return key.replace(/_([a-z])/g, (match, char) =>
                                char.toUpperCase()
                            );
                        }
                        for (const [key, value] of Object.entries(obj)) {
                            // Handle array values (affiliations)
                            if (Array.isArray(value)) {
                                obj[key] = value.map(transformKeysRecursively);
                            } else if (
                                typeof value === 'object' &&
                                value !== null
                            ) {
                                // Handle child objects (defaultOrg)
                                obj[key] = transformKeysRecursively(value);
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
            //*  load perms
            //*************************************** */
            let orgData = {};
            let permissions = [];
            let thisRole = null;
            let activeOrg = {};

            if (isLimitedUser) {
                // Limited user - no permissions, no organization access
                permissions = [];
                thisRole = 'limited';
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
                // Full user with normal processing
                try {
                    // console.log('🔍 Login Debug - person structure check:', {
                    //     hasDefaultOrg: !!person?.defaultOrg?.id,
                    //     defaultOrgId: person?.defaultOrg?.id,
                    //     hasAffiliations: !!person?.affiliations,
                    //     hasAffiliationsItems: !!person?.affiliations?.items,
                    //     affiliationsItemsLength:
                    //         person?.affiliations?.items?.length,
                    // });

                    if (person?.defaultOrg?.id && person?.affiliations?.items) {
                        orgData = person.affiliations.items.filter(
                            (a) =>
                                a.organization?.id === person.defaultOrg.id &&
                                a.status === 'active'
                        );
                    } else if (
                        person?.defaultOrg?.id &&
                        person?.affiliations &&
                        Array.isArray(person.affiliations)
                    ) {
                        // Fallback: try flat affiliations array structure
                        orgData = person.affiliations.filter(
                            (a) =>
                                a.organizationId === person.defaultOrg.id &&
                                a.status === 'active'
                        );
                    }

                    // console.log('🔍 Login Debug - orgData:', orgData);

                    orgData.forEach((cd) => {
                        permissions.push(cd.role);
                    });
                    // console.log(
                    //     '🟣🟣🟣 Login permissions extracted:',
                    //     permissions
                    // );
                } catch (error) {
                    console.error(
                        '🚨 Error extracting permissions during login:',
                        error
                    );
                    // Set default permissions to allow login to continue
                    permissions = ['guest'];
                    console.log('🔄 Using default guest permissions');
                }

                if (permissions.some((perm) => perm === 'director')) {
                    thisRole = 'director';
                } else if (permissions.some((perm) => perm === 'lead')) {
                    thisRole = 'lead';
                } else if (permissions.some((perm) => perm === 'manager')) {
                    thisRole = 'manager';
                } else {
                    thisRole = 'guest';
                }
                // console.log('🟣🟣🟣 thisRole:', thisRole);

                //* **************************************
                //*  need to set activeOrg
                //* **************************************
                let client = {};
                if (orgData.length > 0) {
                    //* affiliation found...
                    activeOrg = {
                        id: person?.defaultOrg?.id,
                        code: person?.defaultOrg?.code,
                        name: person?.defaultOrg?.name,
                        heroMessage: person?.defaultOrg?.heroMessage,
                        role: thisRole,
                        status: 'active',
                    };
                } else {
                    //* this is default, no affiliations
                    activeOrg = {
                        id: MEETER_DEFAULTS.ORGANIZATION_ID,
                        code: MEETER_DEFAULTS.CODE,
                        name: MEETER_DEFAULTS.NAME,
                        heroMessage: MEETER_DEFAULTS.HERO_MESSAGE,
                        role: MEETER_DEFAULTS.ROLE,
                        status: 'active',
                    };
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
                perms: permissions,
                apiToken: token,
                isLimitedUser: isLimitedUser,
            };
            // console.log('VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV');
            // printObject('🟨 🟨 🟨 UT:228-->results:\n', results);
            // console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');
            return results;
        } catch (error) {
            // Check if this is our specific Clerk user not found error
            if (
                error.message &&
                error.message.includes('CLERK_USER_NOT_FOUND')
            ) {
                throw new Error(
                    'User authenticated but not found in system. Please contact support.'
                );
            } else if (error.message && error.message.includes('TOKEN_ERROR')) {
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
export const joinOrganization = createAsyncThunk(
    'user/joinOrganization',
    async (inputs, thunkAPI) => {
        //*-------------------------------------
        // user wants to request access to new
        // organization.
        //*-------------------------------------
        // should have inputs.userProfile and
        // inputs.newCode
        //*-------------------------------------
        try {
            //      userProfile required
            if (!inputs?.userProfile?.id) {
                throw new Error('01: userProfile required');
            }
            //      newCode required
            if (!inputs?.newCode) {
                throw new Error('02: code required');
            }

            //      verify user does not have aff code
            const existing = inputs.userProfile.affiliations.items.find(
                (a) =>
                    a.organization.code.toUpperCase() ===
                    inputs?.newCode?.toUpperCase()
            );
            if (existing) {
                printObject(
                    'UT:242-->user already has affiliation for:',
                    inputs.newCode
                );
                throw new Error('03: duplicate');
            }
            //      confirm newCode is a valid code
            // note all codes in graphql organization table is all lowercase
            const targetCode = inputs.newCode.toLowerCase();
            console.log('targetCode:', targetCode);
            const orgResponse = await API.graphql(
                graphqlOperation(queries.listOrganizations, {
                    filter: { code: { eq: targetCode } },
                })
            );
            let requestedOrg = {};
            if (orgResponse.data.listOrganizations.items.length > 0) {
                requestedOrg = orgResponse.data.listOrganizations.items[0];
            } else {
                printObject('UT:258-->newCode is not valid:', inputs.newCode);
                throw new Error('04: invalid code');
            }
            //      insert new affiliation request for org
            const newAffId = createAWSUniqueID();
            const insertInfo = {
                organizationAffiliationsId: requestedOrg.id,
                role: 'new',
                status: 'pending',
                userAffiliationsId: inputs.userProfile.id,
            };
            printObject('UT:334-->insertInfo:\n', insertInfo);
            const insertResponse = await API.graphql({
                query: mutations.createAffiliation,
                variables: { input: insertInfo },
            });
            printObject('UT:339-->insertResponse:\n', insertResponse);
            if (!insertResponse?.data?.createAffiliation?.id) {
                printObject(
                    'UT:342-->could not add new affiliation:',
                    insertInfo
                );
                printObject('UT:345-->insertInfo:\n', insertInfo);
                printObject('UT:346-->insertResponse:\n', insertResponse);
                throw new Error('05: createAffiliation failed');
            }
            //      now add the new affiliation to the user profile
            const newOrgInfo = {
                id: insertResponse.data.createAffiliation.organization.id,
                name: insertResponse.data.createAffiliation.organization.name,
                code: insertResponse.data.createAffiliation.organization.code,
                heroMessage:
                    insertResponse.data.createAffiliation.organization
                        .heroMessage,
            };
            const addedAff = {
                id: insertResponse.data.createAffiliation.id,
                role: insertResponse.data.createAffiliation.role,
                status: insertResponse.data.createAffiliation.status,
                organization: newOrgInfo,
            };
            printObject('UT:364-->addedAff:\n', addedAff);
            // const updatedUserProfile = { ...inputs.userProfile };
            // updatedUserProfile.affiliations.items.push(addedAff);
            const updatedUserProfile = {
                ...inputs.userProfile,
                affiliations: {
                    ...inputs.userProfile.affiliations,
                    items: [...inputs.userProfile.affiliations.items, addedAff],
                },
            };
            printObject('UT:374-->updatedUserProfile:\n', updatedUserProfile);
            return { userProfile: updatedUserProfile };
        } catch (error) {
            printObject('UT:377-->error:\n', error);
            if (error.message.startsWith('01:')) {
                throw error; // Re-throw the specific error with code '01'
            } else if (error.message.startsWith('02:')) {
                throw error; // Re-throw the specific error with code '02'
            } else if (error.message.startsWith('03:')) {
                throw error; // Re-throw the specific error with code '03'
            } else if (error.message.startsWith('04:')) {
                throw error; // Re-throw the specific error with code '04'
            } else {
                // For unknown errors, throw a default code '99'
                throw new Error('99: joinOrganization failure');
            }
        }
    }
);
export const errorTest = createAsyncThunk(
    'user/errorTest',
    async (inputs, thunkAPI) => {
        // Simulating that code is duplicate
        const throwError = true;
        if (throwError) {
            const errorCode = 3;
            switch (errorCode) {
                case 1:
                    throw new Error('01: userProfile required');
                    break;
                case 2:
                    throw new Error('02: code required');
                    break;
                case 3:
                    throw new Error('03: duplicate');
                    break;
                default:
                    throw new Error('99: unknown error');
                    break;
            }
        } else {
            return { results: 'PASS' };
        }
    }
);
export const saveUserProfile = createAsyncThunk(
    'user/saveUserProfile',
    async (inputs, thunkAPI) => {
        try {
            // inputs should now be { userProfile, apiToken, perms } OR just the profile data

            // Check if inputs is the new format (object with userProfile, apiToken, perms)
            // or old format (just the profile data)
            let userProfile, apiToken, perms;

            if (inputs && typeof inputs === 'object' && inputs.userProfile) {
                // New format: { userProfile, apiToken, perms }
                userProfile = inputs.userProfile;
                apiToken = inputs.apiToken;
                perms = inputs.perms;
            } else {
                // Old/simple format: just the profile data
                userProfile = inputs;
                // Get current auth state from Redux to preserve it
                const currentState = thunkAPI.getState();
                apiToken = currentState.user?.apiToken || null;
                perms = currentState.user?.perms || [];
            }

            const inputValues = {
                userProfile: userProfile,
                apiToken: apiToken,
                perms: perms,
            };

            return inputValues;
        } catch (error) {
            printObject('UT:436-->ERROR saveUserProfile', inputs);
            // Rethrow the error to let createAsyncThunk handle it
            throw new Error('UT:438-->Failed to saveUserProfile thunk');
        }
    }
);
export const defineAndSaveUserProfile = createAsyncThunk(
    'user/defineAndSaveUserProfile',
    async (inputs, thunkAPI) => {
        printObject('UT:445-->inputs:\n', inputs);
        let gqlProfile = {};
        let updatedProfile = {};
        let activeOrg = {};
        try {
            let activeOrg = {};
            //      get graphQL user
            const gqlProfileData = await API.graphql({
                query: queries.usersBySub,
                variables: { sub: inputs.attributes.sub },
            });
            //*****************************************
            //* check if user has profile
            //*****************************************
            if (gqlProfileData?.data?.usersBySub?.items[0]?.id) {
                printObject('UT:460-->gqlProfileData:\n', gqlProfileData);
                gqlProfile = gqlProfileData.data.usersBySub.items[0];
                //      set activeOrg based on profile defaultOrg and affiliations
                printObject('UT:463-->gqlProfile:\n', gqlProfile);
                let clientData = {};
                if (gqlProfile?.defaultOrg?.id) {
                    clientData = gqlProfile.affiliations.items.filter(
                        (a) => a.organization.id === gqlProfile.defaultOrg.id
                    );
                }
                printObject('UT:470-->clientData:\n', clientData);
                let client = {};

                if (clientData.length > 0) {
                    //* affiliation found...
                    client = clientData[0];
                    activeOrg = {
                        id: client.organization.id,
                        code: client.organization.code,
                        name: client.organization.name,
                        heroMessage: client.organization.heroMessage,
                        role: client.role,
                        status: client.status,
                    };
                } else {
                    //* this is default, no affiliations
                    activeOrg = {
                        id: MEETER_DEFAULTS.ORGANIZATION_ID,
                        code: MEETER_DEFAULTS.CODE,
                        name: MEETER_DEFAULTS.NAME,
                        heroMessage: MEETER_DEFAULTS.HERO_MESSAGE,
                        role: MEETER_DEFAULTS.ROLE,
                        status: 'active',
                    };
                }
                printObject('UT:495-->client:', client);
                printObject('UT:496-->activeOrg:\n', activeOrg);
                // printObject('AC:68-->activeOrg:\n', activeOrg);
                // updatedProfile = { ...gqlProfile };
            } else {
                //todo: what does it look like when new user and no profile?
                //todo------------------------------------------------------
                activeOrg = {
                    id: MEETER_DEFAULTS.ORGANIZATION_ID,
                    code: MEETER_DEFAULTS.CODE,
                    name: MEETER_DEFAULTS.NAME,
                    heroMessage: MEETER_DEFAULTS.HERO_MESSAGE,
                    role: 'guest',
                    status: 'active',
                };
                // updatedProfile = { ...activeOrg };
            }
            updatedProfile = { ...gqlProfile, activeOrg: activeOrg };
        } catch (error) {
            printObject(
                'UT:515-->defineAndSaveUserProfile TryCatch failure:\n',
                error
            );
            return;
        }

        try {
            printObject('UT:522-->updatedProfile\n', updatedProfile);
            // rip perms out of affiliations
            let perms = [];
            updatedProfile?.affiliations?.items?.forEach((aff) => {
                if (aff.organization.id === updatedProfile.defaultOrg.id) {
                    if (aff.status === 'active') {
                        perms.push(aff.role);
                    }
                }
            });
            const inputValues = { userProfile: updatedProfile, perms: perms };
            return inputValues;
        } catch (error) {
            printObject('UT:535-->defineAndSaveUserProfile', inputs);
            // Rethrow the error to let createAsyncThunk handle it
            throw new Error(
                'UT:538-->Failed to defineAndSaveUserProfile thunk'
            );
        }
    }
);
export const changeOrg = createAsyncThunk(
    'user/changeOrg',
    async (inputs, thunkAPI) => {
        //* ------------------------------------
        //* inputs will be a new userProfile
        //* ------------------------------------
        const theProfile = inputs;
        try {
            //      set activeOrg based on profile defaultOrg and affiliations
            let clientData = {};
            if (theProfile?.defaultOrg?.id) {
                clientData = theProfile.affiliations.items.filter(
                    (a) => a.organization.id === theProfile.defaultOrg.id
                );
            }
            let perms = [];
            clientData.forEach((cd) => {
                perms.push(cd.role);
            });
            let client = {};
            let activeOrg = {};
            //* affiliation found...
            client = clientData[0];
            activeOrg = {
                id: client.organization.id,
                code: client.organization.code,
                name: client.organization.name,
                heroMessage: client.organization.heroMessage,
                role: client.role,
                status: client.status,
            };
            const newProfile = { ...theProfile, activeOrg: activeOrg };
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
export const changeDefaultOrg = createAsyncThunk(
    'user/changeDefaultOrg',
    async (inputs, thunkAPI) => {
        const theProfile = inputs.profile;
        const newActiveOrg = inputs.newActiveOrg;
        printObject('UT:522--inputs:\n', inputs);
        try {
            // Await the GraphQL mutation result
            const updateResults = await API.graphql({
                query: mutations.updateUser,
                variables: {
                    input: {
                        id: theProfile.id,
                        organizationDefaultUsersId: newActiveOrg.id,
                        // Add any other fields you want to update here
                    },
                },
            });

            const updatedProfile = {
                ...updateResults.data.updateUser,
                activeOrg: newActiveOrg,
            };
            // add activeOrg to profile

            let perms = [];
            updatedProfile.affiliations.items.forEach((aff) => {
                if (aff.organization.id === newActiveOrg.id) {
                    if (aff.status === 'active') {
                        perms.push(aff.role);
                    }
                }
            });

            const inputValues = {
                userProfile: updatedProfile,
                perms: perms,
            };

            // Return the result
            return inputValues;
        } catch (error) {
            console.error('UT:578-->changeDefaultOrg ERROR', inputs);
            console.error('UT:579-->error:\n', error);

            // Throw the error to let createAsyncThunk handle it as a rejected promise
            throw error;
        }
    }
);

export const changeActiveOrg = createAsyncThunk(
    'user/changeActiveOrg',
    async (inputs, thunkAPI) => {
        //* ------------------------------------
        //* Changes only the activeOrg without
        //* updating the database default
        //* inputs: { profile, newActiveOrg }
        //* ------------------------------------
        try {
            const theProfile = inputs.profile;
            const newActiveOrg = inputs.newActiveOrg;

            printObject('UT:changeActiveOrg-->inputs:\n', inputs);

            // Create updated profile with new activeOrg (no database update)
            const updatedProfile = {
                ...theProfile,
                activeOrg: newActiveOrg,
            };

            // Extract permissions for the new active org
            let perms = [];
            console.log(
                '🔄 UT:changeActiveOrg-->Extracting permissions for org:',
                newActiveOrg.id
            );
            console.log(
                '🔄 UT:changeActiveOrg-->Available affiliations:',
                updatedProfile?.affiliations?.length || 0
            );

            if (
                updatedProfile?.affiliations &&
                Array.isArray(updatedProfile.affiliations)
            ) {
                updatedProfile.affiliations.forEach((aff, index) => {
                    console.log(
                        `🔍 UT:changeActiveOrg-->Affiliation ${index}:`,
                        {
                            orgId: aff.organizationId,
                            targetOrgId: newActiveOrg.id,
                            role: aff.role,
                            status: aff.status,
                            matches: aff.organizationId === newActiveOrg.id,
                            isActive: aff.status === 'active',
                        }
                    );

                    if (aff.organizationId === newActiveOrg.id) {
                        if (aff.status === 'active') {
                            console.log(
                                '✅ UT:changeActiveOrg-->Adding permission:',
                                aff.role
                            );
                            perms.push(aff.role);
                        } else {
                            console.log(
                                '❌ UT:changeActiveOrg-->Skipping inactive affiliation:',
                                aff.role
                            );
                        }
                    }
                });
            } else {
                console.log(
                    '❌ UT:changeActiveOrg-->No affiliations found in profile'
                );
            }

            // Add permissions to the profile object
            updatedProfile.permissions = perms;

            const inputValues = {
                userProfile: updatedProfile,
                perms: perms,
            };

            console.log(
                'UT:changeActiveOrg-->Updated activeOrg to:',
                newActiveOrg.name
            );
            printObject('UT:changeActiveOrg-->New permissions:', perms);

            // Return the result
            return inputValues;
        } catch (error) {
            console.error('UT:changeActiveOrg ERROR', inputs);
            console.error('UT:changeActiveOrg error:\n', error);

            // Throw the error to let createAsyncThunk handle it as a rejected promise
            throw error;
        }
    }
);

export const updatePermissions = createAsyncThunk(
    'user/updatePermissions',
    async (inputs, thunkAPI) => {
        //* ------------------------------
        //* expecting...
        //* inputs.affiliations as []
        //* inputs.orgid as string
        //* ------------------------------
        try {
            printObject('UT:530-->inputs:\n', inputs);
            const affiliations = inputs.affiliations;
            const orgId = inputs.orgId;
            let clientData = {};
            clientData = affiliations.filter(
                (a) => a.organization.id === orgId
            );
            let perms = [];
            clientData.forEach((cd) => {
                perms.push(cd.role);
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
export const getUserProfile = createAsyncThunk(
    'user/getUserProfile',
    async (_, { getState }) => {
        const { profile } = getState().user;
        return profile;
    }
);
export const getPerms = createAsyncThunk(
    'user/getPerms',
    async (_, { getState }) => {
        const { perms } = getState().user;
        return perms;
    }
);
//*************************************************
//* THIS UPDATES THE Hero Message
//*************************************************
export const saveHeroMessage = createAsyncThunk(
    'meetings/saveHeroMessage',
    async (inputs, thunkAPI) => {
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
            if (updatedOrganization.status === 200) {
                //this goes to slice
                return {
                    status: updatedOrganization.status,
                    organization_id: organization_id,
                    message: updatedOrganization?.message,
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
export const getUserProfilePic = (profile) => {
    //* **********************************************
    // this formulates the userProfile.profilePic value
    //* **********************************************
    const PUBLIC_PATH = 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
    const returnValue = `${PUBLIC_PATH}/${profile.id}/image/${profile.picture}`;
    return returnValue;
};
