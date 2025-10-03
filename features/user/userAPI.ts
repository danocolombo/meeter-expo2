import { printObject } from '@utils/helpers';
import axios from 'axios';

interface PersonType {
    id: string;
    created_at: string;
    updated_at: string;
    sub: string;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    shirt: string;
    birthday: string;
    picture: string;
    default_org_id: string;
    location_id: string;
    aws_id: string;
    aws_def_org_id: string;
    aws_location_id: string;
    affiliations: [];
    current_org: {};
}
interface OrganizationType {
    id: string;
    created_at: string;
    updated_at: string;
    name: string;
    code: string;
    hero_message: string;
    location_id: string;
}

type ApiError = {
    message: string;
    details: string;
};
type UpdateHeroType = {
    status: number;
    message: string;
    data: [];
};
export function getAPIToken(
    username: string,
    email: string,
    sub: string
): Promise<{ status: number; data: any } | ApiError> {
    return new Promise((resolve, reject) => {
        try {
            const endPoint = process.env.EXPO_PUBLIC_JERICHO_ENDPOINT;
            const config = {
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            };
            //** try logging in */
            const api2use = endPoint + '/login';
            const body = JSON.stringify({
                username,
                email,
                sub,
            });
            // printObject('🟨 🟨 🟨=> file: userAPI.ts:73=>api2use:\n', api2use);
            // printObject('🟨 🟨 🟨=> file: userAPI.ts:74=>config:\n', config);
            // printObject('🟨 🟨 🟨=> file: userAPI.ts:75=>body:\n', body);
            axios
                .post(api2use, body, config)
                .then((response) => {
                    if (response?.data?.status === 200) {
                        //* login successful
                        const returnMessage = {
                            status: response.data.status,
                            data: response.data.token,
                        };
                        resolve(returnMessage);
                    } else {
                        // Handle any other successful status codes
                        const returnMessage = {
                            status: response.data.status || response.status,
                            data: response.data,
                        };
                        resolve(returnMessage);
                    }
                })
                .catch((error) => {
                    // Check if this is a 401 (Unauthorized) error
                    if (error.response && error.response.status === 401) {
                        printObject(
                            '🟨 🟨 🟨=> file: userAPI.ts:92=>401 acknowledged\n',
                            error.response
                        );

                        const registerBody = JSON.stringify({
                            username: username,
                            email: email,
                            sub: sub,
                            sub_confirmation: sub,
                        });
                        // We should use a registration endpoint instead of the login endpoint
                        const registerEndpoint = endPoint + '/register'; // Change to proper registration endpoint

                        axios
                            .post(registerEndpoint, registerBody, config)
                            .then((response) => {
                                // Check specific response.data.status first (from API)
                                if (response?.data?.status === 200) {
                                    //* registration successful via API status
                                    const returnMessage = {
                                        status: response.data.status,
                                        data: response.data.token,
                                    };
                                    resolve(returnMessage);
                                } else if (response.status === 200) {
                                    // HTTP status is 200 but might not have data.status
                                    const returnMessage = {
                                        status: response.status,
                                        data:
                                            response.data.token ||
                                            response.data,
                                    };
                                    resolve(returnMessage);
                                } else {
                                    //* unexpected response
                                    const returnMessage = {
                                        status:
                                            response?.data?.status ||
                                            response.status,
                                        data: response.data,
                                        message:
                                            'Unexpected registration response',
                                    };
                                    reject(returnMessage);
                                }
                            })
                            .catch((registerError) => {
                                // 422 error would mean that the registration request failed
                                // most likely the person is already registered, just not
                                // configured properly.
                                // Check if this is also a 401 error for registration
                                if (
                                    registerError.response &&
                                    registerError.response.status === 422
                                ) {
                                    // You might need a different approach for registration
                                    // For now, just resolve with a meaningful message
                                    resolve({
                                        status: 422,
                                        data: {
                                            message:
                                                'User authentication required. Please check credentials or contact support.',
                                            error: 'Registration endpoint returned 422',
                                        },
                                    });
                                } else {
                                    // Extract meaningful error information
                                    let errorDetails;
                                    if (registerError.response) {
                                        // Server responded with an error status
                                        errorDetails = {
                                            status: registerError.response
                                                .status,
                                            data: registerError.response.data,
                                            headers:
                                                registerError.response.headers,
                                        };
                                    } else if (registerError.request) {
                                        // Request was made but no response received
                                        errorDetails = {
                                            request:
                                                'Request was sent but no response received',
                                        };
                                    } else {
                                        // Error setting up the request
                                        errorDetails = {
                                            message: registerError.message,
                                        };
                                    }

                                    const customError: ApiError = {
                                        message: 'Failure registering user.',
                                        details: JSON.stringify(errorDetails),
                                    };
                                    reject(customError);
                                }
                            });

                        // Note: These console.log statements were causing errors with undefined variable
                        // Commenting them out or removing them entirely
                    } else {
                        // Handle other types of errors
                        const customError: ApiError = {
                            message: 'Failure logging in.',
                            details: error.response
                                ? error.response.data
                                : String(error),
                        };
                        reject(customError);
                    }
                });
        } catch (error) {
            reject({
                message: 'Operation failed',
                details: String(error),
            });
        }
    });
}

export function fetchPerson(
    sub: string,
    apiToken: any
): Promise<{ status: number; data: PersonType | null } | ApiError> {
    return new Promise((resolve, reject) => {
        try {
            const endPoint = process.env.EXPO_PUBLIC_JERICHO_ENDPOINT;
            const extractedToken = apiToken?.plainTextToken;
            const config = {
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                    Authorization: `Bearer ${extractedToken}`,
                },
            };
            // const api2use = endPoint + '/people/search?sub=' + sub;
            const api2use = endPoint + '/people/sub/' + sub;
            try {
                axios
                    .get(api2use, config)
                    .then((response) => {
                        if (response.data.status === 200) {
                            const subPerson = response?.data?.data;

                            resolve({ status: 200, data: subPerson });
                        } else {
                            // Handle non-200 status from API
                            resolve({
                                status: response.data.status || 404,
                                data: null,
                            });
                        }
                    })
                    .catch((error) => {
                        console.error('API call failed:', error);
                        // Instead of rejecting, resolve with error status
                        // This allows the calling code to handle it gracefully
                        resolve({
                            status: error.response?.status || 404,
                            data: null,
                        });
                    });
            } catch (error) {
                resolve({
                    status: 500,
                    data: null,
                });
            }
        } catch (error) {
            resolve({
                status: 500,
                data: null,
            });
        }
    });
}
export async function fetchOrgs(
    apiToken: any
): Promise<{ data: OrganizationType[] } | ApiError> {
    return new Promise((resolve, reject) => {
        try {
            const endPoint = process.env.EXPO_PUBLIC_JERICHO_ENDPOINT;
            const config = {
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                    Authorization: `Bearer ${apiToken.plainTextToken}`,
                },
            };
            //** try logging in */
            const api2use = endPoint + '/organizations';
            try {
                axios
                    .get(api2use, config)
                    .then((response) => {
                        const orgs = response?.data;
                        resolve({ data: orgs });
                    })
                    .catch((error) => {
                        console.error('API call failed:', error);
                        const customError: ApiError = {
                            message: 'Something went wrong.',
                            details: {
                                // More specific error details based on the actual error response
                                ...(error.response && error.response.data),
                            },
                        };
                        reject(customError);
                    });
            } catch (error) {
                reject({
                    message: 'Failed to execute org fetch request',
                    details: String(error),
                });
            }
        } catch (error) {
            reject({
                message: 'Operation failed',
                details: String(error),
            });
        }
    });
}
export async function fetchAllOrgs(
    apiToken: any
): Promise<{ data: OrganizationType[] } | ApiError> {
    const api2use = process.env.EXPO_PUBLIC_GAUCHO_ENDPOINT + `/organizations`;
    try {
        const response = await axios.get(api2use, {
            headers: {
                Authorization: `Bearer ${apiToken.plainTextToken}`,
            },
        });

        // Check for successful response
        if (!response || !response.data) {
            throw new Error('API response is empty.');
        }

        // Extract data
        const orgs = response.data;

        return { data: orgs };
    } catch (error: any) {
        // Handle errors and build ApiError
        const customError: ApiError = {
            message: 'Something went wrong.',
            details: {
                ...(error.response && error.response.data),
            },
        };
        throw customError;
    }
}
//************************************************************************************************
//* update hero message in organization
//************************************************************************************************
export async function updateHeroMessage(
    api_token: any,
    organization_id: string,
    message: string
): Promise<UpdateHeroType | ApiError> {
    return new Promise((resolve, reject) => {
        try {
            const endPoint = process.env.EXPO_PUBLIC_JERICHO_ENDPOINT;
            const newHeroMessage = { hero_message: message };
            const api2use = endPoint + `/organization/${organization_id}`;
            try {
                axios
                    .put<UpdateHeroType>(api2use, newHeroMessage, {
                        headers: {
                            Authorization: `Bearer ${api_token.plainTextToken}`,
                        },
                    })
                    .then((response) => {
                        const updatedOrganization = response?.data?.data;

                        if (response?.data?.status === 200) {
                            const returnMessage = {
                                status: response?.data?.status,
                                message: response?.data?.message,
                                organization_id: organization_id,
                                data: updatedOrganization,
                            };
                            resolve(returnMessage);
                        } else {
                            const returnMessage = {
                                status: response?.data?.status,
                                message: response?.data?.message,
                                organization_id: organization_id,
                                data: updatedOrganization,
                            };
                            reject(returnMessage);
                        }
                    })
                    .catch((error) => {
                        console.error('303_API call failed:', error);
                        const customError: ApiError = {
                            message: 'Failure updateHeroMessage',
                            details: {
                                // More specific error details based on the actual error response
                                ...(error.response && error.response.data),
                            },
                        };
                        reject(customError);
                    });
            } catch (error) {
                reject({
                    message: 'Failed to execute hero message update request',
                    details: String(error),
                });
            }
        } catch (error) {
            reject({
                message: 'Operation failed',
                details: String(error),
            });
        }
    });
}
