import { createAsyncThunk } from '@reduxjs/toolkit';
// import axios from 'axios';
import { API, graphqlOperation } from 'aws-amplify';
import * as queries from '../../jerichoQL/queries';
import * as gQueries from '../../graphql/queries';
import * as mutations from '../../jerichoQL/mutations';
import * as gMutations from '../../graphql/mutations';
import { createAWSUniqueID, printObject } from '../../utils/helpers';
import groupsSlice from '../groups/groupsSlice';
import {
    fetchActiveMeetings,
    fetchHistoricMeetings,
    fetchMeetingDetails,
    createNewMeeting,
    deleteAMeeting,
    updateTheMeeting,
    createNewGroup,
    deleteAGroup,
    updateAGroup,
    fetchHistoricPage,
} from './meetingsAPI';
import {
    MeetingType,
    GroupType,
    ApiError,
    groupUpdateResponseType,
} from '../../gauchoTypes';
interface MeetingDetailsResponse {
    data: {
        currentMeeting: MeetingType;
    };
}
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
    // Ensure no typos
    apiToken: string;
    meeting_id: string;
}
type RequestedPageType = {
    status: number;
    data: MeetingType[];
    currentPage: number;
    lastPage: number;
};
export const getSpecificMeeting = createAsyncThunk(
    'meetings/getSpecificMeeting',
    async (id, thunkAPI) => {
        return id;
    }
);
export const getAllMeetings = createAsyncThunk(
    'meetings/getAllMeetings',
    async (inputs: any, thunkAPI) => {
        try {
            const oId = inputs.orgId;
            const code = inputs.code;
            const meetingList = await API.graphql({
                query: queries.listMeetings,
                variables: {
                    filter: {
                        organizationMeetingsId: {
                            eq: inputs.orgId,
                        },
                    },
                },
            });

            // Sort meetings by multiple criteria
            const sortedMeetings = meetingList?.data?.listMeetings?.items
                ? meetingList.data.listMeetings.items.sort((a, b) => {
                      // First, compare by meetingDate in descending order
                      const dateComparison = b.meetingDate.localeCompare(
                          a.meetingDate
                      );
                      if (dateComparison !== 0) {
                          return dateComparison;
                      }

                      // Then, compare by meetingType in ascending order
                      const typeComparison = a.meetingType.localeCompare(
                          b.meetingType
                      );
                      if (typeComparison !== 0) {
                          return typeComparison;
                      }

                      // Finally, compare by title in ascending order
                      return a.title.localeCompare(b.title);
                  })
                : [];
            const allTheMeetingsSorted = sortedMeetings;

            const today = new Date();
            today.setHours(0, 0, 0, 0); // Set time to midnight
            const year = today.getFullYear(); // Get the year (e.g., 2023)
            const month = String(today.getMonth() + 1).padStart(2, '0'); // Get the month (e.g., 09) and pad with 0 if needed
            const day = String(today.getDate()).padStart(2, '0'); // Get the day (e.g., 24) and pad with 0 if needed
            const target = `${code}#${year}#${month}#${day}`;
            const summary = {
                all: [],
                active: [],
                historic: [],
            };
            allTheMeetingsSorted.forEach((meeting) => {
                if (meeting.mtgCompKey >= target) {
                    summary.active.push(meeting);
                } else {
                    summary.historic.push(meeting);
                }
                summary.all.push(meeting);
            });
            summary.active.sort((a, b) =>
                a.mtgCompKey < b.mtgCompKey ? -1 : 1
            );

            // printObject('MT:109-->summary:\n', summary);
            const returnValue = {
                status: '200',
                meetings: summary,
            };
            return returnValue;
        } catch (error) {
            printObject('MT:29-->getAllMeetingsG', { status: 'fail' });
            throw new Error('MT:30-->Failed to getAllMeetingsG');
        }
    }
);

//*************************************************
//* THIS LOADS ALL FROM SIGN IN
//*************************************************
export const fetchAllMeetings = createAsyncThunk(
    'meetings/fetchAllMeetings',
    async (inputs: any, thunkAPI) => {
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

            const summary = {
                all: [],
                activeMeetings: [...activeMeetingInfo.data],
                activeCurrentPage: activeMeetingInfo?.currentPage,
                activeLastPage: activeMeetingInfo?.lastPage,
                historicMeetings: [...historicMeetingInfo.data],
                historicCurrentPage: historicMeetingInfo?.currentPage,
                historicLastPage: historicMeetingInfo?.lastPage,
            };
            const returnValue = {
                status: '200',
                meetingInfo: summary,
            };
            return returnValue;
        } catch (error) {
            printObject('🔴 MT:129-->fetchAllMeetings', {
                status: 'fail',
                error: error,
            });
            throw new Error('MT:130-->Failed to fetchAllMeetings');
        }
    }
);
export const getActiveMeetings = createAsyncThunk(
    'meetings/getActiveMeetings',
    async (input, { getState, rejectWithValue }) => {
        try {
            var d = new Date();
            const today = d?.toISOString().slice(0, 10);
            const state = getState();
            const filteredMeetings = state.meetings.meetings.filter(
                (m) => m.meetingDate >= today
            );
            function compareMeetingDates(a, b) {
                const dateA = new Date(a.meetingDate);
                const dateB = new Date(b.meetingDate);

                if (dateA < dateB) return -1; // dateA comes before dateB
                if (dateA > dateB) return 1; // dateA comes after dateB
                return 0; // dates are equal
            }

            filteredMeetings.sort(compareMeetingDates);

            // printObject('MT:54-->filteredMeetings:\n', filteredMeetings);
            // Return the filtered meetings
            return filteredMeetings;
        } catch (error) {
            // Handle errors and optionally return a rejected promise with an error message
            return rejectWithValue('Failed to fetch active meetings');
        }
    }
);
export const getHistoricMeetings = createAsyncThunk(
    'meetings/getHistoricMeetings',
    async (input, { getState, rejectWithValue }) => {
        try {
            var d = new Date();
            const today = d?.toISOString().slice(0, 10);
            const state = getState();
            // printObject('MT:51-->sample:\n', state.allMeetings[0]);
            const filteredMeetings = state.meetings.meetings.filter(
                (m) => new Date(m.meetingDate) < new Date(today)
            );
            filteredMeetings.sort((a, b) => {
                // Compare meetingDates (in descending order)
                if (a.meetingDate > b.meetingDate) return -1;
                if (a.meetingDate < b.meetingDate) return 1;

                // If meetingDates are equal, compare titles (in alphabetical order)
                if (a.title < b.title) return -1;
                if (a.title > b.title) return 1;

                // If titles are also equal, no need to change the order
                return 0;
            });
            // printObject('MT:54-->filteredMeetings:\n', filteredMeetings);
            // Return the filtered meetings
            return filteredMeetings;
        } catch (error) {
            // Handle errors and optionally return a rejected promise with an error message
            return rejectWithValue('Failed to fetch active meetings');
        }
    }
);
export const getMeetingById = createAsyncThunk(
    'meetings/getMeetingById',
    async (input, { getState, rejectWithValue }) => {
        try {
            // console.log('MT:100-->getMeetingById...input:', input);
            const state = getState();

            const mtg = state.meetings.meetings.filter((m) => m.id === input);
            // Return the filtered meetings
            if (mtg.length === 1) {
                return mtg[0];
            } else {
                return [];
            }
        } catch (error) {
            // Handle errors and optionally return a rejected promise with an error message
            return rejectWithValue('Failed to fetch active meetings');
        }
    }
);

//************************************************************************************************
//* GET THE MEETING DETAILS
//************************************************************************************************
export const NEWfetchMeetingDetailsById = createAsyncThunk(
    'meetings/fetchMeetingDetailsById',
    async (inputs: any, thunkAPI) => {
        const { apiToken, org_id, meeting_id } = inputs;
        const meetingDetails = await fetchMeetingDetails(
            apiToken,
            org_id,
            meeting_id
        );
        const meeting = meetingDetails.data.data;
        printObject('🟡🟡🟡🟡🟡 MT:250 ~ meeting:', meeting);
        //* extract groups
        const groups = [...meeting.groups] || [];
        delete meeting.groups;
        const summary = {
            currentMeeting: meeting,
            currentGroups: [...groups],
        };

        const returnValue = {
            status: '200',
            meetingDetails: summary,
        };
        // printObject('MT:128-🟡->returnValue (to Slice)\n', returnValue);
        return returnValue;
    }
);

export const fetchMeetingDetailsById = createAsyncThunk<
    // Correct usage
    MeetingDetailsResponse, // Return type
    FetchMeetingDetailsByIdArgs // Argument type
>('meetings/fetchMeetingDetailsById', async (inputs, thunkAPI) => {
    try {
        const { api_token, organization_id, meeting_id } = inputs;
        //* ************************************
        //* get all fetchMeetingDetails
        //* ************************************

        const meetingDetails = await fetchMeetingDetails(
            api_token,
            organization_id,
            meeting_id
        );

        const meeting = meetingDetails.data.data;
        // printObject('🟡🟡🟡🟡🟡 MT:282 ~ meeting:', meeting);
        // const groups = [...meeting.groups] || [];
        // delete meeting.groups;
        // const summary = {
        //     currentMeeting: meeting,
        //     // currentGroups: [...groups],
        // };

        const returnValue = {
            status: '200',
            data: meeting,
        };
        // printObject('MT:128-🟡->returnValue (to Slice)\n', returnValue);
        return returnValue;
    } catch (error) {
        printObject('MT:255-->fetchMeetingDetailsById.ts', {
            status: 'fail',
            error: error,
        });
        throw new Error('MT:332-->Failed to fetchMeetingDetailsById');
    }
});
export const saveCurrentMeetingAndGroups = createAsyncThunk(
    'meetings/saveCurrentMeetingAndGroups',
    async (
        { currentMeeting, currentGroups },
        { getState, rejectWithValue }
    ) => {
        try {
            //* ************************************
            //* save the meeting and [] to current
            //* ************************************
            const groups = [];
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
        } catch (error) {
            printObject('MT:303-->saveCurrentMeetingAndGroups', {
                status: 'fail',
                error: error,
            });
            throw new Error('MT:307-->Failed to saveCurrentMeetingAndGroups');
        }
    }
);
export const getDefaultGroupsFromDB = createAsyncThunk(
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
        } catch (error) {
            // Handle errors and optionally return a rejected promise with an error message
            return rejectWithValue('Failed to fetch default meetings');
        }
    }
);
export const addDefaultGroups = createAsyncThunk(
    'meetings/addDefaultGroups',
    async (inputs, thunkAPI) => {
        try {
            const newGroupList = inputs?.meeting?.groups?.items
                ? [...inputs.meeting.groups.items]
                : [];

            const createGroupPromises = inputs.defaultGroups.map(async (dg) => {
                const newId = createAWSUniqueID();
                const derivedGrpCompKey = `${inputs.meeting.mtgCompKey}#${inputs.meeting.id}`;
                const inputInfo = {
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
                const results = await API.graphql({
                    query: mutations.createGroup,
                    variables: { input: inputInfo },
                });

                return inputInfo;
            });

            const createdGroups = await Promise.all(createGroupPromises);

            const data = {
                items: [...newGroupList, ...createdGroups],
            };

            data.items.sort((a, b) => {
                // Sorting logic remains the same
            });

            const newGroupsItems = { items: data.items };

            const meetingUpdate = {
                ...inputs.meeting,
                groups: newGroupsItems,
            };

            return meetingUpdate;
        } catch (error) {
            printObject(
                'MT:242-->::addDefaultGroups thunk try failure.\n',
                error
            );
            throw new Error('MT:245-->addDefaultGroups Failed');
        }
    }
);
//* #####################################
//* saveNewMeeting
//* #####################################
export const saveNewMeeting = createAsyncThunk(
    'meetings/addMeeting',
    async ({ api_token, meeting }, thunkAPI) => {
        // printObject('MT:391-->inputs:\n', inputs);
        try {
            async function cleanUpData() {
                // const meeting = { ...meeting };

                // printObject(
                //     '🟨 => file: meetingsThunks.ts:398 => cleanUpData => meeting:',
                //     meeting
                // );

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
                    organization_id: meeting.organization_id,
                    meeting_date: meeting.meeting_date.slice(0, 10),
                };
                return mtg;
            }
            async function convertKeysToSnakeCase(obj) {
                const newObj = {};
                for (const key in obj) {
                    const newKey = key
                        .replace(
                            /[A-Z]/g,
                            (letter) => `_${letter.toLowerCase()}`
                        )
                        .toLowerCase();
                    newObj[newKey] = obj[key];
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

            if (meetingDetails?.status === 200) {
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
                    status: meetingDetails.status,
                    meetingDetails: null,
                    message: 'Error createNewMeeting API',
                };
            }
        } catch (error) {
            printObject(
                '🔴🔴🔴🔴🔴MT.ts :451-->addMeeting thunk try failure.\n',
                error
            );
            throw new Error('MT:455-->Failed to create meeting');
        }
    }
);

export const addMeeting = createAsyncThunk(
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
            async function convertKeysToSnakeCase(obj) {
                const newObj = {};
                for (const key in obj) {
                    const newKey = key
                        .replace(
                            /[A-Z]/g,
                            (letter) => `_${letter.toLowerCase()}`
                        )
                        .toLowerCase();
                    newObj[newKey] = obj[key];
                }
                return newObj;
            }
            //***********************************************
            //* convert mtg from camelCase to snake_case
            //***********************************************
            const cleanData = await cleanUpData();
            const transformedObject = await convertKeysToSnakeCase(cleanData);
            const meetingDetails = await createNewMeeting(
                apiToken,
                transformedObject
            );
            if (meetingDetails.status === 200) {
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
                    status: meetingDetails.status,
                    meetingDetails: null,
                    message: 'Error createNewMeeting API',
                };
            }
        } catch (error) {
            printObject(
                '🔴🔴🔴🔴🔴MT:451-->addMeeting thunk try failure.\n',
                error
            );
            throw new Error('MT:455-->Failed to create meeting');
        }
    }
);
export const deleteGroupFromMeeting = createAsyncThunk(
    'meetings/deleteGroupFromMeeting',
    async (inputs: any, thunkAPI) => {
        const { api_token, group_id, meeting_id } = inputs;
        try {
            //* -----------------------
            //* delete group from gql
            //* -----------------------
            const deleteGroupResponse = await deleteAGroup(api_token, group_id);
            if (deleteGroupResponse.status === 200) {
                //todo: NEED TO RETURN MEETING_ID, GROUP_ID
                const results = {
                    status: 200,
                    group_id: group_id,
                    meeting_id: meeting_id,
                };

                return results;
            }
            throw new Error('MT:593-->Failed to deleteGroupFromMeeting');
        } catch (error) {
            printObject(
                'MT:596-->deleteGroupFromMeeting thunk try failure.\n',
                error
            );
            throw new Error('MT:284-->Failed to deleteGroupFromMeeting');
        }
    }
);
export const updateMeeting = createAsyncThunk(
    'meetings/updateMeeting',
    async ({ api_token, meeting }, thunkAPI) => {
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
            async function convertKeysToSnakeCase(obj) {
                const newObj = {};
                for (const key in obj) {
                    const newKey = key
                        .replace(
                            /[A-Z]/g,
                            (letter) => `_${letter.toLowerCase()}`
                        )
                        .toLowerCase();
                    newObj[newKey] = obj[key];
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
            type UpdatedMeetingType = {
                status: number;
                message: string;
                data: {
                    meeting: MeetingType;
                };
            };

            const meetingDetails: any = await updateTheMeeting(
                api_token,
                transformedObject
            );
            const returnMeeting = meetingDetails?.data;

            if (meetingDetails?.status === 200) {
                return meetingDetails;
            } else {
                const returnValue = {
                    status: meetingDetails.status,
                    message: meetingDetails.message,
                    data: meetingDetails.data,
                };
            }
        } catch (error) {
            printObject(
                '🔴🔴🔴🔴🔴MT:707-->updateAMeeting thunk try failure.\n',
                error
            );
            throw new Error('MT:710-->Failed to update meeting');
        }
    }
);

export const addGroup = createAsyncThunk(
    'meetings/addGroup',
    async ({ api_token, group, meeting }, thunkAPI) => {
        try {
            // printObject('MT:351-->inputs:\n', inputs);
            if (group.id === '0') {
                delete group.id;
                const newId = createAWSUniqueID();
                group.id = newId;
            }
            let inputInfo = {
                api_token: api_token,
                meeting: meeting,
                group: group,
            };
            //==========================================
            // create the object to add
            //==========================================
            // {
            //     "grp_comp_key": "",
            //     "title": "Tarheels",
            //     "location": "North Carolina",
            //     "gender": "f",
            //     "attendance": 4,
            //     "facilitator": "unknown",
            //     "cofacilitator": null,
            //     "notes": null,
            //     "meeting_id": "411561aa-54a3-422b-8de6-808a9cfba5f2"
            // }
            //*------------------------
            // create grp_comp_key
            //*------------------------
            const gck = `${meeting.mtg_comp_key}#${meeting.id}`;
            const new_group = {
                meeting_id: meeting.id,
                grp_comp_key: gck,
                title: group.title,
                location: group.location,
                gender: group.gender,
                attendance: group.attendance,
                facilitator: group.facilitator,
                cofacilitator: group.cofacilitator,
                notes: group.notes,
            };

            // call the API to insert into the database
            //* vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv...
            //    ADD NEW GROUP API CALL HERE CALLED createNewGroup
            //*  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
            const createNewGroupResponse = await createNewGroup(
                api_token,
                meeting,
                new_group
            );

            if (createNewGroupResponse.data.id) {
                return inputInfo;
            } else {
                // If data.createGroup.id is missing, handle the error
                throw new Error('MT:216-->Failed to create group');
            }
        } catch (error) {
            printObject('MT:235-->addGroup', inputs.group);
            // Rethrow the error to let createAsyncThunk handle it
            throw new Error('MT:236-->Failed to add group');
        }
    }
);

export const updateGroup = createAsyncThunk(
    'meetings/updateGroup',
    async (inputs: any, thunkAPI) => {
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
            if (groupUpdateResponse?.status === 200) {
                console.log('🍽️🍽️-status===200');
                // Return the updated group with meeting_id for the slice to use
                const updatedGroup = {
                    ...groupUpdateResponse.data,
                    meeting_id: inputs?.meeting_id,
                };
                return updatedGroup;
            } else {
                printObject(
                    'MT:791-->groupUpdateResponse:\n',
                    groupUpdateResponse
                );
                throw new Error('Failed to update group');
            }
            printObject('MT:780-->groupUpdateResponse:\n', groupUpdateResponse);
            console.log('meeting_id:', inputs?.meeting_id);
            console.log('group_id:', inputs?.group_id);

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
        } catch (error) {
            printObject('MT:409-->updateGroup FAILURE', inputs);
            // Rethrow the error to let createAsyncThunk handle it
            throw new Error('MT:411-->Failed to update group');
        }
    }
);
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
export const deleteMeeting = createAsyncThunk(
    'meetings/deleteMeeting',
    async (inputs: DeleteInputType, thunkAPI) => {
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

            if (deleteMeetingResponse.status !== 200) {
                console.log(
                    `MT:801 --> Failed to delete meeting with: ${inputs}`
                );
                printObject(
                    'MT:803-->deleteMeetingResponse:\n',
                    deleteMeetingResponse
                );
                // If meeting deletion fails, you can choose to handle it here (e.g., show an error message) or throw an error.
                throw new Error('MT:638-->Failed to delete the meeting');
            }
            return deleteMeetingResponse;
        } catch (error) {
            printObject('MT:477-->deleteMeeting thunk try failure.\n', error);
            throw new Error('MT:478-->Failed to deleteMeeting');
        }
    }
);
export const subscriptionCreateMeeting = createAsyncThunk(
    'meetings/subscriptionCreateMeeting',
    async (input, thunkAPI) => {
        try {
            //*===========================================
            //* subscription input will be json object
            //* required field is "__typename": "Meeting"
            //*===========================================
            const meeting = input.meeting;
            const activeOrgId = input.activeOrgId;
            if (meeting?.__typename === 'Meeting') {
                const mtg = meeting;
                delete mtg.__typename;
                delete mtg.groups;
                delete mtg.updatedAt;
                delete mtg.createdAt;
                // printObject('MT:530-->newSubscription', mtg);
                return {
                    meeting: mtg,
                    activeOrgId: activeOrgId,
                };
            } else {
                throw new Error('MT:515-->Failed to create meeting');
            }
        } catch (error) {
            printObject(
                'MT:519-->subscriptionCreateMeeting thunk try failure.\n',
                error
            );
            throw new Error('MT:522-->Failed to createMeeting');
        }
    }
);
export const subscriptionDeleteMeeting = createAsyncThunk(
    'meetings/subscriptionDeleteMeeting',
    async (input, thunkAPI) => {
        try {
            //*===========================================
            //* subscription input will be json object
            //* required field is "__typename": "Meeting"
            //*===========================================
            printObject('MT:533-->input:\n', input);
            return { id: input.id };
            // const meeting = input.meeting;
            // const activeOrgId = input.activeOrgId;
            // if (meeting?.__typename === 'Meeting') {
            //     const mtg = meeting;
            //     delete mtg.__typename;
            //     delete mtg.groups;
            //     delete mtg.updatedAt;
            //     delete mtg.createdAt;
            //     // printObject('MT:530-->newSubscription', mtg);
            //     return {
            //         meeting: mtg,
            //         activeOrgId: activeOrgId,
            //     };
            // } else {
            //     throw new Error('MT:515-->Failed to delete meeting');
            // }
        } catch (error) {
            printObject(
                'MT:553-->subscriptionDeleteMeeting thunk try failure.\n',
                error
            );
            throw new Error('MT:556-->Failed to deleteMeeting');
        }
    }
);
export const subscriptionUpdateMeeting = createAsyncThunk(
    'meetings/subscriptionUpdateMeeting',
    async (input, thunkAPI) => {
        try {
            //*===========================================
            //* subscription input will be json object
            //* required field is "__typename": "Meeting"
            //*===========================================
            const theMeeting = input;
            delete theMeeting.organization.name;
            return theMeeting;
        } catch (error) {
            printObject(
                'MT:574-->subscriptionUpdateMeeting thunk try failure.\n',
                error
            );
            throw new Error('MT:577-->Failed to subscriptionUpdateMeeting');
        }
    }
);
export const subscriptionCreateGroup = createAsyncThunk(
    'meetings/subscriptionCreateGroup',
    async (input, thunkAPI) => {
        try {
            //*===========================================
            //* NOTE: only add group if id does not exist
            //* in meeting.groups.index array
            //*===========================================
            const theGroup = input;
            //* remove the meeting and organization items
            const theGroupWithoutMeetingAndOrganization = {
                ...theGroup,
                meeting: undefined,
                organization: undefined,
            };
            return theGroupWithoutMeetingAndOrganization;
        } catch (error) {
            printObject(
                'MT:594-->subscriptionCreateGroup thunk try failure.\n',
                error
            );
            throw new Error('MT:597-->Failed to subscriptionCreateGroup');
        }
    }
);
export const subscriptionUpdateGroup = createAsyncThunk(
    'meetings/subscriptionUpdateGroup',
    async (input, thunkAPI) => {
        try {
            //*===========================================
            //* NOTE: subscriptions do not update GQL
            //* only update the REDUX state
            //*===========================================
            const theGroup = input;
            //* clean up group object
            delete theGroup?.meeting;
            delete theGroup?.organization;
            delete theGroup?.createdAt;
            delete theGroup?.updatedAt;
            delete theGroup?.__typename;

            const updatedGroup = {
                ...theGroup,
            };

            return updatedGroup;
        } catch (error) {
            printObject(
                'MT:614-->subscriptionUpdateGroup thunk try failure.\n',
                error
            );
            throw new Error('MT:617-->Failed to subscriptionUpdateGroup');
        }
    }
);
export const subscriptionDeleteGroup1 = createAsyncThunk(
    'meetings/subscriptionDeleteGroup',
    async (input, thunkAPI) => {
        try {
            //*===========================================
            //* NOTE: subscriptions do not update GQL
            //* only update the REDUX state.
            //* GRAPHQL delete subscriptions only provide
            //* the id. So will need to check if the id
            //* is even used in this affiliation.
            //*===========================================
            const state = thunkAPI.getState();
            //get all the current meetings
            const meetings = state.meetings.meetings;
            let meetingIdFound = null;
            console.log('input.groupId:', input.groupId);
            const doesExist = meetings.some((meeting) => {
                if (meeting.groups.items) {
                    // Use Array.prototype.some() to check if an item with the specified id exists
                    return meeting.groups.items.some(
                        (item) => item.id === input.groupId
                    );
                }
                return false;
            });
            console.log('group exists: ', doesExist);
            if (doesExist) {
                console.log('true if');
                return { groupId: input.groupId };
            } else {
                console.log('false if');
                throw new Error('MT:661-->subscriptionDeleteGroup ignored');
            }
        } catch (error) {
            printObject(
                'MT:682-->subscriptionDeleteGroup thunk try failure.\n',
                error
            );
            throw new Error('MT:670-->Failed to subscriptionDeleteGroup');
        }
    }
);
export const subscriptionDeleteGroup = createAsyncThunk(
    'meetings/subscriptionDeleteGroup',
    async (input, thunkAPI) => {
        const state = thunkAPI.getState();
        const meetings = state.meetings.meetings;

        const doesExist = meetings.some((meeting) => {
            if (meeting.groups.items) {
                return meeting.groups.items.some(
                    (item) => item.id === input.groupId
                );
            }
            return false;
        });

        if (doesExist) {
            return { groupId: input.groupId };
        } else {
            throw new Error('MT:661-->subscriptionDeleteGroup ignored');
        }
    }
);
export const fetchNextHistoricPage = createAsyncThunk(
    'meetings/nextHistoricPage',
    async ({ api_token }, thunkAPI) => {
        try {
            const priorMeetings = await getNextHistoricPage(api_token);
        } catch (error) {
            console.log('CATCH');
        }
    }
);
//*************************************************
//* THIS LOADS ALL THE ACTIVE MEETINGS
//*************************************************
export const refreshActiveMeetings = createAsyncThunk(
    'meetings/fetchActiveMeetings',
    async (inputs: any, thunkAPI) => {
        try {
            //* ************************************
            //* get all activeMeetings
            //* ************************************
            const { apiToken, org_id } = inputs;
            const activeMeetingInfo = await fetchActiveMeetings(
                apiToken,
                org_id
            );
            const summary = {
                activeMeetings: [...activeMeetingInfo.data],
                activeCurrentPage: activeMeetingInfo?.currentPage,
                activeLastPage: activeMeetingInfo?.lastPage,
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
    }
);
//*************************************************
//* THIS LOADS A HISTORIC PAGE TO REDUX
//*************************************************
export const loadHistoricPage = createAsyncThunk(
    'meetings/loadHistoricPage',
    async (inputs: any, thunkAPI) => {
        try {
            //* ************************************
            //* get historic page
            // api_token
            // organization_id
            // default_organization
            // page
            //* ************************************
            const { api_token, organization_id, default_organization, page } =
                inputs;
            // console.log('MT:1141-->api_token', api_token);
            // console.log('MT:1142-->organization_id', organization_id);
            // console.log('MT:1143-->default_organization', default_organization);
            // console.log('MT:1149-->page', page);
            const response = await fetchHistoricPage(
                api_token,
                organization_id,
                page
            );
            if ('status' in response && response.status === 200) {
                // Response is of type RequestedPageType
                const requestedPage: RequestedPageType = response;
                // printObject('🏴󠁧󠁢󠁳󠁣󠁴󠁿🏴󠁧󠁢󠁳󠁣󠁴󠁿🏴󠁧󠁢󠁳󠁣󠁴󠁿 MT:1158-->requestedPage:', requestedPage);
                const current_page = requestedPage.currentPage + 1;
                if (requestedPage.status === 200) {
                    return {
                        status: requestedPage.status,
                        additionalMeetings: requestedPage.data,
                        historic_current_page: current_page,
                    };
                }
                // ... rest of your logic ...
            } else {
                printObject('🔴 MT:1168-->loadHistoricPage', {
                    status: response.status,
                    error: 'unexpected response from meetingsAPI',
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
    }
);
