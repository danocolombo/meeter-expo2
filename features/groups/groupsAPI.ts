import { ApiError, FullGroup } from '@/types/interfaces';
import { getDefaultGroups } from '@/uiils/api';
import { printObject } from '@/uiils/helpers';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
export async function fetchDefaultGroups(
    api_token: any,
    organization_id: string
): Promise<{ status: number; data: FullGroup[] } | ApiError> {
    return new Promise((resolve, reject) => {
        const organizationId = process.env.EXPO_PUBLIC_ORGANIZATION_ID;
        const {
            data: defaultGroups,
            // isLoading,
            error,
        } = useQuery({
            queryKey: ['defaultGroups', organizationId],
            queryFn: () => getDefaultGroups(organizationId || ''),
        });

        if (error) {
            const customError: ApiError = {
                status: 422,
                message: 'Failure getting default groups.',
                details: {
                    ...(error.response && error.response.data),
                },
            };
            reject(customError);
        }
        if (defaultGroups) {
            const ourResults = {
                status: 200,
                data: defaultGroups,
            };
            resolve(ourResults);
        }
        // const endPoint = process.env.EXPO_PUBLIC_JERICHO_ENDPOINT;
        // const api2use = endPoint + `/defaultgroups/${organization_id}`;
        // axios
        //     .get(api2use, {
        //         headers: {
        //             Authorization: `Bearer ${api_token?.plainTextToken}`,
        //         },
        //     })
        //     .then((response) => {
        //         const groups = response?.data?.data;
        //         const ourResults = {
        //             status: 200,
        //             data: groups,
        //         };
        //         resolve(ourResults);
        //     })
        //     .catch((error) => {
        //         console.error('34_GAPI call failed:', error);
        //         const customError: ApiError = {
        //             status: 422,
        //             message: 'Failure getting active meetings.',
        //             details: {
        //                 // More specific error details based on the actual error response
        //                 ...(error.response && error.response.data),
        //             },
        //         };
        //         reject(customError);
        //     });
    });
}
interface GroupUpdatedType {
    status: number;
    message: string;
    default_group: FullGroup;
}

export async function updateADefaultGroup(
    api_token: any,
    group: FullGroup
): Promise<{ status: number; message: string; data: FullGroup } | ApiError> {
    return new Promise((resolve, reject) => {
        try {
            console.log('GAPI:56-->api_token=', api_token);
            printObject('GAPI:58-->group:', group);
            const endPoint = process.env.EXPO_PUBLIC_JERICHO_ENDPOINT;
            const api2use = endPoint + `/defaultgroup/${group.id}`;
            axios
                .put<GroupUpdatedType>(api2use, group, {
                    headers: {
                        Authorization: `Bearer ${api_token.plainTextToken}`,
                    },
                })
                .then((response) => {
                    const updatedGroup = response?.data?.default_group;
                    if (response?.data?.status === 200) {
                        const returnMessage = {
                            status: response?.data?.status,
                            message: response?.data?.message,
                            data: updatedGroup,
                        };
                        resolve(returnMessage);
                    } else {
                        const returnError: ApiError = {
                            status: response?.data?.status,
                            message: response?.data?.message,
                            details: '',
                        };
                        reject(returnError);
                    }
                })
                .catch((error) => {
                    console.error('84_API call failed:', error);
                    const customError: ApiError = {
                        status: 422,
                        message: 'Failure getting active meetings.',
                        details: {
                            // More specific error details based on the actual error response
                            ...(error.response && error.response.data),
                        },
                    };
                    reject(customError);
                });
        } catch (error) {
            console.log('🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴');
            console.log('GAPI:96-->error:', error);
            console.log('🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴');
        }
    });
}
export async function createNewDefaultGroup(
    apiToken: any,
    group: GroupType
): Promise<{ status: number; data: GroupType } | ApiError> {
    return new Promise((resolve, reject) => {
        try {
            //********************************
            //* POST database call
            //********************************
            const endPoint = process.env.EXPO_PUBLIC_JERICHO_ENDPOINT;
            const config = {
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                    Authorization: `Bearer ${apiToken.plainTextToken}`,
                },
            };
            const orgId = group.organization_id;
            const body = JSON.stringify(group);
            const api2use = endPoint + '/defaultgroup';
            axios
                .post(api2use, body, config)
                .then((response) => {
                    if (response?.data?.status === 200) {
                        const savedGroup = response?.data?.defaultGroup;

                        const returnMessage = {
                            status: response.data.status,
                            data: savedGroup,
                        };
                        resolve(returnMessage);
                    } else {
                        const returnMessage = {
                            status: response.data.status,
                            data: response.data.message,
                        };
                        reject(returnMessage);
                    }
                })
                .catch((error) => {
                    console.error(
                        'GAPI:144 default group API call failed:',
                        error
                    );
                    const customError: ApiError = {
                        message: 'Failure getting storing default groups.',
                        details: {
                            // More specific error details based on the actual error response
                            ...(error.response && error.response.data),
                        },
                    };
                    reject(customError);
                });
        } catch (error) {
            console.log('🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴');
            console.log('GAPI:156-->error:', error);
            console.log('🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴');
        }
    });
}
export async function deleteADefaultGroup(
    api_token: any,
    group_id: string
): Promise<{ status: number; message: string } | ApiError> {
    return new Promise((resolve, reject) => {
        const endPoint = process.env.EXPO_PUBLIC_JERICHO_ENDPOINT;
        const api2use = endPoint + `/defaultgroup/${group_id}`;
        axios
            .delete(api2use, {
                headers: {
                    Authorization: `Bearer ${api_token.plainTextToken}`,
                },
            })
            .then((response) => {
                resolve({
                    status: response?.data?.status,
                    message: response?.data?.message,
                });
            })
            .catch((error) => {
                console.error('181_GAPI call failed:', error);
                const customError: ApiError = {
                    status: 422,
                    message: 'Failure deleting default group.',
                    details: {
                        // More specific error details based on the actual error response
                        ...(error?.response && error?.response.data),
                    },
                };
                reject(customError);
            });
    });
}
