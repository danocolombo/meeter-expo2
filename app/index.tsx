import { fetchAllMeetings } from '@features/meetings/meetingsThunks';
import { loginUser } from '@features/user/userThunks';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Text } from 'react-native';
import { useDispatch } from 'react-redux';
import useAuth from './(hooks)/useAuth';

const sub = process.env.EXPO_PUBLIC_USER_COGNITO_SUB;

export default function Index() {
    const router = useRouter();
    const dispatch = useDispatch();
    const { user, isAuthenticated, isLoading, userError } = useAuth();

    useEffect(() => {
        if (isLoading) return; // Wait for auth to resolve

        // Defer navigation to next tick to ensure router is mounted
        setTimeout(() => {
            if (!isAuthenticated) {
                router.replace('/(auth)/signin');
                return;
            }

            // Only fetch meetings and login if authenticated
            const apiToken = process.env.EXPO_PUBLIC_JERICHO_API_TOKEN;
            const org_id = process.env.EXPO_PUBLIC_TEST_ORGANIZATION_ID;
            if (apiToken && user) {
                dispatch<any>(fetchAllMeetings({ apiToken, org_id }));
                dispatch<any>(loginUser({ inputs: user, apiToken }));
            }

            if (userError) {
                console.error('Error in useEffect:', userError);
            }

            router.replace('/(drawer)');
        }, 0);
    }, [dispatch, userError, user, isAuthenticated, isLoading, router]);

    // Show loading while deciding where to go
    return <Text>Loading...</Text>;
}
