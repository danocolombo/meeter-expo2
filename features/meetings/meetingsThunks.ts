import { createAsyncThunk } from '@reduxjs/toolkit';
// import axios from 'axios';
// import { API } from 'aws-amplify';
import { ApiError, FullGroup, FullMeeting } from '../../types/interfaces';
import { createAWSUniqueID, printObject } from '../../utils/helpers';
import type { RootState } from '../../utils/store';
import {
    createNewGroup,
    createNewMeeting,
    deleteAGroup,
    deleteAMeeting,
    fetchActiveMeetings,
    fetchHistoricMeetings,
    fetchHistoricPage,
    fetchMeetingDetails,
    updateAGroup,
    updateTheMeeting,
} from './meetingsAPI';

// Lightweight ThunkAPI typing used across these thunks
// Proper RTK ThunkApi config so createAsyncThunk infers getState correctly
type ThunkApiConfig = {
    state: RootState;
    dispatch: any;
    rejectValue: any;
};
interface GroupUpdateType {
    title: string;
    location: string;
    gender: string;
    attendance: number;
    facilitator: string;
    cofacilitator: string;
    notes: string;
}
interface FetchMeetingDetailsByIdArgs {
    apiToken: string;
    organizationId: string;
    meetingId: string;
}
// Helper type-guards
function isSuccessResponse<T>(
    res: unknown
): res is { status: number; data: T } {
    return (
        !!res &&
        typeof res === 'object' &&
        'status' in (res as any) &&
        typeof (res as any).status === 'number' &&
        (res as any).status === 200
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
type RequestedPageType = {
    status: number;
    data: FullMeeting[];
    currentPage: number;
    lastPage: number;
};

type UpdateMeetingType = {
    status: number;
    message: string;
    data: FullMeeting;
};

export const getAllMeetings = createAsyncThunk<
    {
        status: string;
        meetings: {
            all: FullMeeting[];
            active: FullMeeting[];
            historic: FullMeeting[];
        };
    },
    { apiToken?: string; org_id: string },
    ThunkApiConfig
>(
    'meetings/getAllMeetings',
    async (inputs: { apiToken?: string; org_id: string }, thunkAPI) => {
        try {
            const { apiToken, org_id } = inputs;
            const activeMeetingInfo = await fetchActiveMeetings(
                apiToken,
                org_id
            );
            const historicMeetingInfo = await fetchHistoricMeetings(
                apiToken,
                org_id
            );

            const activeMeetingsArray = isSuccessResponse<FullMeeting[]>(
                activeMeetingInfo
            )
                ? activeMeetingInfo.data
                : [];
            const historicMeetingsArray = isSuccessResponse<FullMeeting[]>(
                historicMeetingInfo
            )
                ? historicMeetingInfo.data
                : [];

            const summary: { all: any[]; active: any[]; historic: any[] } = {
                all: [...activeMeetingsArray, ...historicMeetingsArray],
                active: [...activeMeetingsArray],
                historic: [...historicMeetingsArray],
            };

            return {
                status: '200',
                meetings: summary,
            };
        } catch (error: unknown) {
            printObject('MT:123-->getAllMeetingsG', { status: 'fail' });
            printObject('MT:124-->error:', error);
            throw new Error('MT:125-->Failed to getAllMeetingsG');
        }
    }
);

//*************************************************
//* THIS LOADS ALL FROM SIGN IN
//*************************************************
export const fetchAllMeetings = createAsyncThunk<
    { status: string; meetingInfo: any },
    { apiToken: string; org_id: string },
    ThunkApiConfig
>(
    'meetings/fetchAllMeetings',
    async (inputs: { apiToken: string; org_id: string }, thunkAPI) => {
        try {
            //* ************************************
            //* get all activeMeetings
            //* ************************************
            const { apiToken, org_id } = inputs;
            const activeMeetingInfo = await fetchActiveMeetings(
                apiToken,
                org_id
            );

            const historicMeetingInfo = await fetchHistoricMeetings(
                apiToken,
                org_id
            );

            const activeMeetingsArray = isSuccessResponse<FullMeeting[]>(
                activeMeetingInfo
            )
                ? activeMeetingInfo.data
                : [];
            const historicMeetingsArray = isSuccessResponse<FullMeeting[]>(
                historicMeetingInfo
            )
                ? historicMeetingInfo.data
                : [];

            const summary = {
                activeMeetings: [...activeMeetingsArray],
                activeCurrentPage: isSuccessResponse(activeMeetingInfo)
                    ? (activeMeetingInfo as any).currentPage
                    : 1,
                activeLastPage: isSuccessResponse(activeMeetingInfo)
                    ? (activeMeetingInfo as any).lastPage
                    : 1,
                historicMeetings: [...historicMeetingsArray],
                historicCurrentPage: isSuccessResponse(historicMeetingInfo)
                    ? (historicMeetingInfo as any).currentPage
                    : 1,
                historicLastPage: isSuccessResponse(historicMeetingInfo)
                    ? (historicMeetingInfo as any).lastPage
                    : 1,
            };
            const returnValue = {
                status: '200',
                meetingInfo: summary,
            };
            return returnValue;
        } catch (error: unknown) {
            printObject('🔴 MT:163-->fetchAllMeetings', {
                status: 'fail',
                error: error,
            });
            throw new Error('MT:130-->Failed to fetchAllMeetings');
        }
    }
);
export const getActiveMeetings = createAsyncThunk<
    FullMeeting[],
    void,
    ThunkApiConfig
>(
    'meetings/getActiveMeetings',
    async (input, { getState, rejectWithValue }) => {
        try {
            let d = new Date();
            const today = d?.toISOString().slice(0, 10);
            const state = getState();
            const filteredMeetings = state.meetings.meetings.filter(
                (m: FullMeeting) => m.meeting_date >= today
            );
            function compareMeetingDates(a: any, b: any): number {
                const dateA = new Date(a.meeting_date);
                const dateB = new Date(b.meeting_date);

                if (dateA < dateB) return -1; // dateA comes before dateB
                if (dateA > dateB) return 1; // dateA comes after dateB
                return 0; // dates are equal
            }

            filteredMeetings.sort(compareMeetingDates);

            // printObject('MT:54-->filteredMeetings:\n', filteredMeetings);
            // Return the filtered meetings
            return filteredMeetings;
        } catch (error: unknown) {
            printObject('MT:getActiveMeetings error', { error });
            return rejectWithValue('Failed to fetch active meetings');
        }
    }
);
export const getHistoricMeetings = createAsyncThunk<
    FullMeeting[],
    void,
    ThunkApiConfig
>(
    'meetings/getHistoricMeetings',
    async (input, { getState, rejectWithValue }) => {
        try {
            let d = new Date();
            const today = d?.toISOString().slice(0, 10);
            const state = getState();
            // printObject('MT:51-->sample:\n', state.allMeetings[0]);
            const filteredMeetings = state.meetings.meetings.filter(
                (m: FullMeeting) => new Date(m.meeting_date) < new Date(today)
            );
            filteredMeetings.sort((a: any, b: any) => {
                // Compare meetingDates (in descending order)
                if (a.meeting_date > b.meeting_date) return -1;
                if (a.meeting_date < b.meeting_date) return 1;

                // If meetingDates are equal, compare titles (in alphabetical order)
                if (a.title < b.title) return -1;
                if (a.title > b.title) return 1;

                // If titles are also equal, no need to change the order
                return 0;
            });
            // printObject('MT:54-->filteredMeetings:\n', filteredMeetings);
            // Return the filtered meetings
            return filteredMeetings;
        } catch (error: unknown) {
            printObject('MT:getHistoricMeetings error', { error });
            return rejectWithValue('Failed to fetch active meetings');
        }
    }
);
export const getMeetingById = createAsyncThunk<
    FullMeeting | Record<string, never>, // Return type (meeting object or empty)
    string, // Argument type (meeting id)
    ThunkApiConfig
>(
    'meetings/getMeetingById',
    async (meetingId, { getState, rejectWithValue }) => {
        try {
            const state = getState();
            const mtg = state.meetings.meetings.filter(
                (m: FullMeeting) => m.id === meetingId
            );
            if (mtg.length === 1) {
                return mtg[0];
            } else {
                return {};
            }
        } catch (error: unknown) {
            printObject('caught error', { error });
            return rejectWithValue('Failed to fetch active meetings');
        }
    }
);

// Backwards-compatible alias: some code (slice) expects `getSpecificMeeting`
export const getSpecificMeeting = getMeetingById;

//************************************************************************************************
//* GET THE MEETING DETAILS
//************************************************************************************************
// Note: detailed fetchMeetingDetailsById implementation is defined later; removed duplicate helper thunk.

export const fetchMeetingDetailsById = createAsyncThunk<
    any,
    FetchMeetingDetailsByIdArgs,
    ThunkApiConfig
>('meetings/fetchMeetingDetailsById', async (inputs, thunkAPI) => {
    try {
        const { apiToken, organizationId, meetingId } = inputs;
        const meetingDetails = await fetchMeetingDetails(
            apiToken,
            organizationId,
            meetingId
        );
        const meeting = isSuccessResponse<FullMeeting>(meetingDetails)
            ? meetingDetails.data
            : ({} as FullMeeting);
        const returnValue = {
            status: '200',
            data: meeting,
        };
        return returnValue;
    } catch (error) {
        printObject('MT:255-->fetchMeetingDetailsById.ts', {
            status: 'fail',
            error: error,
        });
        throw new Error('MT:332-->Failed to fetchMeetingDetailsById');
    }
});
export const saveCurrentMeetingAndGroups = createAsyncThunk<
    any,
    { currentMeeting: any; currentGroups: any[] },
    ThunkApiConfig
>(
    'meetings/saveCurrentMeetingAndGroups',
    async (
        { currentMeeting, currentGroups },
        { getState, rejectWithValue }
    ) => {
        try {
            //* ************************************
            //* save the meeting and [] to current
            //* ************************************
            const summary = {
                currentMeeting: currentMeeting,
                currentGroups: currentGroups,
            };

            const returnValue = {
                status: '200',
                meetingDetails: summary,
            };
            // printObject('MT:128-🟡->returnValue (to Slice)\n', returnValue);
            return returnValue;
        } catch (error: unknown) {
            printObject('caught error', { error });
            printObject('MT:303-->saveCurrentMeetingAndGroups', {
                status: 'fail',
                error: error,
            });
            throw new Error('MT:307-->Failed to saveCurrentMeetingAndGroups');
        }
    }
);
export const getDefaultGroupsFromDB = createAsyncThunk<
    { status: number; payload: { message: string } },
    any,
    ThunkApiConfig
>(
    'meetings/getDefaultGroupsFromDB',
    async (input, { getState, rejectWithValue }) => {
        try {
            console.log('getDefaultGroupsFromDB hit');
            return {
                status: 200,
                payload: {
                    message: 'GOOD',
                },
            };
        } catch (error: unknown) {
            printObject('caught error', { error });
            // Handle errors and optionally return a rejected promise with an error message
            return rejectWithValue('Failed to fetch default meetings');
        }
    }
);
export const addDefaultGroups = createAsyncThunk<
    FullMeeting,
    any,
    ThunkApiConfig
>('meetings/addDefaultGroups', async (inputs, thunkAPI) => {
    try {
        const newGroupList = inputs?.meeting?.groups?.items
            ? [...inputs.meeting.groups.items]
            : [];

        const createGroupPromises = inputs.defaultGroups.map(
            async (dg: Record<string, any>) => {
                const newId = createAWSUniqueID();
                const derivedGrpCompKey = `${inputs.meeting.mtgCompKey}#${inputs.meeting.id}`;
                const inputInfo: any = {
                    ...dg,
                    id: newId,
                    attendance: 0,
                    grpCompKey: derivedGrpCompKey,
                    meetingGroupsId: inputs.meeting.id,
                    organizationGroupsId: inputs.orgId,
                };
                delete inputInfo.createdAt;
                delete inputInfo.updatedAt;
                delete inputInfo.organizationDefaultGroupsId;
                // const results = await API.graphql({
                //     query: mutations.createGroup,
                //     variables: { input: inputInfo },
                // });

                return inputInfo;
            }
        );

        const createdGroups = await Promise.all(createGroupPromises);

        const data = {
            items: [...newGroupList, ...createdGroups],
        };

        data.items.sort((a: any, b: any) => {
            // Keep current order by default (stable) — return 0
            return 0;
        });

        const newGroupsItems = { items: data.items };

        const meetingUpdate = {
            ...inputs.meeting,
            groups: newGroupsItems,
        };

        return meetingUpdate;
    } catch (error: unknown) {
        printObject('caught error', { error });
        printObject('MT:242-->::addDefaultGroups thunk try failure.\n', error);
        throw new Error('MT:245-->addDefaultGroups Failed');
    }
});
//* #####################################
//* saveNewMeeting
//* #####################################
export const saveNewMeeting = createAsyncThunk<
    any,
    { api_token: any; meeting: any },
    ThunkApiConfig
>('meetings/addMeeting', async ({ api_token, meeting }, thunkAPI) => {
    // printObject('MT:391-->inputs:\n', inputs);
    try {
        async function cleanUpData(): Promise<Record<string, any>> {
            // Iterate through the object properties and replace 0 values with null
            for (const key in meeting) {
                if (
                    Object.prototype.hasOwnProperty.call(meeting, key) &&
                    meeting[key] === 0
                ) {
                    meeting[key] = null;
                }
            }
            delete meeting.created_at;
            delete meeting.updated_at;
            const mtg: Record<string, any> = {
                ...meeting,
                organization_id: meeting.organization_id,
                meeting_date: meeting.meeting_date.slice(0, 10),
            };
            return mtg;
        }
        async function convertKeysToSnakeCase(
            obj: Record<string, any>
        ): Promise<Record<string, any>> {
            const newObj: Record<string, any> = {};
            for (const key in obj) {
                const newKey = key
                    .replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
                    .toLowerCase();
                newObj[newKey] = obj[key as keyof typeof obj];
            }
            return newObj;
        }
        //***********************************************
        //* convert mtg from camelCase to snake_case
        //***********************************************

        const cleanData = await cleanUpData();

        const transformedObject = await convertKeysToSnakeCase(cleanData);
        const meetingDetails = await createNewMeeting(
            api_token,
            transformedObject
        );

        if (isSuccessResponse<FullMeeting>(meetingDetails)) {
            const summary = {
                currentMeeting: meetingDetails.data,
                currentGroups: [],
            };
            const returnValue = {
                status: '200',
                meetingDetails: summary,
            };
            return returnValue;
        } else if (isApiError(meetingDetails)) {
            const returnValue = {
                status: String(meetingDetails.status || 500),
                meetingDetails: null,
                message: meetingDetails.message || 'Error createNewMeeting API',
            };
            return returnValue;
        }
        // Fallback: ensure we always return the declared shape
        return {
            status: '500',
            meetingDetails: null,
            message: 'Unexpected createNewMeeting response',
        };
    } catch (error: unknown) {
        printObject('caught error', { error });
        printObject(
            '🔴🔴🔴🔴🔴MT.ts :451-->addMeeting thunk try failure.\n',
            error
        );
        throw new Error('MT:455-->Failed to create meeting');
    }
});

export const addMeeting = createAsyncThunk<
    {
        status: string;
        meetingDetails?: {
            currentMeeting: FullMeeting;
            currentGroups: any[];
        } | null;
    },
    { api_token: any; submit_values: any },
    ThunkApiConfig
>(
    'meetings/addMeetingLegacy',
    async ({ api_token, submit_values }, thunkAPI) => {
        try {
            async function cleanUpData() {
                const meeting = { ...submit_values.meeting };
                // Iterate through the object properties and replace 0 values with null
                for (const key in meeting) {
                    if (meeting.hasOwnProperty(key) && meeting[key] === 0) {
                        meeting[key] = null;
                    }
                }
                delete meeting.created_at;
                delete meeting.updated_at;
                let mtg = {
                    ...meeting,
                    organization_id: submit_values.orgId,
                    meeting_date: meeting.meeting_date.slice(0, 10),
                };
                return mtg;
            }
            async function convertKeysToSnakeCase(
                obj: Record<string, any>
            ): Promise<Record<string, any>> {
                const newObj: Record<string, any> = {};
                for (const key in obj) {
                    const newKey = key
                        .replace(
                            /[A-Z]/g,
                            (letter) => `_${letter.toLowerCase()}`
                        )
                        .toLowerCase();
                    newObj[newKey] = obj[key as keyof typeof obj];
                }
                return newObj;
            }
            //***********************************************
            //* convert mtg from camelCase to snake_case
            //***********************************************
            const cleanData = await cleanUpData();
            const transformedObject = await convertKeysToSnakeCase(cleanData);
            const meetingDetails = await createNewMeeting(
                api_token,
                transformedObject
            );
            if (isSuccessResponse<FullMeeting>(meetingDetails)) {
                const summary = {
                    currentMeeting: meetingDetails.data,
                    currentGroups: [],
                };
                const returnValue = {
                    status: '200',
                    meetingDetails: summary,
                };
                return returnValue;
            } else {
                const returnValue = {
                    status: (meetingDetails as any)?.status,
                    meetingDetails: null,
                    message: 'Error createNewMeeting API',
                };
                return returnValue;
            }
        } catch (error: unknown) {
            printObject('caught error', { error });
            printObject(
                '🔴🔴🔴🔴🔴MT:451-->addMeeting thunk try failure.\n',
                error
            );
            throw new Error('MT:455-->Failed to create meeting');
        }
    }
);
export const deleteGroupFromMeeting = createAsyncThunk<
    { status: number; group_id: string; meeting_id: string },
    { api_token: any; group_id: string; meeting_id: string },
    ThunkApiConfig
>(
    'meetings/deleteGroupFromMeeting',
    async (
        inputs: { api_token: any; group_id: string; meeting_id: string },
        thunkAPI
    ) => {
        const { api_token, group_id, meeting_id } = inputs;
        try {
            //* -----------------------
            //* delete group from gql
            //* -----------------------
            const deleteGroupResponse = await deleteAGroup(api_token, group_id);
            if (isSuccessResponse<any>(deleteGroupResponse)) {
                //todo: NEED TO RETURN MEETING_ID, GROUP_ID
                const results = {
                    status: 200,
                    group_id: group_id,
                    meeting_id: meeting_id,
                };

                return results;
            }
            throw new Error('MT:593-->Failed to deleteGroupFromMeeting');
        } catch (error: unknown) {
            printObject('caught error', { error });
            printObject(
                'MT:596-->deleteGroupFromMeeting thunk try failure.\n',
                error
            );
            throw new Error('MT:284-->Failed to deleteGroupFromMeeting');
        }
    }
);
export const updateMeeting = createAsyncThunk<
    UpdateMeetingType | ApiError,
    { api_token: any; meeting: any },
    ThunkApiConfig
>('meetings/updateMeeting', async ({ api_token, meeting }, thunkAPI) => {
    //* ************************************
    //*   UPDATE MEETING
    //* ************************************
    try {
        async function cleanUpData() {
            // const meeting = { ...submit_values.meeting };
            // We don't convert 0 to null, because update might acknowledge 0
            // for (const key in meeting) {

            delete meeting.created_at;
            delete meeting.updated_at;
            delete meeting.groups;
            let mtg = {
                ...meeting,
                organization_id: meeting.organization_id,
                meeting_date: meeting.meeting_date.slice(0, 10),
            };
            return mtg;
        }
        async function convertKeysToSnakeCase(
            obj: Record<string, any>
        ): Promise<Record<string, any>> {
            const newObj: Record<string, any> = {};
            for (const key in obj) {
                const newKey = key
                    .replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
                    .toLowerCase();
                newObj[newKey] = obj[key as keyof typeof obj];
            }
            return newObj;
        }
        //***********************************************
        //* convert mtg from camelCase to snake_case
        //***********************************************
        const cleanData = await cleanUpData();
        const transformedObject = await convertKeysToSnakeCase(cleanData);

        //***********************************************
        //* calls PUT to update the meeting
        //***********************************************
        const meetingDetails: any = await updateTheMeeting(
            api_token,
            transformedObject
        );
        if (isSuccessResponse<any>(meetingDetails)) {
            return meetingDetails;
        } else if (isApiError(meetingDetails)) {
            const returnValue = {
                status: meetingDetails.status,
                message: meetingDetails.message,
                data: meetingDetails.details,
            };
            return returnValue;
        }
        // Fallback: return ApiError-like object when response shape is unexpected
        return {
            status: 500,
            message: 'Unexpected updateTheMeeting response',
            details: meetingDetails,
        } as ApiError;
    } catch (error) {
        printObject(
            '🔴🔴🔴🔴🔴MT:707-->updateAMeeting thunk try failure.\n',
            error
        );
        throw new Error('MT:710-->Failed to update meeting');
    }
});

export const addGroup = createAsyncThunk<
    { group_id: string; group: any; meetingId: string },
    { api_token: any; group: any; meetingId: string },
    ThunkApiConfig
>('meetings/addGroup', async ({ api_token, group, meetingId }, thunkAPI) => {
    try {
        if (group.id === '0' || !group.id) {
            group.id = createAWSUniqueID();
        }
        // Fetch meeting details to get mtg_comp_key if needed
        // (Assume meetingId is enough for backend, else fetch meeting details here)
        const new_group = {
            ...group,
            meeting_id: meetingId,
        };
        const createNewGroupResponse = await createNewGroup(
            api_token,
            meetingId,
            new_group
        );
        if (
            isSuccessResponse<any>(createNewGroupResponse) &&
            createNewGroupResponse.data &&
            createNewGroupResponse.data.id
        ) {
            // return the created group's id and data so reducers can update state
            return {
                group_id: createNewGroupResponse.data.id,
                group: createNewGroupResponse.data,
                meetingId,
            };
        } else {
            throw new Error('MT:216-->Failed to create group');
        }
    } catch (error: any) {
        // Log the original error and rethrow it so callers can handle/inspect it.
        printObject('MT:741-->addGroup ERROR', { error, group });
        if (error instanceof Error) throw error;
        // If it's an API response object, wrap with a helpful message
        if (
            error &&
            typeof error === 'object' &&
            (error.message || error.status)
        ) {
            const msg = error.message || `API error (status ${error.status})`;
            throw new Error(msg);
        }
        throw new Error('MT:742-->Failed to add group');
    }
});

export const updateGroup = createAsyncThunk<
    (FullGroup & { meeting_id?: string }) | ApiError,
    any,
    ThunkApiConfig
>('meetings/updateGroup', async (inputs: any, thunkAPI) => {
    try {
        printObject('MT:757-->updateGroup__inputs:\n', inputs);
        //************************************************************************************************
        // we only pass object to update.
        //************************************************************************************************
        let group: GroupUpdateType = {
            title: inputs?.group?.title || null,
            location: inputs?.group?.location || null,
            gender: inputs.group.gender || null,
            attendance: inputs.group.attendance || null,
            facilitator: inputs.group.facilitator || null,
            cofacilitator: inputs.group.cofacilitator || null,
            notes: inputs.group.notes || null,
        };
        printObject('MT:776-->group:\n', group);
        //* * * * * * * * * * * * * * * * * * * *
        //* update the group in database
        //* * * * * * * * * * * * * * * * * * * *
        const inputValues = {
            api_token: inputs?.api_token,
            group_id: inputs?.group_id,
            group: group,
        };
        const groupUpdateResponse: any = await updateAGroup(inputValues);
        if (isSuccessResponse<any>(groupUpdateResponse)) {
            console.log('🍽️🍽️-status===200');
            // Return the updated group with meeting_id for the slice to use
            const updatedGroup = {
                ...groupUpdateResponse.data,
                meeting_id: inputs?.meeting_id,
            };
            return updatedGroup;
        } else {
            printObject('MT:791-->groupUpdateResponse:\n', groupUpdateResponse);
            throw new Error('Failed to update group');
        }

        // let inputInfo = {
        //     ...inputs.group,
        //     id: inputs.group.groupId,
        //     meetingGroupsId: inputs.group.meetingId,
        //     organizationGroupsId: inputs.orgId,
        // };
        // //* remove unsupported values
        // delete inputInfo.meetingId;
        // delete inputInfo.groupId;
        // const results = await API.graphql({
        //     query: mutations.updateGroup,
        //     variables: { input: inputInfo },
        // });
        // if (results.data.updateGroup.id) {
        //     const resultDef = {
        //         group: inputInfo,
        //         meetingId: inputs.group.meetingId,
        //     };
        //     return resultDef;
        // } else {
        //     throw new Error('MT:208-->Failed to update meeting');
        // }
    } catch (error: unknown) {
        printObject('MT:409-->updateGroup FAILURE', { inputs, error });
        // Rethrow the error to let createAsyncThunk handle it
        throw new Error('MT:411-->Failed to update group');
    }
});
interface DeleteInputType {
    api_token: any;
    organization_id: string;
    meeting_id: string;
}
interface DeleteAMeetingResponse {
    status: number;
    message: string;
    data: any;
}
export const deleteMeeting = createAsyncThunk<
    any,
    DeleteInputType,
    ThunkApiConfig
>('meetings/deleteMeeting', async (inputs: DeleteInputType, thunkAPI) => {
    try {
        //* -----------------------
        //* this will get an object
        //* with id (meeting) and
        //* organization_id
        const { api_token, organization_id, meeting_id } = inputs;

        //* ************************************************
        //* delete the meeting
        //* ************************************************

        const deleteMeetingResponse: DeleteAMeetingResponse | ApiError =
            await deleteAMeeting(api_token, organization_id, meeting_id);

        if (!isSuccessResponse<any>(deleteMeetingResponse)) {
            console.log(`MT:801 --> Failed to delete meeting with: ${inputs}`);
            printObject(
                'MT:803-->deleteMeetingResponse:\n',
                deleteMeetingResponse
            );
            throw new Error('MT:638-->Failed to delete the meeting');
        }
        return deleteMeetingResponse;
    } catch (error) {
        printObject('MT:477-->deleteMeeting thunk try failure.\n', error);
        throw new Error('MT:478-->Failed to deleteMeeting');
    }
});

export const fetchNextHistoricPage = createAsyncThunk(
    'meetings/nextHistoricPage',
    async ({ api_token }: any, thunkAPI: any) => {
        try {
            // Note: getNextHistoricPage requires apiToken and org_id; org_id not available here.
            // If you need to fetch prior meetings you'll need to pass org_id into this thunk.
            // const priorMeetings = await getNextHistoricPage(api_token, org_id);
        } catch (error: unknown) {
            console.log('CATCH', error);
        }
    }
);
//*************************************************
//* THIS LOADS ALL THE ACTIVE MEETINGS
//*************************************************
export const refreshActiveMeetings = createAsyncThunk<
    {
        status: string;
        meetingInfo: {
            activeMeetings: FullMeeting[];
            activeCurrentPage: number;
            activeLastPage: number;
        };
    },
    any,
    ThunkApiConfig
>('meetings/fetchActiveMeetings', async (inputs: any, thunkAPI) => {
    try {
        //* ************************************
        //* get all activeMeetings
        //* ************************************
        const { apiToken, org_id } = inputs;
        const activeMeetingInfo = await fetchActiveMeetings(apiToken, org_id);
        const activeMeetingsArray = isSuccessResponse<any[]>(activeMeetingInfo)
            ? activeMeetingInfo.data
            : [];
        const summary = {
            activeMeetings: [...activeMeetingsArray],
            activeCurrentPage: isSuccessResponse(activeMeetingInfo)
                ? (activeMeetingInfo as any).currentPage
                : 1,
            activeLastPage: isSuccessResponse(activeMeetingInfo)
                ? (activeMeetingInfo as any).lastPage
                : 1,
        };
        const returnValue = {
            status: '200',
            meetingInfo: summary,
        };
        return returnValue;
    } catch (error) {
        printObject('🔴 MT:1116-->fetchActiveMeetings', {
            status: 'fail',
            error: error,
        });
        throw new Error('MT:1120-->Failed to fetchActiveMeetings');
    }
});
//*************************************************
//* THIS LOADS A HISTORIC PAGE TO REDUX
//*************************************************
export const loadHistoricPage = createAsyncThunk<
    {
        status: number;
        additionalMeetings: FullMeeting[];
        historic_current_page: number;
    },
    any,
    ThunkApiConfig
>('meetings/loadHistoricPage', async (inputs: any, thunkAPI) => {
    try {
        //* ************************************
        //* get historic page
        // api_token
        // organization_id
        // default_organization
        // page
        //* ************************************
        const { api_token, organization_id, page } = inputs;
        // console.log('MT:1141-->api_token', api_token);
        // console.log('MT:1142-->organization_id', organization_id);
        // console.log('MT:1143-->default_organization', default_organization);
        // console.log('MT:1149-->page', page);
        const response = await fetchHistoricPage(
            api_token,
            organization_id,
            page
        );
        if (isSuccessResponse<RequestedPageType>(response)) {
            // Response is of type RequestedPageType inside response.data
            const requestedPage: RequestedPageType =
                response.data as RequestedPageType;
            // printObject('🏴󠁧󠁢󠁳󠁣󠁴󠁿🏴󠁧󠁢󠁳󠁣󠁴󠁿🏴󠁧󠁢󠁳󠁣󠁴󠁿 MT:1158-->requestedPage:', requestedPage);
            const current_page = requestedPage.currentPage + 1;
            if (requestedPage.status === 200) {
                return {
                    status: requestedPage.status,
                    additionalMeetings: requestedPage.data,
                    historic_current_page: current_page,
                };
            }
            // If not 200, throw to make the thunk reject
            throw new Error('Unexpected status when loading historic page');
        } else {
            printObject('🔴 MT:1168-->loadHistoricPage', {
                error: 'unexpected response from meetingsAPI',
                response,
            });
            throw new Error('MT:1172-->Failed to loadHistoricPage');
        }
    } catch (error) {
        printObject('🔴 MT:1175-->loadHistoricPage', {
            status: 'fail',
            error: error,
        });
        throw new Error('MT:1179-->Failed to loadHistoricPage');
    }
});
