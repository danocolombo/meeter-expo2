import { printObject } from '@utils/helpers';
import axios, { isAxiosError } from 'axios';
import { formatInTimeZone } from 'date-fns-tz';
import { ApiError, FullGroup, FullMeeting } from '../../types/interfaces';
const API_URL = process.env.EXPO_PUBLIC_JERICHO_ENDPOINT;
const API_TOKEN = process.env.EXPO_PUBLIC_JERICHO_API_TOKEN;

type UpdateMeetingType = {
    status: number;
    message: string;
    data: {
        meeting: FullMeeting;
    };
};
type UpdateGroupType = {
    status: number;
    message: string;
    data: {
        meeting: FullMeeting;
    };
};
export async function fetchActiveMeetings(
    apiToken: any,
    org_id: string
): Promise<
    { data: FullMeeting[]; currentPage: any; lastPage: any } | ApiError
> {
    return new Promise((resolve, reject) => {
        function getTodaysDateNY() {
            // Use date-fns-tz to get current date in America/New_York timezone
            return formatInTimeZone(
                new Date(),
                'America/New_York',
                'yyyy-MM-dd'
            );
        }
        const target_date = getTodaysDateNY();

        const api2use =
            API_URL + `/meetings/${org_id}?active=${target_date}&direction=asc`;

        axios
            .get(api2use, {
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                    // Prefer the explicit apiToken passed in; fall back to the
                    // build-time environment token if not provided.
                    Authorization: `Bearer ${apiToken || API_TOKEN}`,
                },
                validateStatus: function (status) {
                    return status === 200 || status === 404; // Accept both 200 and 404 as valid
                },
            })
            .then((response) => {
                if (response?.data?.status === 404) {
                    console.info('No Active Meetings');
                    const ourResults = {
                        data: [],
                        currentPage: 1,
                        lastPage: 1,
                        status: 404,
                        message: response.data.message,
                        org: response.data.org,
                    };
                    resolve(ourResults);
                    return;
                }

                const meetings = response?.data?.data?.data;
                const currentPage = response?.data?.data?.current_page;
                const lastPage = response?.data?.data?.last_page;
                const ourResults = {
                    status: 200,
                    data: meetings,
                    currentPage: currentPage,
                    lastPage: lastPage,
                };
                resolve(ourResults);
            })
            .catch((error) => {
                if (isAxiosError(error)) {
                    console.error('🔴 82_API call failed:', {
                        message: error.message,
                        code: error.code,
                        response: error.response?.data,
                        status: error.response?.status,
                        headers: error.response?.headers,
                    });
                } else {
                    console.error('🔴 90_API call failed:', error);
                }
                const customError: ApiError = {
                    message: 'Failure getting active meetings.',
                    details: {
                        ...(error.response && error.response.data),
                    },
                    status: 500,
                };
                reject(customError);
            });
    });
}
export async function fetchHistoricMeetings(
    apiToken: any,
    org_id: string
): Promise<
    { data: FullMeeting[]; currentPage: any; lastPage: any } | ApiError
> {
    return new Promise((resolve, reject) => {
        function getTodaysDate() {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
            const day = String(today.getDate()).padStart(2, '0');

            return `${year}-${month}-${day}`;
        }
        const target_date = getTodaysDate();
        const api2use =
            API_URL +
            `/meetings/${org_id}?historic=${target_date}&direction=desc`;
        // printObject('@@@ MAPI:93->api2use:\n', api2use);
        axios
            .get(api2use, {
                headers: {
                    // Prefer the explicit apiToken passed in; fall back to env token
                    Authorization: `Bearer ${apiToken || API_TOKEN}`,
                },
                validateStatus: function (status) {
                    return status === 200 || status === 404; // Accept 404 as valid "no data"
                },
            })
            .then((response) => {
                if (response?.data?.status === 404) {
                    const ourResults = {
                        data: [],
                        currentPage: 1,
                        lastPage: 1,
                        status: 404,
                        message: response.data?.message,
                        org: response.data?.org,
                    };
                    resolve(ourResults);
                    return;
                }
                const meetings = response?.data?.data?.data;
                const currentPage = response?.data?.data?.current_page;
                const lastPage = response?.data?.data?.last_page;
                const ourResults = {
                    status: 200,
                    data: meetings,
                    currentPage: currentPage,
                    lastPage: lastPage,
                };
                resolve(ourResults);
            })
            .catch((error) => {
                console.error('97__API call failed:', error);
                const customError: ApiError = {
                    message: 'Failure getting active meetings.',
                    details: {
                        // More specific error details based on the actual error response
                        ...(error.response && error.response.data),
                    },
                };
                reject(customError);
            });
    });
}
//****************************************************
// GET THE MEETING DETAILS FROM DATABASE
//****************************************************
export async function fetchMeetingDetails(
    api_token: any,
    organization_id: string,
    meeting_id: string
): Promise<
    { status: number; data: FullMeeting | Record<string, never> } | ApiError
> {
    return new Promise((resolve, reject) => {
        const api2use = API_URL + `/meeting/${organization_id}/${meeting_id}`;

        axios
            .get(api2use, {
                headers: {
                    // Use the provided api_token (string) when available; fall back
                    // to the environment token for backward compatibility.
                    Authorization: `Bearer ${api_token || API_TOKEN}`,
                },
                validateStatus: function (status) {
                    return status === 200 || status === 404;
                },
            })
            .then((response) => {
                // If the meeting was not found, resolve with 404 and empty data
                if (response.status === 404 || response?.data?.status === 404) {
                    resolve({ status: 404, data: {} });
                    return;
                }
                const meeting = response?.data;
                resolve({ status: 200, data: meeting });
            })
            .catch((error) => {
                console.error('API call failed:', error);
                const customError: ApiError = {
                    message: 'Failure getting meeting details.',
                    details: {
                        // More specific error details based on the actual error response
                        ...(error.response && error.response.data),
                    },
                    status: 500,
                };
                // Resolve with an ApiError-like object by rejecting so callers can
                // decide, but this typically indicates a network/server failure.
                reject(customError);
            });
    });
}
export async function fetchMeetingDetailsOLD(
    apiToken: any,
    org_id: string,
    meeting_id: string
): Promise<
    { data: FullMeeting[]; currentPage: any; lastPage: any } | ApiError
> {
    return new Promise((resolve, reject) => {
        console.log('🔶🔶🔶🔶🔶🔶🔶🔶🔶🔶🔶🔶🔶🔶');
        console.log('MAPI:93->apiToken:', apiToken);
        console.log('MAPI:94->org_id:', org_id);
        console.log('MAPI:95->meeting_id:', meeting_id);
        try {
            const api2use =
                process.env.EXPO_PUBLIC_GAUCHO_ENDPOINT +
                `/meetings/groups/${meeting_id}`;
            console.log('MAPI:100-->api2use:', api2use);
            axios
                .get(api2use, {
                    headers: {
                        Authorization: `Bearer ${apiToken.plainTextToken}`,
                        org_id: org_id,
                    },
                })
                .then((response) => {
                    const meetings = response?.data?.data;
                    const currentPage = response?.data?.meta?.current_page;
                    const lastPage = response?.data?.meta?.last_page;
                    resolve({
                        data: meetings,
                        currentPage: currentPage,
                        lastPage: lastPage,
                    });
                })
                .catch((error) => {
                    console.error('API call failed:', error);
                    const customError: ApiError = {
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
            console.log('MAPI:135-->error:', error);
            console.log('🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴');
        }
    });
}
// shape for creating a new group
type CreateNewGroupType = {
    meeting_id: string;
    title: string;
    location: string;
    gender: string;
    attendance: number;
    facilitator?: string | null;
    cofacilitator?: string | null;
    notes?: string | null;
    grp_comp_key?: string | null;
};
export async function createNewGroup(
    apiToken: any,
    meetingId: string,
    new_group: CreateNewGroupType
): Promise<{ status: number; data: FullGroup } | ApiError> {
    return new Promise((resolve, reject) => {
        try {
            //********************************
            //* POST database call
            //********************************
            const config = {
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                    Authorization: `Bearer ${API_TOKEN}`,
                },
            };
            const body = new_group;
            const api2use = API_URL + '/group';
            axios
                .post(api2use, body, config)
                .then((response) => {
                    //printObject('MAPI:263-->response:\n', response);
                    if (response?.data?.status === 200) {
                        const returnMessage = {
                            status: response?.data?.status,
                            message: response?.data?.message,
                            data: response?.data?.group,
                        };
                        resolve(returnMessage);
                    } else {
                        const returnMessage = {
                            status: response?.data?.status,
                            message: response?.data?.message,
                            data: response?.data?.group || null,
                        };
                        reject(returnMessage);
                    }
                })
                .catch((error) => {
                    console.error('MAPI:281 meetings API call failed:', error);
                    const customError: ApiError = {
                        message: 'Failure saving group to meeting.',
                        details: {
                            // More specific error details based on the actual error response
                            ...(error.response && error.response.data),
                        },
                    };
                    reject(customError);
                });
        } catch (error) {
            console.log('🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴');
            console.log('MAPI:293-->error:', error);
            console.log('🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴');
        }
    });
}
export async function createNewMeeting(
    apiToken: any,
    meeting: any
): Promise<{ status: number; data: FullMeeting } | ApiError> {
    return new Promise((resolve, reject) => {
        // printObject('MAPI:209->meeting:', meeting);
        function convertKeysToSnakeCase(obj: Record<string, any>) {
            const newObj: Record<string, any> = {};
            for (const key in obj) {
                const newKey = key
                    .replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
                    .toLowerCase();
                newObj[newKey] = obj[key];
            }
            return newObj;
        }
        const snake_meeting = convertKeysToSnakeCase(meeting);
        try {
            //********************************
            //* POST database call
            //********************************
            const config = {
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                    Authorization: `Bearer ${API_TOKEN}`,
                },
            };
            const orgId = meeting.organization_id;
            const body = JSON.stringify(snake_meeting);
            const api2use = API_URL + '/meeting';
            axios
                .post(api2use, body, config)
                .then((response) => {
                    if (response.status === 200) {
                        const savedMeeting = response?.data?.data;

                        const returnMessage = {
                            status: response.status,
                            data: savedMeeting,
                        };
                        resolve(returnMessage);
                    } else {
                        const returnMessage = {
                            status: response.status,
                            data: response.data.message,
                        };
                        reject(returnMessage);
                    }
                })
                .catch((error) => {
                    console.error('MAPI:231 meetings API call failed:', error);
                    const customError: ApiError = {
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
            console.log('MAPI:286-->error:', error);
            console.log('🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴');
        }
    });
}
export async function deleteAMeeting(
    api_token: any,
    organization_id: string,
    meeting_id: string
): Promise<{ status: number; message: string; data: any } | ApiError> {
    return new Promise((resolve, reject) => {
        try {
            const api2use =
                API_URL + `/meeting/${organization_id}/${meeting_id}`;
            axios
                .delete(api2use, {
                    headers: {
                        Authorization: `Bearer ${API_TOKEN}`,
                    },
                })
                .then((response) => {
                    if (response?.data?.status === 200) {
                        const deletedMeeting = {
                            organization_id: organization_id,
                            meeting_id: meeting_id,
                        };
                        const returnMessage = {
                            status: response?.data?.status,
                            message: response.data.message,
                            data: deletedMeeting,
                        };
                        resolve(returnMessage);
                    } else {
                        const returnMessage = {
                            status: response?.data?.status,
                            data: response?.data?.message,
                        };
                        reject(returnMessage);
                    }
                })
                .catch((error) => {
                    console.error('🔴 405_API call failed:', error);
                    const customError: ApiError = {
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
            console.log('🔴MAPI:417-->error:', error);
            console.log('🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴');
        }
    });
}
export async function deleteAGroup(
    api_token: any,
    group_id: string
): Promise<{ status: number; message: string } | ApiError> {
    return new Promise((resolve, reject) => {
        try {
            const api2use = API_URL + `/group/${group_id}`;
            axios
                .delete(api2use, {
                    headers: {
                        Authorization: `Bearer ${API_TOKEN}`,
                    },
                })
                .then((response) => {
                    if (response?.data?.status === 200) {
                        const returnMessage = {
                            status: response?.data?.status,
                            message: response.data.message,
                            group_id: group_id,
                        };
                        resolve(returnMessage);
                    } else {
                        const returnMessage = {
                            status: response?.data?.status,
                            data: response?.data?.errors,
                        };
                        reject(returnMessage);
                    }
                })
                .catch((error) => {
                    console.error('453_MEETING_API call failed:', error);
                    const customError: ApiError = {
                        message: 'Failure deleting group from meeting.',
                        details: {
                            // More specific error details based on the actual error response
                            ...(error.response && error.response.data),
                        },
                    };
                    reject(customError);
                });
        } catch (error) {
            console.log('🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴');
            console.log('MAPI:398-->error:', error);
            console.log('🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴');
        }
    });
}
export async function updateTheMeeting(
    api_token: any,
    meeting: any
): Promise<UpdateMeetingType | ApiError> {
    return new Promise((resolve, reject) => {
        function convertKeysToSnakeCase(obj: Record<string, any>) {
            const newObj: Record<string, any> = {};
            for (const key in obj) {
                const newKey = key
                    .replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
                    .toLowerCase();
                newObj[newKey] = obj[key];
            }
            return newObj;
        }
        const snake_meeting = convertKeysToSnakeCase(meeting);
        try {
            const api2use =
                API_URL + `/meeting/${meeting.organization_id}/${meeting.id}`;
            axios
                .put<UpdateMeetingType>(api2use, meeting, {
                    headers: {
                        Authorization: `Bearer ${API_TOKEN}`,
                    },
                })
                .then((response) => {
                    const updatedMeeting = response?.data?.data;

                    if (response?.data?.status === 200) {
                        const returnMessage = {
                            status: response?.data?.status,
                            message: response?.data?.message,
                            data: updatedMeeting,
                        };
                        resolve(returnMessage);
                    } else {
                        const returnMessage = {
                            status: response?.data?.status,
                            message: response?.data?.message,
                            data: response?.data?.data,
                        };
                        reject(returnMessage);
                    }
                })
                .catch((error) => {
                    console.error('466_API call failed:', error);
                    const customError: ApiError = {
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
            console.log('MAPI:467-->error:', error);
            console.log('🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴');
        }
    });
}
export async function updateAGroup(
    inputs: any
): Promise<UpdateGroupType | ApiError> {
    return new Promise((resolve, reject) => {
        try {
            printObject('MAPI:545->inputs:\n', inputs);
            const api_token = inputs?.api_token;
            const group_id = inputs?.group_id;
            const group = inputs?.group;

            const api2use = `${API_URL}/group/${group_id}`;
            // endPoint + `/meeting/${meeting.organization_id}/${meeting.id}`;
            axios
                .put<UpdateGroupType>(api2use, group, {
                    headers: {
                        Authorization: `Bearer ${API_TOKEN}`,
                    },
                })
                .then((response) => {
                    // printObject(
                    //     '🟨 => file: meetingsAPI.ts:562 => .then => response:',
                    //     response
                    // );
                    const updatedGroup = response?.data.data;
                    if (response?.data?.status === 200) {
                        console.log('GOOD');
                        const returnMessage = {
                            status: response?.data?.status,
                            message: response?.data?.message,
                            data: updatedGroup,
                        };
                        resolve(returnMessage);
                    } else {
                        const returnMessage = {
                            status: response?.data?.status,
                            message: response?.data?.message,
                            data: response?.data?.data,
                        };
                        reject(returnMessage);
                    }
                })
                .catch((error) => {
                    console.error('576_API call failed:', error);
                    const customError: ApiError = {
                        message: 'Failure updating group.',
                        details: {
                            // More specific error details based on the actual error response
                            ...(error.response && error.response.data),
                        },
                    };
                    reject(customError);
                });
        } catch (error) {
            console.log('🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴');
            console.log('MAPI:588-->error:', error);
            console.log('🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴');
        }
    });
}
export async function getNextHistoricPage(
    apiToken: any,
    org_id: string
): Promise<
    { data: FullMeeting[]; currentPage: any; lastPage: any } | ApiError
> {
    return new Promise((resolve, reject) => {
        function getTodaysDate() {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
            const day = String(today.getDate()).padStart(2, '0');

            return `${year}-${month}-${day}`;
        }
        const target_date = getTodaysDate();
        const api2use =
            API_URL +
            `/meetings/${org_id}?historic=${target_date}&direction=desc`;
        // printObject('@@@ MAPI:93->api2use:\n', api2use);
        axios
            .get(api2use, {
                headers: {
                    Authorization: `Bearer ${API_TOKEN}`,
                },
            })
            .then((response) => {
                const meetings = response?.data?.data?.data;
                const currentPage = response?.data?.data?.current_page;
                const lastPage = response?.data?.data?.last_page;
                const ourResults = {
                    data: meetings,
                    currentPage: currentPage,
                    lastPage: lastPage,
                };
                // printObject(
                //     '🔘🔘🔘🔘 MAPI:110-->(HISTORIC) ourResults\n',
                //     ourResults
                // );
                resolve(ourResults);
            })
            .catch((error) => {
                console.error('97__API call failed:', error);
                const customError: ApiError = {
                    message: 'Failure getting active meetings.',
                    details: {
                        // More specific error details based on the actual error response
                        ...(error.response && error.response.data),
                    },
                };
                reject(customError);
            });
    });
}
export async function fetchHistoricPage(
    apiToken: any,
    org_id: string,
    page: string
): Promise<
    | {
          status: number;
          data: FullMeeting[];
          currentPage: number;
          lastPage: number;
      }
    | ApiError
> {
    return new Promise((resolve, reject) => {
        function getTodaysDate() {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
            const day = String(today.getDate()).padStart(2, '0');

            return `${year}-${month}-${day}`;
        }
        const target_date = getTodaysDate();
        const api2use =
            API_URL +
            `/meetings/${org_id}?historic=${target_date}&direction=desc&page=${page}`;
        // printObject('@@@ MAPI:93->api2use:\n', api2use);
        axios
            .get(api2use, {
                headers: {
                    Authorization: `Bearer ${API_TOKEN}`,
                },
            })
            .then((response) => {
                const meetings = response?.data?.data?.data;
                const currentPage = response?.data?.data?.current_page;
                const lastPage = response?.data?.data?.last_page;
                const ourResults = {
                    status: 200,
                    data: meetings,
                    currentPage: currentPage,
                    lastPage: lastPage,
                };
                // printObject(
                //     '🔘🔘🔘🔘 MAPI:110-->(HISTORIC) ourResults\n',
                //     ourResults
                // );
                resolve(ourResults);
            })
            .catch((error) => {
                console.error('97__API call failed:', error);
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
    });
}
