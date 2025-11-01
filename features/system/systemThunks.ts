import { createAsyncThunk } from '@reduxjs/toolkit';
import { API } from 'aws-amplify';
// removed import of external query module (jerichoQL) because the module
// wasn't present in the workspace; use inline GraphQL strings for the
// minimal queries this thunk needs.
import { printObject } from '../../utils/helpers';

// Lightweight types for the thunk inputs/outputs. These are intentionally
// permissive because the upstream GraphQL types aren't available here.
type AnyObject = Record<string, unknown>;

export type AffiliationRole = {
    id: string;
    role?: string | null;
    status?: string | null;
};

export type AffiliationUser = {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    username?: string | null;
    roles: AffiliationRole[];
};

export const initializeSystem = createAsyncThunk<
    AnyObject | undefined,
    AnyObject | undefined
>('system/initializeSystem', async (inputs, thunkAPI) => {
    try {
        return inputs;
    } catch (error) {
        printObject('ST:32-->initializeSystem', inputs);
        printObject('ST:33-->error:\n', error);
        // Rethrow the error to let createAsyncThunk handle it
        throw new Error('ST:35-->Failed to initializeSystem thunk');
    }
});

export const loadActiveOrg = createAsyncThunk<any, string>(
    'system/loadActiveOrg',
    async (inputs, thunkAPI) => {
        try {
            printObject('ST:13-->inputs\n', inputs);
            const systemInfo = (await API.graphql({
                query: `query GetOrganization($orgId: ID!) {
                    getOrganization(id: $orgId) {
                        id
                        name
                    }
                }`,
                variables: { orgId: inputs },
            })) as any;

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

export const getAffiliationsUsersByOrgId = createAsyncThunk<
    AffiliationUser[],
    { id: string },
    { state: unknown; rejectValue: unknown }
>(
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
            const gqlAffOrgUserData = (await API.graphql({
                query: `query ListAffiliations($filter: ModelAffiliationFilterInput) {
                    listAffiliations(filter: $filter) {
                        items {
                            id
                            role
                            status
                            user {
                                id
                                firstName
                                lastName
                                username
                            }
                        }
                    }
                }`,
                variables: {
                    filter: { organizationAffiliationsId: { eq: targetId } },
                },
            })) as any;
            const items =
                gqlAffOrgUserData?.data?.listAffiliations?.items ?? [];
            const returnValue: AffiliationUser[] = [];
            items.forEach((item: any) => {
                const user = item.user as any;
                if (!user) return;
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
        } catch (error: any) {
            console.log('ST:62:thunk catch hit');
            printObject('ST:63-->error:\n', error);
            const message = error && error.message ? String(error.message) : '';
            if (message.startsWith('01:')) {
                throw error; // Re-throw the specific error with code '01'
            } else if (message.startsWith('02:')) {
                throw error; // Re-throw the specific error with code '02'
            } else if (message.startsWith('03:')) {
                throw error; // Re-throw the specific error with code '03'
            } else if (message.startsWith('04:')) {
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

export default {};
