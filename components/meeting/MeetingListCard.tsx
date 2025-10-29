import theme from '@assets/Colors';
import themedStyles from '@assets/Styles';
import DateStack from '@components/ui/DateStack';
import Tooltip from '@components/ui/ToolTip';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import { Badge } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import {
    setCurrentMeeting,
    upsertMeeting,
} from '../../features/meetings/meetingsSlice';
import { Meeting } from '../../types/interfaces';

interface MeetingListCardProps {
    meeting: Meeting;
    origin?: 'active' | 'historic';
    handleDelete?: (id: string, organizationId?: string) => void;
}
const MeetingListCard = ({
    meeting,
    origin,
    handleDelete,
}: MeetingListCardProps) => {
    const router = useRouter();
    const dispatch = useDispatch();
    const user = useSelector((state: any) => state.user);
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const toggleTooltip = () => {
        setTooltipVisible(!tooltipVisible);
    };
    const isManagePermitted = user?.profile?.permissions.includes('manage');
    const hasWorship = !!meeting?.worship;
    return (
        <View style={themedStyles.cardRootContainer}>
            <Pressable
                style={({ pressed }) => pressed && themedStyles.pressed}
                onPress={() => {
                    // Upsert meeting into redux and set as current so the
                    // meeting details/edit screens can read it from the store
                    // even if the router drops route params.
                    try {
                        dispatch(upsertMeeting(meeting as any));
                        dispatch(setCurrentMeeting(meeting as any));
                    } catch (e) {
                        // non-fatal
                        console.warn(
                            'Failed to upsert or set current meeting:',
                            e
                        );
                    }
                    router.push({
                        pathname: '/(meeting)/[id]',
                        params: {
                            id: meeting.id,
                            org_id: meeting.organization_id,
                            origin: origin || '',
                            // Pass the meeting object so the details screen can
                            // render immediately without a backend fetch.
                            meeting: JSON.stringify(meeting),
                        },
                    });
                }}
            >
                <View
                    style={[
                        themedStyles.cardMeetingItem,
                        origin === 'active'
                            ? themedStyles.cardActiveMeetingPrimary
                            : themedStyles.cardHistoricMeetingPrimary,
                    ]}
                >
                    <View style={themedStyles.cardFirstRow}>
                        <View style={themedStyles.cardColumnDate}>
                            <View style={themedStyles.cardColumnDate}>
                                <DateStack date={meeting?.meeting_date} />
                            </View>
                        </View>

                        <View style={themedStyles.cardColumnText}>
                            <View style={themedStyles.DefinitionContainer}>
                                <Text style={themedStyles.cardMeetingTypeText}>
                                    {meeting?.meeting_type?.trim()}
                                </Text>
                                <Text style={themedStyles.cardMeetingTypeText}>
                                    {meeting?.title?.trim()}
                                </Text>
                                {meeting?.meeting_type !== 'Testimony' && (
                                    <Text
                                        style={themedStyles.cardMeetingTypeText}
                                    >
                                        {meeting?.support_contact?.trim()}
                                    </Text>
                                )}
                            </View>

                            {hasWorship && (
                                <View style={themedStyles.cardIconContainer}>
                                    <TouchableOpacity
                                        onPress={toggleTooltip}
                                        accessibilityLabel='Show worship information'
                                        accessibilityRole='button'
                                    >
                                        <MaterialCommunityIcons
                                            name='music'
                                            size={20}
                                            color={theme.colors.primary}
                                        />
                                    </TouchableOpacity>

                                    {tooltipVisible && (
                                        <Tooltip content={meeting.worship}>
                                            <View style={themedStyles.tooltip}>
                                                <Text
                                                    style={
                                                        themedStyles.tooltipText
                                                    }
                                                >
                                                    {meeting.worship}
                                                </Text>
                                            </View>
                                        </Tooltip>
                                    )}
                                </View>
                            )}
                        </View>
                    </View>

                    <View style={themedStyles.cardColumnIcons}>
                        <Badge size={30} style={themedStyles.badge}>
                            {meeting.attendance_count || 0}
                        </Badge>

                        {isManagePermitted && (
                            <TouchableOpacity
                                onPress={() =>
                                    meeting.id &&
                                    meeting.organization_id &&
                                    handleDelete &&
                                    handleDelete(
                                        meeting.id,
                                        meeting.organization_id
                                    )
                                }
                                accessibilityLabel='Delete meeting'
                                accessibilityRole='button'
                            >
                                <MaterialCommunityIcons
                                    name='delete-forever'
                                    size={30}
                                    color={theme.colors.critical}
                                />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </Pressable>
        </View>
    );
};

export default MeetingListCard;

// (Intentionally no local styles here; component uses themedStyles)
