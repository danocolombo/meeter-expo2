import theme from '@assets/Colors';
import themedStyles from '@assets/Styles';
import MeetingListCard from '@components/meeting/MeetingListCard';
import CustomButton from '@components/ui/CustomButton';
import {
    deleteMeeting,
    fetchAllMeetings,
} from '@features/meetings/meetingsThunks';
import { useFocusEffect } from '@react-navigation/native';
import type { Meeting } from '@types/interfaces';
import { useAppDispatch, useAppSelector } from '@utils/hooks';
import React, { useState } from 'react';
import { FlatList, Modal, StatusBar, Text, View } from 'react-native';
import { Surface } from 'react-native-paper';
import { useSelector } from 'react-redux';
interface DeleteInputType {
    api_token: any;
    organization_id: string;
    meeting_id: string;
}

const HistoricMeetings = () => {
    const appDispatch = useAppDispatch();
    // Removed unused refreshKey and renderMeeting
    const user = useAppSelector((state) => state.user);
    const historicMeetings = useSelector(
        (state: any) => state.meetings.historicMeetings
    );
    const [meeting, setMeeting] = useState<Meeting | null>(null);
    const [timeoutReached] = useState(false); // Removed unused setTimeoutReached
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const refreshHistoricMeetingsFromApi = () => {
        console.log('Refreshing historic meetings from API...');
    };

    // Refresh historic meetings on focus (same pattern as ActiveMeetings)
    useFocusEffect(
        React.useCallback(() => {
            const apiToken = process.env.EXPO_PUBLIC_JERICHO_API_TOKEN;
            const org_id = process.env.EXPO_PUBLIC_TEST_ORGANIZATION_ID;
            console.log('HistoricMeetings: screen focused, fetching meetings');
            if (apiToken && org_id) {
                appDispatch<any>(fetchAllMeetings({ apiToken, org_id }));
            }
        }, [appDispatch])
    );
    const handleDeleteResponse = (id: string, organizationId?: string) => {
        const meetingToDelete = historicMeetings.find((m: any) => m.id === id);
        if (meetingToDelete) {
            setMeeting(meetingToDelete);
            setShowDeleteConfirmModal(true);
        }
    };
    const handleDeleteConfirm = () => {
        if (meeting?.id) {
            const requestValues: DeleteInputType = {
                api_token: user.apiToken,
                organization_id: meeting.organization_id || '',
                meeting_id: meeting.id,
            };
            appDispatch(deleteMeeting(requestValues) as any);
            setMeeting(null);
            setShowDeleteConfirmModal(false);
        }
    };

    const meetings = useAppSelector(
        (state: any) => state.meetings.historicMeetings
    );
    const isLoading = useAppSelector((state: any) => state.meetings.isLoading);

    if (isLoading && !timeoutReached)
        return (
            <View style={themedStyles.meetingsContainer}>
                <Text style={themedStyles.meetingsText}>Loading...</Text>
            </View>
        );

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
                    <StatusBar />
                </View>
            </Modal>
            <Text style={themedStyles.screenTitleText}>Historic Meetings</Text>
            <FlatList
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
