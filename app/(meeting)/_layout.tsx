import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { MeetingFromProvider, useMeetingFrom } from './MeetingFromContext';

function MeetingStackLayoutInner() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { from: paramFrom } = params;
    const { from, setFrom } = useMeetingFrom();

    useEffect(() => {
        if (paramFrom && paramFrom !== from) {
            setFrom(paramFrom as string);
        }
    }, [paramFrom, from, setFrom]);

    // Use context 'from' if param is missing
    const getFrom = (routeParams: any) => {
        return routeParams?.from || from;
    };

    return (
        <Stack screenOptions={{ headerShown: true }}>
            <Stack.Screen
                name='[id]'
                options={({ route }) => {
                    const params = route?.params as
                        | { id?: string; from?: string }
                        | undefined;
                    const fromValue = getFrom(params);
                    const id = params?.id;
                    return {
                        headerLeft: () => (
                            <TouchableOpacity
                                style={{ marginLeft: 16 }}
                                onPress={() => {
                                    if (fromValue === 'historic') {
                                        router.replace(
                                            '/(drawer)/(meetings)/historic'
                                        );
                                    } else if (fromValue === 'active') {
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
                                    if (id) {
                                        router.push({
                                            pathname: '/(meeting)/(edit)/[id]',
                                            params: { id, from: fromValue },
                                        });
                                    }
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
                name='newMeeting'
                options={({ route }) => {
                    // Get 'from' param from route or local search params
                    const params = route?.params as
                        | { from?: string }
                        | undefined;
                    const fromValue = getFrom(params);
                    return {
                        headerLeft: () => (
                            <TouchableOpacity
                                style={{ marginLeft: 16 }}
                                onPress={() => {
                                    if (fromValue === 'active') {
                                        router.replace(
                                            '/(drawer)/(meetings)/active'
                                        );
                                    } else if (fromValue === 'historic') {
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

export default function MeetingStackLayout() {
    return (
        <MeetingFromProvider>
            <MeetingStackLayoutInner />
        </MeetingFromProvider>
    );
}
