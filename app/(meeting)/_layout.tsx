import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Text, TouchableOpacity } from 'react-native';

export default function MeetingStackLayout() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { from, id } = params;
    console.log('from param:', from, typeof from);

    return (
        <Stack screenOptions={{ headerShown: true }}>
            <Stack.Screen
                name='[id]'
                options={{
                    headerLeft: () => (
                        <TouchableOpacity
                            style={{ marginLeft: 16 }}
                            onPress={() => {
                                if (from?.toString() === 'historic') {
                                    router.push(
                                        '/(drawer)/(meetings)/historic'
                                    );
                                } else {
                                    router.push('/(drawer)/(meetings)/active');
                                }
                            }}
                        >
                            <Text style={{ color: '#007AFF', fontSize: 16 }}>
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
                                    params: id ? { id } : undefined,
                                });
                            }}
                        >
                            <Text style={{ color: '#007AFF', fontSize: 16 }}>
                                Edit
                            </Text>
                        </TouchableOpacity>
                    ),
                }}
            />
            <Stack.Screen
                name='editMeeting'
                options={({ route }) => {
                    const params = route?.params as
                        | { id?: string | number }
                        | undefined;
                    const editId = params?.id;
                    return {
                        headerLeft: () => (
                            <TouchableOpacity
                                style={{ marginLeft: 16 }}
                                onPress={() => {
                                    if (editId !== undefined) {
                                        router.push({
                                            pathname: '/(meeting)/[id]',
                                            params: { id: editId },
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
        </Stack>
    );
}
