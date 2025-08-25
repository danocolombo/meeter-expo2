import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Text, TouchableOpacity } from 'react-native';

export default function MeetingStackLayout() {
    const router = useRouter();
    const { from } = useLocalSearchParams();
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
                }}
            />
        </Stack>
    );
}
