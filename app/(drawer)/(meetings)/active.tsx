import themedStyles from '@assets/Styles';
import MeetingListCard from '@components/meeting/MeetingListCard';
import {
    deleteMeeting,
    fetchAllMeetings,
} from '@features/meetings/meetingsThunks';
import { useFocusEffect } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '@utils/hooks';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Alert, FlatList, Platform, Text, View } from 'react-native';
import type { Meeting } from '../../../types/interfaces';

interface DeleteInputType {
    api_token: any;
    organization_id: string;
    meeting_id: string;
}
// (optional) server response shape if you need it later
// interface DeleteAMeetingResponse {
//     status: number;
//     message: string;
//     data: any;
// }
const ActiveMeetings = () => {
    // const renderMeeting = useCallback(({ item }: { item: any }) => {
    //     return <MeetingListCard meeting={item} />;
    // }, []);

    // const renderMeeting1 = useCallback(({ item }: { item: Meeting }) => {
    //     return <MeetingListCard meeting={item} />;
    // }, []);`
    const user = useAppSelector((state) => state.user);
    const dispatch = useAppDispatch();
    // local state no longer needed for modal
    const [timeoutReached, setTimeoutReached] = useState(false);
    //todo: replace with actual org id from system redux slice
    const organization_id = process.env.EXPO_PUBLIC_TEST_ORGANIZATION_ID;
    // Using native Alert for confirmation avoids focus changes that can
    // retrigger screen effects and cause heavy rerenders.
    // const renderMeeting = useCallback(({ item }: { item: Meeting }) => {
    //     return (
    //         <View style={themedStyles.meetingsItemContainer}>
    //             <MeetingListCard meeting={item} origin='active' />
    //         </View>
    //     );
    // }, []);

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
    // No refreshKey; let Redux state drive the list.

    const refreshActiveMeetingsFromApi = () => {
        console.log('Refreshing active meetings from API...');
    };

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
    const handleDeleteResponse = (id: string) => {
        const meetingToDelete: Meeting | undefined = meetings?.find(
            (m: any) => m.id === id
        );
        if (!meetingToDelete) return;
        const date = meetingToDelete.meeting_date?.slice(0, 10) ?? '';
        const title = `${meetingToDelete.meeting_type}: ${meetingToDelete.title}`;

        Alert.alert(
            'Please confirm',
            `You are about to delete this meeting.\n\n${date}\n${title}\n\nNOTE: All groups for the meeting will be deleted as well.`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                    onPress: () => {},
                },
                {
                    text: 'Delete',
                    style: Platform.OS === 'ios' ? 'destructive' : 'default',
                    onPress: async () => {
                        const requestValues: DeleteInputType = {
                            api_token: user.apiToken,
                            organization_id:
                                meetingToDelete.organization_id || '',
                            meeting_id: meetingToDelete.id,
                        };
                        try {
                            (await dispatch<any>(
                                deleteMeeting(requestValues)
                            ).unwrap?.()) ??
                                dispatch<any>(deleteMeeting(requestValues));
                        } catch (err) {
                            console.log('Failed to delete meeting', err);
                        } finally {
                        }
                    },
                },
            ]
        );
    };
    // Optionally, handle error state from Redux if you add it to your slice
    // const reduxError = useAppSelector((state) => state.meetings.error);

    if (isLoading && !timeoutReached)
        return (
            <View style={themedStyles.meetingsContainer}>
                <Text style={themedStyles.meetingsText}>Loading...</Text>
            </View>
        );

    if (error) {
        return (
            <View style={themedStyles.meetingsContainer}>
                <Text
                    style={[
                        themedStyles.meetingsText,
                        { color: 'red', marginBottom: 12 },
                    ]}
                >
                    {error}
                </Text>
                <Text style={{ marginBottom: 12 }}>
                    If the problem persists, check your network or try again
                    later.
                </Text>
                <Text
                    style={themedStyles.meetingListError}
                    onPress={() => {
                        setError(null);
                        setTimeoutReached(false);
                        const apiToken = user.apiToken;
                        const org_id = organization_id;
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
        <View style={themedStyles.surface}>
            <Text style={themedStyles.screenTitleText}>Active Meetings</Text>
            <FlatList
                data={meetings || []}
                refreshing={isLoading}
                onRefresh={refreshActiveMeetingsFromApi}
                keyExtractor={(item) => `active-meeting-${item.id}`}
                contentContainerStyle={{ gap: 5 }}
                renderItem={({ item }) => (
                    <MeetingListCard
                        meeting={item}
                        origin='active'
                        handleDelete={handleDeleteResponse}
                    />
                )}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={10}
                removeClippedSubviews={Platform.OS === 'android'}
                updateCellsBatchingPeriod={50}
            />
            <StatusBar style='auto' />
        </View>
    );
};

export default ActiveMeetings;
