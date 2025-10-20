import theme from '@assets/Colors';
import themedStyles from '@assets/Styles';
import MeetingListCard from '@components/meeting/MeetingListCard';
import CustomButton from '@components/ui/CustomButton';
import {
    deleteMeeting,
    fetchAllMeetings,
} from '@features/meetings/meetingsThunks';
import { useFocusEffect } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '@utils/hooks';
import React, { useCallback, useState } from 'react';
import { FlatList, Modal, StatusBar, Text, View } from 'react-native';
import { Surface } from 'react-native-paper';
import { useSelector } from 'react-redux';
import type { Meeting } from '../../../types/interfaces';

interface DeleteInputType {
    api_token: any;
    organization_id: string;
    meeting_id: string;
}
interface DeleteAMeetingResponse {
    status: number;
    message: string;
    // Consider refining the data type if known
    data: any; // could be object, array, etc.
}
const ActiveMeetings = () => {
    // const renderMeeting = useCallback(({ item }: { item: any }) => {
    //     return <MeetingListCard meeting={item} />;
    // }, []);

    // const renderMeeting1 = useCallback(({ item }: { item: Meeting }) => {
    //     return <MeetingListCard meeting={item} />;
    // }, []);`
    const user = useAppSelector((state) => state.user);
    const dispatch = useAppDispatch();
    const activeMeetings = useSelector(
        (state: any) => state.meetings.activeMeetings
    );
    const [meeting, setMeeting] = useState<Meeting | null>(null);
    const [timeoutReached, setTimeoutReached] = useState(false);
    //todo: replace with actual org id from system redux slice
    const organization_id = process.env.EXPO_PUBLIC_TEST_ORGANIZATION_ID;
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const renderMeeting = useCallback(({ item }: { item: Meeting }) => {
        return (
            <View style={themedStyles.meetingsItemContainer}>
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
    const [refreshKey, setRefreshKey] = React.useState(Date.now());

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
    const handleDeleteResponse = (id: string, organizationId?: string) => {
        const meetingToDelete = activeMeetings.find((m: any) => m.id === id);
        if (meetingToDelete) {
            // Use optional chaining for safety
            setMeeting(meetingToDelete);
            setShowDeleteConfirmModal(true);
        }
    };
    const handleDeleteConfirm = () => {
        if (meeting?.id) {
            //* the database will delete any groups associated with
            //* the meeting so no need to handle more than the
            //* meeting table.

            const requestValues: DeleteInputType = {
                api_token: user.apiToken,
                organization_id: meeting.organization_id || '',
                meeting_id: meeting.id,
            };
            const appDispatch = useAppDispatch();
            (appDispatch as any)(deleteMeeting(requestValues));
            setMeeting(null);
            setShowDeleteConfirmModal(false);
        }
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
            <Modal visible={showDeleteConfirmModal} animationType='slide'>
                <View style={themedStyles.modal}>
                    <View style={themedStyles.modalHeaderContainer}>
                        <Text style={themedStyles.modalHeaderText}>
                            PLEASE CONFIRM
                        </Text>
                    </View>
                    <View style={themedStyles.modalSurfaceContainer}>
                        <Surface style={themedStyles.modalSurface}>
                            <View style={themedStyles.modalWarningContainer}>
                                <Text style={themedStyles.modalWarningText}>
                                    Your are about to delete the following
                                    meeting.
                                </Text>
                            </View>
                            <View style={themedStyles.modalDateContainer}>
                                <Text style={themedStyles.modalDateText}>
                                    {meeting?.meeting_date?.slice(0, 10)}
                                </Text>
                            </View>
                            <View>
                                <Text style={themedStyles.modalMeetingInfoText}>
                                    {meeting?.meeting_type}: {meeting?.title}
                                </Text>
                            </View>
                            <View style={themedStyles.modalNoteContainer}>
                                <Text style={themedStyles.modalNoteText}>
                                    NOTE: All groups for the meeting will be
                                    deleted as well.
                                </Text>
                            </View>
                            <View style={themedStyles.buttonContainer}>
                                <View style={themedStyles.buttonWrapper}>
                                    <CustomButton
                                        text='No, CANCEL'
                                        bgColor={theme.colors.mediumGreen}
                                        fgColor={theme.colors.lightText}
                                        onPress={() =>
                                            setShowDeleteConfirmModal(false)
                                        }
                                    />
                                </View>

                                <View style={themedStyles.buttonWrapper}>
                                    <CustomButton
                                        text='Yes, DELETE'
                                        bgColor={theme.colors.critical}
                                        fgColor={theme.colors.lightText}
                                        onPress={() => handleDeleteConfirm()}
                                    />
                                </View>
                            </View>
                        </Surface>
                    </View>
                    <StatusBar style='auto' />
                </View>
            </Modal>
            <Text style={themedStyles.screenTitleText}>Active Meetings</Text>
            {/* <FlatList
                data={meetings || []}
                renderItem={renderMeeting}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ alignItems: 'center' }}
            /> */}
            <FlatList
                key={`active-meetings-${refreshKey}`}
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
                extraData={{
                    refreshKey,
                    meetingsCount: activeMeetings.length,
                }}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={10}
                removeClippedSubviews={true}
                updateCellsBatchingPeriod={50}
            />
        </View>
    );
};

export default ActiveMeetings;
