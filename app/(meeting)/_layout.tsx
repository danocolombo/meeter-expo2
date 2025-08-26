import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Text, TouchableOpacity } from 'react-native';

export default function MeetingStackLayout() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { from } = params;
    console.log('from param:', from, typeof from);

    return (
        <Stack screenOptions={{ headerShown: true }}>
            <Stack.Screen
                name='[id]'
                options={({ route }) => {
                    const params = route?.params as
                        | { id?: string; from?: string }
                        | undefined;
                    const from = params?.from;
                    const id = params?.id;
                    return {
                        headerLeft: () => (
                            <TouchableOpacity
                                style={{ marginLeft: 16 }}
                                onPress={() => {
                                    if (from === 'historic') {
                                        router.replace(
                                            '/(drawer)/(meetings)/historic'
                                        );
                                    } else if (from === 'active') {
                                        router.replace(
                                            '/(drawer)/(meetings)/active'
                                        );
                                    } else {
                                        router.replace(
                                            '/(drawer)/(meetings)/active'
                                        ); // fallback to active if no origin
                                    }
                                }}
                            >
                                <Text
                                    style={{ color: '#007AFF', fontSize: 16 }}
                                >
                                    {'< Back'}
                                </Text>
                            </TouchableOpacity>
                        ),
                        headerRight: () => (
                            <TouchableOpacity
                                style={{ marginRight: 16 }}
                                onPress={() => {
                                    router.push({
                                        pathname: '/(meeting)/editMeeting',
                                        params: id ? { id, from } : undefined,
                                    });
                                }}
                            >
                                <Text
                                    style={{ color: '#007AFF', fontSize: 16 }}
                                >
                                    Edit
                                </Text>
                            </TouchableOpacity>
                        ),
                    };
                }}
            />
            <Stack.Screen
                name='editMeeting'
                options={({ route }) => {
                    const params = route?.params as
                        | { id?: string | number; from?: string }
                        | undefined;
                    const editId = params?.id;
                    const from = params?.from;
                    return {
                        title: 'Edit Meeting',
                        headerLeft: () => (
                            <TouchableOpacity
                                style={{ marginLeft: 16 }}
                                onPress={() => {
                                    if (editId !== undefined) {
                                        router.push({
                                            pathname: '/(meeting)/[id]',
                                            params: { id: editId, from },
                                        });
                                    } else {
                                        router.push('/(meeting)/[id]');
                                    }
                                }}
                            >
                                <Text
                                    style={{ color: '#007AFF', fontSize: 16 }}
                                >
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                        ),
                    };
                }}
            />
            <Stack.Screen
                name='newMeeting'
                options={({ route }) => {
                    // Get 'from' param from route or local search params
                    const params = route?.params as
                        | { from?: string }
                        | undefined;
                    const from = params?.from;
                    return {
                        headerLeft: () => (
                            <TouchableOpacity
                                style={{ marginLeft: 16 }}
                                onPress={() => {
                                    if (from === 'active') {
                                        router.replace(
                                            '/(drawer)/(meetings)/active'
                                        );
                                    } else if (from === 'historic') {
                                        router.replace(
                                            '/(drawer)/(meetings)/historic'
                                        );
                                    } else {
                                        router.back();
                                    }
                                }}
                            >
                                <Text
                                    style={{ color: '#007AFF', fontSize: 16 }}
                                >
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                        ),
                    };
                }}
            />
        </Stack>
    );
}
