import theme from '@assets/Colors';
import themedStyles from '@assets/Styles';
import MeetingListCard from '@components/meeting/MeetingListCard';
import CustomButton from '@components/ui/CustomButton';
import type { Meeting } from '@types/interfaces';
import { useAppSelector } from '@utils/hooks';
import React, { useCallback, useState } from 'react';
import { FlatList, Modal, StatusBar, Text, View } from 'react-native';
import { Surface } from 'react-native-paper';
import { useSelector } from 'react-redux';
const HistoricMeetings = () => {
    const [refreshKey, setRefreshKey] = useState(Date.now());
    const renderMeeting = useCallback(({ item }: { item: Meeting }) => {
        return (
            <View style={styles.itemContainer}>
                <MeetingListCard meeting={item} origin='historic' />
            </View>
        );
    }, []);
    const historicMeetings = useSelector(
        (state: any) => state.meetings.historicMeetings
    );
    const [meeting, setMeeting] = useState<Meeting | null>(null);
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const refreshHistoricMeetingsFromApi = () => {
        console.log('Refreshing historic meetings from API...');
    };
    const handleDeleteResponse = (id: string, organizationId?: string) => {
        const meetingToDelete = historicMeetings.find((m: any) => m.id === id);
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

    const meetings = useAppSelector(
        (state: any) => state.meetings.historicMeetings
    );
    const isLoading = useAppSelector((state: any) => state.meetings.isLoading);

    if (isLoading)
        return (
            <View style={themedStyles.container}>
                <Text style={themedStyles.text}>Loading...</Text>
            </View>
        );

    return (
        <View style={themedStyles.container}>
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
            <Text style={themedStyles.screenTitleText}>Historic Meetings</Text>
            <FlatList
                key={`historic-meetings-${refreshKey}`}
                data={meetings || []}
                refreshing={isLoading}
                onRefresh={refreshHistoricMeetingsFromApi}
                keyExtractor={(item) => `historic-meeting-${item.id}`}
                contentContainerStyle={{ gap: 5 }}
                renderItem={({ item }) => (
                    <MeetingListCard
                        meeting={item}
                        origin='historic'
                        handleDelete={handleDeleteResponse}
                    />
                )}
                extraData={{
                    refreshKey,
                    meetingsCount: historicMeetings.length,
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

export default HistoricMeetings;
