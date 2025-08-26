import { Stack, useRouter } from 'expo-router';
import { Text, TouchableOpacity } from 'react-native';

const Layout = () => {
    const router = useRouter();
    return (
        <Stack>
            <Stack.Screen
                name='newGroup'
                options={({ route }) => {
                    const params = route?.params as
                        | { fromMeetingId?: string; from?: string }
                        | undefined;
                    const fromMeetingId = params?.fromMeetingId;
                    const from = params?.from;
                    return {
                        title: 'Create New Group',
                        headerLeft: () => (
                            <TouchableOpacity
                                style={{ marginLeft: 16 }}
                                onPress={() => {
                                    if (fromMeetingId) {
                                        router.replace({
                                            pathname: '/(meeting)/[id]',
                                            params: { id: fromMeetingId, from },
                                        });
                                    } else {
                                        router.replace('/(meeting)/[id]');
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
                name='editGroup'
                options={{
                    title: 'Edit Group',
                }}
            />
            <Stack.Screen
                name='[id]'
                options={({ route }) => {
                    const params = route?.params as
                        | { id?: string; fromMeetingId?: string }
                        | undefined;
                    const id = params?.id;
                    const fromMeetingId = params?.fromMeetingId;
                    return {
                        headerLeft: () => (
                            <TouchableOpacity
                                style={{ marginLeft: 16 }}
                                onPress={() => {
                                    if (fromMeetingId) {
                                        router.replace({
                                            pathname: '/(meeting)/[id]',
                                            params: { id: fromMeetingId },
                                        });
                                    } else {
                                        router.replace('/(meeting)/[id]');
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
                                        pathname: '/(group)/editGroup',
                                        params: { id, fromMeetingId },
                                    });
                                }}
                            >
                                <Text
                                    style={{
                                        color: '#007AFF',
                                        fontSize: 16,
                                        fontWeight: 'bold',
                                    }}
                                >
                                    Edit
                                </Text>
                            </TouchableOpacity>
                        ),
                    };
                }}
            />
        </Stack>
    );
};

export default Layout;
