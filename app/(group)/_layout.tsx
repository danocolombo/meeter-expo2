import theme from '@assets/Colors';
import { Stack, useRouter } from 'expo-router';
import { Text, TouchableOpacity, useColorScheme } from 'react-native';
const Layout = () => {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const cancelColor =
        colorScheme === 'dark'
            ? theme.colors.navigateTextLight
            : theme.colors.navigateTextDark;

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
                                    style={{
                                        color: cancelColor,
                                    }}
                                    selectable={false}
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
                options={({ route }) => {
                    const params = route?.params as
                        | { fromMeetingId?: string }
                        | undefined;
                    const fromMeetingId = params?.fromMeetingId;
                    return {
                        title: 'Edit Group',
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
                                    style={{
                                        color: theme.colors.navigateTextLight,
                                        fontSize: 16,
                                    }}
                                >
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                        ),
                    };
                }}
            />
            <Stack.Screen
                name='[id]'
                options={({ route }) => {
                    const params = route?.params as
                        | {
                              id?: string;
                              fromMeetingId?: string;
                              org_id?: string;
                          }
                        | undefined;
                    const id = params?.id;
                    const fromMeetingId = params?.fromMeetingId;
                    const org_id = params?.org_id;
                    return {
                        title: 'Group',
                        headerLeft: () => (
                            <TouchableOpacity
                                style={{ marginLeft: 16 }}
                                onPress={() => {
                                    if (fromMeetingId && org_id) {
                                        router.replace({
                                            pathname: '/(meeting)/[id]',
                                            params: {
                                                id: fromMeetingId,
                                                org_id,
                                            },
                                        });
                                    } else if (fromMeetingId) {
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
                                    style={{
                                        color: theme.colors.navigateTextLight,
                                        fontSize: 16,
                                    }}
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
                                        color: theme.colors.navigateTextLight,
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
