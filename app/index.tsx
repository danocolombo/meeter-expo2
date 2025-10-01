import { fetchAllMeetings } from '@features/meetings/meetingsThunks';
import { useQuery } from '@tanstack/react-query';
import { getPersonBySub } from '@utils/api';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Button, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

const sub = process.env.EXPO_PUBLIC_USER_COGNITO_SUB;

export default function Index() {
    const router = useRouter();
    const dispatch = useDispatch();
    const { data: person, isLoading } = useQuery({
        queryKey: ['person'],
        queryFn: () => getPersonBySub(sub || ''),
        enabled: !!sub && sub.trim() !== '',
    });
    // Access activeMeetings from Redux store
    const activeMeetings = useSelector(
        (state: any) => state.meetings.activeMeetings
    );
    function getJsEngine() {
        // Use type assertion to avoid TypeScript error
        if ((global as any).HermesInternal) {
            return 'Hermes';
        }
        return 'JSC';
    }
    useEffect(() => {
        // Fetch all meetings when the file runs
        const apiToken = process.env.EXPO_PUBLIC_JERICHO_API_TOKEN;
        // const org_id = MEETER_DEFAULTS.ORGANIZATION_ID;
        const org_id = process.env.EXPO_PUBLIC_TEST_ORGANIZATION_ID;

        if (apiToken && org_id) {
            dispatch<any>(fetchAllMeetings({ apiToken, org_id }));
        }
        // Log JS engine info
        console.log('JS Engine:', getJsEngine());
    }, [dispatch]);

    useEffect(() => {
        if (!sub || sub.trim() === '') {
            // Do nothing, error will be shown below
            return;
        }
        if (person && person.sub) {
            // console.log('########################################');
            // console.log('PERSON BY SUB:\n', person);
            // console.log('Welcome ', person?.first_name);
            // console.log('########################################');
            router.replace('/(drawer)');
        } else if (person && !person.sub) {
            router.replace('/profile-edit');
        }
    }, [person, sub, router]);

    if (!sub || sub.trim() === '') {
        return (
            <>
                <Text
                    style={{
                        fontSize: 20,
                        fontWeight: 'bold',
                        marginBottom: 8,
                    }}
                >
                    Error: User SUB is not set in environment variables.
                </Text>
                <Text>Please check your .env configuration.</Text>
            </>
        );
    }

    // Optionally show loading or nothing while redirecting
    if (isLoading || !person) {
        return <Text>Loading...</Text>;
    }

    // Add a button to log activeMeetings
    return (
        <View
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
            <Button
                title='Log Active Meetings'
                onPress={() => {
                    // Log the activeMeetings array
                    console.log('Active Meetings:', activeMeetings);
                }}
            />
        </View>
    );
}
