import MeetingListCard from '@components/MeetingListCard';
import { fetchAllMeetings } from '@features/meetings/meetingsThunks';
import { useFocusEffect } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '@utils/hooks';
import React, { useCallback } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import type { Meeting } from '../../../types/interfaces';

const ActiveMeetings = () => {
    // const renderMeeting = useCallback(({ item }: { item: any }) => {
    //     return <MeetingListCard meeting={item} />;
    // }, []);

    // const renderMeeting1 = useCallback(({ item }: { item: Meeting }) => {
    //     return <MeetingListCard meeting={item} />;
    // }, []);

    const dispatch = useAppDispatch();
    const renderMeeting = useCallback(({ item }: { item: Meeting }) => {
        return (
            <View style={styles.itemContainer}>
                <MeetingListCard meeting={item} origin='active' />
            </View>
        );
    }, []);

    // Always refresh active meetings on focus
    useFocusEffect(
        React.useCallback(() => {
            const apiToken = process.env.EXPO_PUBLIC_JERICHO_API_TOKEN;
            const org_id = process.env.EXPO_PUBLIC_TEST_ORGANIZATION_ID;
            if (apiToken && org_id) {
                dispatch<any>(fetchAllMeetings({ apiToken, org_id }));
            }
        }, [dispatch])
    );

    const meetings = useAppSelector(
        (state: any) => state.meetings.activeMeetings
    );
    const isLoading = useAppSelector((state: any) => state.meetings.isLoading);
    const [error, setError] = React.useState<string | null>(null);
    const [timeoutReached, setTimeoutReached] = React.useState(false);

    // Timeout fallback: if loading takes more than 8 seconds, show error
    React.useEffect(() => {
        let timeout: ReturnType<typeof setTimeout> | null = null;
        if (isLoading) {
            setTimeoutReached(false);
            timeout = setTimeout(() => {
                setTimeoutReached(true);
                setError('Loading meetings timed out. Please try again.');
            }, 8000);
        } else {
            setTimeoutReached(false);
            setError(null);
        }
        return () => {
            if (timeout) clearTimeout(timeout);
        };
    }, [isLoading]);

    // Optionally, handle error state from Redux if you add it to your slice
    // const reduxError = useAppSelector((state) => state.meetings.error);

    if (isLoading && !timeoutReached)
        return (
            <View style={styles.container}>
                <Text style={styles.text}>Loading...</Text>
            </View>
        );

    if (error) {
        return (
            <View style={styles.container}>
                <Text style={[styles.text, { color: 'red', marginBottom: 12 }]}>
                    {error}
                </Text>
                <Text style={{ marginBottom: 12 }}>
                    If the problem persists, check your network or try again
                    later.
                </Text>
                <Text
                    style={[
                        styles.linkText,
                        {
                            backgroundColor: '#F2A310',
                            padding: 12,
                            borderRadius: 8,
                        },
                    ]}
                    onPress={() => {
                        setError(null);
                        setTimeoutReached(false);
                        const apiToken =
                            process.env.EXPO_PUBLIC_JERICHO_API_TOKEN;
                        const org_id =
                            process.env.EXPO_PUBLIC_TEST_ORGANIZATION_ID;
                        if (apiToken && org_id) {
                            dispatch<any>(
                                fetchAllMeetings({ apiToken, org_id })
                            );
                        }
                    }}
                >
                    Retry
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Active Meetings</Text>
            <FlatList
                data={meetings || []}
                renderItem={renderMeeting}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ alignItems: 'center' }}
            />
        </View>
    );
};

export default ActiveMeetings;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 48,
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 16,
    },
    itemContainer: {
        width: '100%',
        paddingHorizontal: 15,
        marginVertical: 8,
    },
    link: {
        marginTop: 24,
        padding: 12,
        backgroundColor: '#F2A310',
        borderRadius: 8,
    },
    linkText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
