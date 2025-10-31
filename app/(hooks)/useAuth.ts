import { fetchAllMeetings } from '@features/meetings/meetingsThunks';
import { setActiveOrg } from '@features/system/systemSlice';
import { loginUser } from '@features/user/userThunks';
import { useNavigation } from '@react-navigation/native';
import type { AppDispatch } from '@utils/store';
import { useState } from 'react';
import { useDispatch } from 'react-redux';

export default function useAuth() {
    const navigation = useNavigation();
    const dispatch = useDispatch<AppDispatch>();
    // const user = useSelector((state: RootState) => state.user);
    const [isLoading, setIsLoading] = useState(false);
    const [userError, setUserError] = useState<any>(null);
    const [user, setUser] = useState<any>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const handleLoginUser = async (login: string, password: string) => {
        setIsLoading(true);
        const mockData: any = {
            signInUserSession: {
                idToken: {
                    jwtToken: process.env.EXPO_PUBLIC_MOCK_JWT_TOKEN,
                    payload: {
                        sub: process.env.EXPO_PUBLIC_MOCK_SUB,
                        email_verified: true,
                        iss: process.env.EXPO_PUBLIC_MOCK_ISS,
                        phone_number_verified: false,
                        'cognito:username':
                            process.env.EXPO_PUBLIC_MOCK_USERNAME,
                        preferred_username:
                            process.env.EXPO_PUBLIC_MOCK_USERNAME,
                        given_name: process.env.EXPO_PUBLIC_MOCK_GIVEN_NAME,
                        origin_jti: process.env.EXPO_PUBLIC_MOCK_ORIGIN_JTI,
                        aud: process.env.EXPO_PUBLIC_MOCK_AUD,
                        event_id: process.env.EXPO_PUBLIC_MOCK_EVENT_ID,
                        token_use: 'id',
                        auth_time: 1759450419,
                        exp: 1759454019,
                        iat: 1759450419,
                        family_name: process.env.EXPO_PUBLIC_MOCK_FAMILY_NAME,
                        jti: process.env.EXPO_PUBLIC_MOCK_JTI,
                        email: process.env.EXPO_PUBLIC_MOCK_EMAIL,
                    },
                },
                refreshToken: {
                    token: process.env.EXPO_PUBLIC_MOCK_JWT_TOKEN,
                },
                accessToken: {
                    jwtToken: process.env.EXPO_PUBLIC_MOCK_JWT_TOKEN,
                    payload: {
                        sub: process.env.EXPO_PUBLIC_MOCK_SUB,
                        iss: process.env.EXPO_PUBLIC_MOCK_ISS,
                        client_id: process.env.EXPO_PUBLIC_MOCK_AUD,
                        origin_jti: process.env.EXPO_PUBLIC_MOCK_ORIGIN_JTI,
                        event_id: process.env.EXPO_PUBLIC_MOCK_EVENT_ID,
                        token_use: 'access',
                        scope: 'aws.cognito.signin.user.admin',
                        auth_time: 1759450419,
                        exp: 1759454019,
                        iat: 1759450419,
                        jti: process.env.EXPO_PUBLIC_MOCK_JTI,
                        username: process.env.EXPO_PUBLIC_MOCK_USERNAME,
                    },
                },
                clockDrift: 3,
            },
        };
        //add a couple of flags for auth state
        // e.g. isAuthenticated, isLoading, error, etc.
        // then
        mockData.isAuthenticated = true;

        mockData.isLoading = false;
        mockData.error = null;
        const apiToken =
            process.env.EXPO_PUBLIC_JERICHO_API_TOKEN || 'test-token';
        const loginResults = await dispatch(
            loginUser({ inputs: mockData, apiToken })
        ).unwrap();

        // update system.activeOrg from the user profile before fetching meetings
        const activeOrg = loginResults?.profile?.activeOrg || {};

        dispatch(setActiveOrg(activeOrg));
        const orgId = activeOrg.id;
        await dispatch(fetchAllMeetings({ apiToken, org_id: orgId }));
        setIsLoading(false);
        setUserError(null);
        setUser(mockData);
        setIsAuthenticated(true);
    };
    return {
        navigation,
        handleLoginUser,
        isLoading,
        userError,
        user,
        isAuthenticated,
    };
}
