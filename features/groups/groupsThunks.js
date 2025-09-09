import { createAsyncThunk } from '@reduxjs/toolkit';
import { API } from 'aws-amplify';
import * as queries from '../../jerichoQL/queries';
import * as mutations from '../../jerichoQL/mutations';
import {
    createAWSUniqueID,
    createUniqueID,
    printObject,
} from '../../utils/helpers';
import {
    fetchDefaultGroups,
    deleteADefaultGroup,
    updateADefaultGroup,
    createNewDefaultGroup,
} from './groupsAPI';
const config = {
    headers: {
        'Content-type': 'application/json; charset=UTF-8',
    },
};
export const loadDefaultGroups = createAsyncThunk(
    'groups/loadDefaultGroups',
    async (inputs, thunkAPI) => {
        try {
            const { api_token, organization_id } = inputs;
            const defaultGroups = await fetchDefaultGroups(
                api_token,
                organization_id
            );
            if (defaultGroups?.status === 200) {
                return {
                    status: 200,
                    groups: defaultGroups.data,
                };
            } else {
                printObject('GT:37-->loadDefaultGroups', {
                    status: 404,
                    message: 'no default groups',
                    payload: defaultGroups,
                });
                throw new Error('GT:42-->Failed to load default groups');
            }
            // const systemInfo = await API.graphql({
            //     query: queries.getOrganizationDefaultGroups,
            //     variables: { id: inputs.id },
            // });
            // const defaultGroups =
            //     systemInfo.data.getOrganization.defaultGroups.items;
            // return defaultGroups;
        } catch (error) {
            printObject('GT:52-->loadDefaultGroups', { status: fail });
            throw new Error('GT:53-->Failed to load default groups');
        }
    }
);
export const deleteDefaultGroup = createAsyncThunk(
    'groups/deleteDefaultGroup',
    async (inputs, thunkAPI) => {
        const { api_token, group_id } = inputs;
        try {
            //* **********************************
            //* delete group from database
            //* **********************************
            const deleteResults = await deleteADefaultGroup(
                api_token,
                group_id
            );
            if (deleteResults.status === 200) {
                return group_id;
            }
            throw new Error('GT:73-->Failed to delete default group');
        } catch (error) {
            printObject('GT:74-->deleteDefaultGroup inputs:\n', inputs);
            printObject('GT:75-->deleteDefaultGroup ERROR:\n', error);
            throw new Error('GT:76-->Failed to delete default group');
        }
    }
);
export const createDefaultGroup = createAsyncThunk(
    'groups/createDefaultGroup',
    async (inputs, thunkAPI) => {
        try {
            const { api_token, group } = inputs;

            if (group?.id) {
                delete group.id;
            }

            //*****************************
            //* create new default group
            //*****************************

            const newGroupResponse = await createNewDefaultGroup(
                api_token,
                group
            );

            if (newGroupResponse.status === 200) {
                //* clena up and return
                //************************
                let resultant = newGroupResponse.data;
                delete resultant.created_at;
                delete resultant.updated_at;
                return resultant;
            } else {
                throw new Error('GT:107-->Failed to create default group');
            }
        } catch (error) {
            console.log('GT:110-->Failed to create default group');
            console.log(error);
            console.error(error);
            throw new Error('GT:113-->Failed to create default group');
        }
    }
);

export const updateDefaultGroup = createAsyncThunk(
    'groups/updateDefaultGroup',
    async (inputs, thunkAPI) => {
        try {
            //********************************
            //* update the default group in DB
            //********************************
            // let group = {
            //     title: inputs.group.title,
            //     location: inputs.group.location,
            //     gender: inputs.group.gender,
            //     facilitator: inputs.group.facilitator,
            // };
            const { api_token, group } = inputs;
            const inputValues = {
                api_token: api_token,
                group: group,
            };
            const results = await updateADefaultGroup(api_token, group);
            if (results.status === 200) {
                return results.data;
            } else {
                printObject(
                    'GT:141-->updateDefaultGroup failed.\nresults:\n',
                    results
                );
                throw new Error('GT:144-->Failed updateDefaultGroup thunk');
            }
        } catch (error) {
            printObject('GT:147-->updateDefaultGroup catch');
            throw new Error(
                'GT:149-->Failed updateDefaultGroup thunk\n',
                error
            );
        }
    }
);
// export const saveNewGroup = createAsyncThunk(
//     'groups/saveNewGroup',
//     async (inputs, thunkAPI) => {
//         try {
//             const newGroupId = createAWSUniqueID();
//             let groupIn = { ...inputs.group };
//             delete groupIn.id;
//             const insertInfo = {
//                 id: inputs.group.id !== '0' ? inputs.group.id : newGroupId,
//                 meetingGroupsId: inputs.meetingId,
//                 organizationGroupsId: inputs.orgId,
//                 ...groupIn,
//             };
//             printObject('GT:111-->insertInfo:\n', insertInfo);
//             //* * * * * * * * * * * * * * * * * *
//             //* save the new group to graphql
//             const results = await API.graphql({
//                 query: mutations.createGroup,
//                 variables: { input: insertInfo },
//             });
//             printObject('GT:118-->createGroup results:\n', results);
//             let returnValue {};
//             if(results.data.createGroup.id){
//                 returnValue = {
//                     status 200,
//                     results: results.data.createGroup
//                 }
//             }
//                     //* * * * * * * * * * * * * * * * * * *
//                     //* This sends group to slice
//                     //* * * * * * * * * * * * * * * * * * *
//                     printObject('GT:122-->createGroup results:\n', results);
//                     return insertInfo;
//                 })
//                 .catch((error) => {
//                     console.log(error);
//                     console.error(error);
//                     throw new Error('GT:122-->Failed to create new group');
//                 });

//             // printObject('GT:18-->inputs:\n', inputs);
//             // return inputs;
//         } catch (error) {
//             console.log(error);
//             throw new Error('GT:20-->Failed to get groups');
//         }
//     }
// );
export const getGroupsForMeeting = createAsyncThunk(
    'groups/getGroupsForMeeting',
    async (inputs, thunkAPI) => {
        try {
            const { meetingId } = inputs;
            //* * * * * * * * * * * * * * * * * * *
            //* This function gets all the groups
            //* for the inputs.meetingId passed in
            //* 2. modify member object for slice
            //* * * * * * * * * * * * * * * * * * *
            //      1. get groups from DDB for meeting
            let obj = {
                operation: 'getGroupsByMeetingId',
                payload: {
                    meetingId: meetingId,
                },
            };

            let body = JSON.stringify(obj);
            let api2use = process.env.AWS_API_ENDPOINT + '/groups';
            // console.log('@@@@@@@@@@@@@@@++++BEFORE++++++@@@@@@@@@@@@@@@@');
            // printObject('GT:30-->api2use:', api2use);
            // printObject('GT:31-->body:\n', body);
            // printObject('GT:32-->config:\n', config);
            let res = await axios.post(api2use, body, config);

            if (res?.data?.status === '200') {
                const results = res.data.body;

                // printObject('GT:39-->results:\n', results);
                // console.log('@@@@@@@@@@@@@@@++++AFTER++++++@@@@@@@@@@@@@@@@');
                return results;
            } else {
                // printObject('NOTHING');
                // console.log('@@@@@@@@@@@@@@@++++AFTER++++++@@@@@@@@@@@@@@@@');
                return [];
            }
        } catch (error) {
            console.log(error);
            throw new Error('GT:242-->Failed to get groups');
        }
    }
);
export const getDefaultGroups = createAsyncThunk(
    'meetings/getDefaultGroups',
    async (input, { getState, rejectWithValue }) => {
        try {
            const state = getState();
            return {
                status: 200,
                payload: {
                    defaultGroups: [...state.groups.defaultGroups],
                },
            };
        } catch (error) {
            // Handle errors and optionally return a rejected promise with an error message
            return rejectWithValue('Failed to fetch default groups');
        }
    }
);
