import themedStyles from '@assets/Styles';
import MeetingListCard from '@components/meeting/MeetingListCard';
import {
    deleteMeeting,
    fetchAllMeetings,
} from '@features/meetings/meetingsThunks';
import { useFocusEffect } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '@utils/hooks';
import React, { useState } from 'react';
import { Alert, FlatList, Platform, Text, View } from 'react-native';
import type { Meeting } from '../../../types/interfaces';

interface DeleteInputType {
    api_token: any;
    organization_id: string;
    meeting_id: string;
}

const HistoricMeetings = () => {
    const appDispatch = useAppDispatch();
    const user = useAppSelector((state) => state.user);
    // local modal state removed; use native Alert instead
    const [timeoutReached, setTimeoutReached] = useState(false);

    const refreshHistoricMeetingsFromApi = React.useCallback(() => {
        const apiToken = process.env.EXPO_PUBLIC_JERICHO_API_TOKEN;
        const org_id = process.env.EXPO_PUBLIC_TEST_ORGANIZATION_ID;
        if (apiToken && org_id) {
            appDispatch<any>(fetchAllMeetings({ apiToken, org_id }));
        }
    }, [appDispatch]);

    useFocusEffect(
        React.useCallback(() => {
            refreshHistoricMeetingsFromApi();
        }, [refreshHistoricMeetingsFromApi])
    );

    const meetings = useAppSelector(
        (state: any) => state.meetings.historicMeetings
    );

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
                { text: 'Cancel', style: 'cancel', onPress: () => {} },
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
                            (await appDispatch<any>(
                                deleteMeeting(requestValues)
                            ).unwrap?.()) ??
                                appDispatch<any>(deleteMeeting(requestValues));
                        } catch (err) {
                            console.log('Failed to delete meeting', err);
                        }
                    },
                },
            ]
        );
    };
    const isLoading = useAppSelector((state: any) => state.meetings.isLoading);

    React.useEffect(() => {
        let timeout: ReturnType<typeof setTimeout> | null = null;
        if (isLoading) {
            setTimeoutReached(false);
            timeout = setTimeout(() => {
                setTimeoutReached(true);
            }, 8000);
        } else {
            setTimeoutReached(false);
        }
        return () => {
            if (timeout) clearTimeout(timeout);
        };
    }, [isLoading]);

    if (isLoading && !timeoutReached)
        return (
            <View style={themedStyles.meetingsContainer}>
                <Text style={themedStyles.meetingsText}>Loading...</Text>
            </View>
        );

    return (
        <View style={themedStyles.surface}>
            <Text style={themedStyles.screenTitleText}>Historic Meetings</Text>

            <FlatList
                data={meetings || []}
                refreshing={isLoading}
                onRefresh={refreshHistoricMeetingsFromApi}
                keyExtractor={(item: any) => `historic-meeting-${item.id}`}
                contentContainerStyle={themedStyles.meetingsListContainer}
                renderItem={({ item }) => (
                    <MeetingListCard
                        meeting={item}
                        origin='historic'
                        handleDelete={handleDeleteResponse}
                    />
                )}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={10}
                removeClippedSubviews={Platform.OS === 'android'}
                updateCellsBatchingPeriod={50}
            />
        </View>
    );
};

export default HistoricMeetings;
