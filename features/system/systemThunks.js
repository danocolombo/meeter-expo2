import { createAsyncThunk } from '@reduxjs/toolkit';
// import axios from 'axios';
import { API, graphql, graphqlOperation } from 'aws-amplify';
import * as queries from '../../jerichoQL/queries';
import * as gQueries from '../../graphql/queries';
import * as mutations from '../../jerichoQL/mutations';
import { createAWSUniqueID, printObject } from '../../utils/helpers';

export const initializeSystem = createAsyncThunk(
    'system/initializeSystem',
    async (inputs, thunkAPI) => {
        try {
            return inputs;
        } catch (error) {
            printObject('ST:32-->initializeSystem', inputs);
            printObject('ST:33-->error:\n', error);
            // Rethrow the error to let createAsyncThunk handle it
            throw new Error('ST:35-->Failed to initializeSystem thunk');
        }
    }
);
export const loadActiveOrg = createAsyncThunk(
    'system/loadActiveOrg',
    async (inputs, thunkAPI) => {
        try {
            printObject('ST:13-->inputs\n', inputs);
            const systemInfo = await API.graphql({
                query: queries.getActiveOrganization,
                variables: { orgId: inputs },
            });
            if (systemInfo?.data?.getOrganization?.id) {
                return systemInfo.data.getOrganization;
            } else {
                // If data.createGroup.id is missing, handle the error
                throw new Error('ST:29-->Failed to loadActiveOrg');
            }
        } catch (error) {
            printObject('ST:32-->loadActiveOrg', inputs);
            printObject('ST:33-->error:\n', error);
            // Rethrow the error to let createAsyncThunk handle it
            throw new Error('ST:35-->Failed to loadActiveOrg thunk');
        }
    }
);
export const getAffiliationsUsersByOrgId = createAsyncThunk(
    'system/getAffiliationsUsersByOrgId',
    async (input, { getState, rejectWithValue }) => {
        //*-------------------------------------
        // request to get list of users that have
        // affiliations with inputs.id
        try {
            //      userProfile required
            if (!input?.id) {
                console.log('ST:54-->id is required');
                throw new Error('01: id required');
            }
            const targetId = input.id;
            console.log('targetId:', targetId);
            const gqlAffOrgUserData = await API.graphql(
                graphqlOperation(gQueries.listAffiliations, {
                    filter: { organizationAffiliationsId: { eq: targetId } },
                })
            );
            const items = gqlAffOrgUserData.data.listAffiliations.items;
            const returnValue = [];
            items.forEach((item) => {
                const user = item.user;
                const existingItem = returnValue.find(
                    (outputItem) => outputItem.id === user.id
                );

                if (existingItem) {
                    existingItem.roles.push({
                        id: item.id,
                        role: item.role,
                        status: item.status,
                    });
                } else {
                    returnValue.push({
                        id: user.id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        username: user.username,
                        roles: [
                            {
                                id: item.id,
                                role: item.role,
                                status: item.status,
                            },
                        ],
                    });
                }
            });
            return returnValue;
        } catch (error) {
            console.log('ST:62:thunk catch hit');
            printObject('ST:63-->error:\n', error);
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
                throw new Error(
                    '99: systemThunk.getAffiliationsUsersByOrgId failure'
                );
            }
        }
    }
);
