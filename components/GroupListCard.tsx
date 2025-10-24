import theme from '@assets/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Badge } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { deleteGroupFromMeeting } from '../features/meetings/meetingsThunks';
import type { FullGroup, Group } from '../types/interfaces';
import type { AppDispatch } from '../utils/store';
type GroupListCardProps = {
    group: Group | FullGroup;
    fromMeetingId?: string;
    onGroupDeleted?: () => void;
};
const GroupListCard = ({
    group,
    fromMeetingId,
    onGroupDeleted,
}: GroupListCardProps) => {
    const router = useRouter();
    //
    const user = useSelector((state: any) => state.user);
    const dispatch: AppDispatch = useDispatch();
    // const gender = genderKeys.includes(group.gender as any)
    //     ? GenderStrings[group.gender as keyof typeof GenderStrings]
    //     : 'Unknown';
    // Get org_id from parent params if available
    const parentParams = useLocalSearchParams();

    const handleDeleteGroupRequest = async (id: string) => {
        const api_token =
            user?.apiToken || user?.token || user?.profile?.apiToken;
        const meeting_id = fromMeetingId;
        if (!api_token || !meeting_id) return;
        try {
            await dispatch(
                deleteGroupFromMeeting({
                    api_token,
                    group_id: id,
                    meeting_id,
                })
            ).unwrap();
            if (onGroupDeleted) onGroupDeleted();
        } catch {
            // Optionally show error
        }
    };
    return (
        <Pressable
            style={({ pressed }) => pressed && localStyle.pressed}
            onPress={() => {
                // Pass the full group object as a param
                // Use string route and pass group object as query params
                router.push({
                    pathname: '/(group)/[id]',
                    params: {
                        ...group,
                        fromMeetingId,
                        // propagate origin, org_id and serialized meeting from parent params when present
                        origin: parentParams.origin
                            ? String(parentParams.origin)
                            : undefined,
                        org_id: parentParams.org_id
                            ? String(parentParams.org_id)
                            : undefined,
                        meeting: parentParams.meeting
                            ? String(parentParams.meeting)
                            : undefined,
                    },
                });
            }}
        >
            <View style={localStyle.rootContainer}>
                <View style={localStyle.cardAlign}>
                    <View style={localStyle.groupItem}>
                        <View style={localStyle.cardContainer}>
                            <View style={localStyle.row}>
                                {group.gender === 'f' && (
                                    <Text style={localStyle.groupListCardTitle}>
                                        Women&apos;s {group.title}
                                    </Text>
                                )}
                                {group.gender === 'm' && (
                                    <Text style={localStyle.groupListCardTitle}>
                                        Men&apos;s {group.title}
                                    </Text>
                                )}
                                {group.gender === 'x' && (
                                    <Text style={localStyle.groupListCardTitle}>
                                        {group.title}
                                    </Text>
                                )}
                                {}
                                <Text>
                                    {user.profile.permissions.includes(
                                        'groups'
                                    ) ? (
                                        <TouchableOpacity
                                            onPress={() =>
                                                handleDeleteGroupRequest(
                                                    group.id
                                                )
                                            }
                                        >
                                            <MaterialCommunityIcons
                                                name='trash-can-outline'
                                                size={25}
                                                color={theme.colors.critical}
                                            />
                                        </TouchableOpacity>
                                    ) : (
                                        'FALSE'
                                    )}
                                </Text>
                            </View>
                            <View style={localStyle.locationRow}>
                                {group.location && (
                                    <View>
                                        <Text
                                            style={localStyle.groupListCardText}
                                        >
                                            {group.location}
                                        </Text>
                                    </View>
                                )}
                                {group.facilitator && (
                                    <View>
                                        <Text
                                            style={localStyle.groupListCardText}
                                        >
                                            {group.facilitator}
                                        </Text>
                                    </View>
                                )}
                                {group.cofacilitator && (
                                    <View>
                                        <Text
                                            style={localStyle.groupListCardText}
                                        >
                                            {group.cofacilitator}
                                        </Text>
                                    </View>
                                )}
                                <View>
                                    <Badge
                                        size={30}
                                        style={localStyle.attendanceBadge}
                                    >
                                        {group.attendance
                                            ? group.attendance
                                            : '-'}
                                    </Badge>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </Pressable>
    );
};

export default GroupListCard;

const localStyle = StyleSheet.create({
    groupCard: {
        minWidth: '100%',
        flex: 1,
        gap: 8,
        padding: 1,
        marginBottom: 10,
        borderRadius: 12,
        backgroundColor: theme.colors.cardBackground,
        boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.1)',
    },
    cardContainer: {
        paddingHorizontal: 15,
        width: '100%',
        paddingTop: 5,
        paddingBottom: 10,
    },
    rootContainer: {
        marginHorizontal: 5,
    },
    cardAlign: { marginHorizontal: 20 },
    groupListCardTitle: {
        fontFamily: 'Roboto-Bold',
        color: theme.colors.darkText,
        fontWeight: '600',
        fontSize: 24,
    },
    pressed: {
        opacity: 0.75,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    locationRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 5,
    },
    groupItem: {
        marginVertical: 5,
        paddingBottom: 5,
        backgroundColor: theme.colors.cardBackground,
        flexDirection: 'row',
        //justifyContent: 'space-between',
        borderRadius: 10,
        elevation: 3,
        shadowColor: 'yellow',
        shadowRadius: 4,
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.4,
    },
    meetingCardActivePrimary: {
        backgroundColor: theme.colors.cardBackground,
    },
    meetingCardHistoricPrimary: {
        backgroundColor: theme.colors.cardBackground,
    },
    wrapper: {
        flexDirection: 'row',
        paddingVertical: 5,
    },
    genderIconContainer: {
        marginTop: 20,
        paddingHorizontal: 5,
    },

    trashIconWrapper: {
        justifyContent: 'center',
        paddingRight: 15,
    },
    column2: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '85%',
    },
    textWrapper: {
        width: '85%',
    },
    titleText: {
        textAlign: 'left',
        letterSpacing: 0.5,
    },
    locationText: {
        textAlign: 'left',
        letterSpacing: 0.5,
    },
    facilitatorText: {
        fontFamily: 'Roboto-Regular',
        fontSize: 24,
        paddingLeft: 0,
        letterSpacing: 0.5,
    },
    groupListCardText: {
        fontFamily: 'Roboto-Regular',
        color: theme.colors.darkText,
        fontSize: 20,
    },
    attendanceBadge: {
        backgroundColor: theme.colors.primaryBackground,
        color: theme.colors.lightText,
    },
});
