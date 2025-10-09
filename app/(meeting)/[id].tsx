import theme from '@assets/Colors';
import GroupListCard from '@components/GroupListCard';
import MealDetails from '@components/meeting/MealDetails';
import MeetingAttendance from '@components/meeting/MeetingAttendance';
import MeetingDate from '@components/meeting/MeetingDate';
import MeetingIds from '@components/meeting/MeetingIds';
import BadgeNumber from '@components/ui/BadgeNumber';
import { FontAwesome5 } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { FullMeeting, Group } from '@types/interfaces';
import { getAMeeting } from '@utils/api';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Surface } from 'react-native-paper';
import { useSelector } from 'react-redux';
const Colors = theme.colors;

const MeetingDetails = () => {
    const { id, org_id, origin } = useLocalSearchParams<{
        id: string;
        org_id: string;
        origin?: string;
    }>();
    const router = useRouter();
    const [historic, setHistoric] = React.useState(false);
    const [groups, setGroups] = React.useState<Group[]>([]);
    const user = useSelector((state: any) => state.user);
    // const defaultGroups = useSelector((state) => state.groups.defaultGroups);
    //const newPerms = useSelector((state) => state.user.perms);
    const [meeting, setMeeting] = React.useState<FullMeeting | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const navigation = useNavigation();

    // Add Edit button to header (Expo Router v2+ pattern)
    // Use a custom header if needed, or add edit button in the screen for now

    useFocusEffect(
        React.useCallback(() => {
            let isActive = true;
            // Reset state before fetching
            setMeeting(null);
            setGroups([]);
            setIsLoading(true);
            async function fetchMeeting() {
                if (!id || !org_id) {
                    setIsLoading(false);
                    return;
                }
                try {
                    const fetchedMeeting: FullMeeting = await getAMeeting(
                        org_id,
                        id
                    );
                    if (isActive) {
                        setMeeting(fetchedMeeting);
                        if (fetchedMeeting.groups)
                            setGroups(fetchedMeeting.groups);

                        // Check if meeting_date is before today
                        const meetingDate = new Date(
                            fetchedMeeting.meeting_date
                        );
                        const today = new Date();
                        // Zero out time for today for accurate comparison
                        today.setHours(0, 0, 0, 0);
                        if (meetingDate < today) {
                            setHistoric(true);
                        } else {
                            setHistoric(false);
                        }
                    }
                } catch (error) {
                    if (isActive)
                        console.error('Error fetching meeting:', error);
                } finally {
                    if (isActive) setIsLoading(false);
                }
            }
            fetchMeeting();
            return () => {
                isActive = false;
            };
        }, [id, org_id])
    );

    // Map meeting_type to display string
    const meetingTypeDisplay: Record<string, string> = {
        regular: 'Regular Meeting',
        special: 'Special Meeting',
        board: 'Board Meeting',
        // Add more mappings as needed
    };
    const meetingTypeString =
        meeting &&
        (meetingTypeDisplay[meeting.meeting_type] ||
            meeting.meeting_type ||
            '');

    // Set header title dynamically after meeting is loaded
    React.useLayoutEffect(() => {
        if (
            meetingTypeString &&
            navigation &&
            typeof navigation.setOptions === 'function'
        ) {
            navigation.setOptions({ title: meetingTypeString });
        }
    }, [meetingTypeString, navigation]);

    // Removed unused generateUUID
    if (isLoading || !meeting) {
        return (
            <View style={localStyles.container}>
                <Text>Loading meeting...</Text>
                <ActivityIndicator
                    size='large'
                    color={Colors.activityIndicator}
                />
            </View>
        );
    }

    // Basic Meeting info form (read-only)
    return (
        <Surface style={localStyles.surface}>
            <View style={localStyles.firstRow}>
                <MeetingDate date={meeting.meeting_date} />
                <View style={{ flex: 1 }}>
                    <MeetingIds meeting={meeting} historic={historic} />
                </View>
            </View>
            {meeting.attendance_count > 0 && (
                <MeetingAttendance attendanceCount={meeting.attendance_count} />
            )}
            <MealDetails
                meal={meeting.meal}
                mealContact={meeting.meal_contact}
                historic={historic}
                mealCount={meeting.meal_count}
            />
            {Number(meeting.newcomers_count) > 0 && (
                <View style={localStyles.row}>
                    <View style={localStyles.detailsContainer}>
                        <Text style={localStyles.detailsRowLabel}>
                            Newcomers:
                        </Text>
                    </View>

                    <View style={localStyles.detailsBadgeContainer}>
                        <BadgeNumber value={Number(meeting.newcomers_count)} />
                    </View>
                </View>
            )}
            {meeting.notes && (
                <View style={localStyles.notesContainer}>
                    <Text style={localStyles.notesText}>{meeting.notes}</Text>
                </View>
            )}
            <View style={localStyles.openShareSection}>
                <View style={localStyles.openShareContainer}>
                    <Text style={localStyles.openShareGroupsText}>
                        Open-Share Groups
                    </Text>
                    {(user.profile.permissions.includes('manage') ||
                        user.profile.perms.includes('groups')) && (
                        <View style={localStyles.openShareButtonContainer}>
                            <TouchableOpacity
                                key={0}
                                onPress={() =>
                                    router.push(
                                        `/(group)/newGroup?meetingId=${encodeURIComponent(
                                            id
                                        )}`
                                    )
                                }
                                style={localStyles.openShareButtonContainer}
                            >
                                <FontAwesome5
                                    name='plus-circle'
                                    size={20}
                                    color={theme.colors.lightText}
                                />
                            </TouchableOpacity>
                        </View>
                    )}
                    {/* {defaultGroups?.length > 0 && (
                        <View style={localStyles.openShareGroupsButtonWrapper}>
                            <View
                                style={
                                    localStyles.openShareGroupsButtonContainer
                                }
                            >
                                <FontAwesome5
                                    name='layer-group'
                                    size={20}
                                    color={theme.colors.lightText}
                                />
                            </View>
                        </View>
                    )} */}
                </View>
            </View>
            <FlatList
                data={groups}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <GroupListCard group={item} fromMeetingId={id} />
                )}
            />
            <TouchableOpacity
                style={{
                    backgroundColor: theme.colors.blue,
                    padding: 16,
                    borderRadius: 8,
                    alignItems: 'center',
                    margin: 16,
                }}
                onPress={() =>
                    router.push(
                        `/(group)/newGroup?meetingId=${encodeURIComponent(id)}`
                    )
                }
            >
                <Text
                    style={{
                        color: theme.colors.white,
                        fontWeight: 'bold',
                        fontSize: 16,
                    }}
                >
                    Add New Group
                </Text>
            </TouchableOpacity>
        </Surface>
    );
};

export default MeetingDetails;

const localStyles = StyleSheet.create({
    surface: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: theme.colors.primaryBackground,
        paddingVertical: 16,
    },
    screenTitleContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    screenTitleText: {
        fontSize: 30,
        fontFamily: 'Roboto-Bold',
        color: theme.colors.lightText,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 5,
    },
    firstRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 0,
        marginHorizontal: 10,
    },
    row1col2: {
        flexDirection: 'column',
        marginLeft: 5,
        marginRight: 10,
    },
    textColumn: {
        alignContent: 'flex-start',
    },
    detailsContainer: { marginLeft: 20 },
    detailsBadgeContainer: {
        marginLeft: 'auto',
        paddingVertical: 0,
        paddingHorizontal: 10,
    },
    meetingInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginVertical: 8,
    },
    notesContainer: {
        marginHorizontal: 10,
        marginBottom: 15,
        borderRadius: 5,
        paddingHorizontal: 15,
        backgroundColor: theme.colors.lightGraphic,
    },
    notesText: {
        color: theme.colors.darkText,
        fontFamily: 'Roboto-Regular',
        fontSize: 24,
    },
    detailsRowLabel: {
        fontFamily: 'Roboto-Regular',
        color: theme.colors.lightText,
        fontSize: 24,
        fontWeight: '400',
    },
    meetingTitleContainer: {
        flex: 1,
        marginLeft: 8,
        justifyContent: 'center',
    },
    meetingTitleText: {
        flexWrap: 'wrap',
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.darkText,
    },
    infoContainer: {
        marginHorizontal: 10,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'stretch',
    },
    groupsContainer: {
        flexDirection: 'row',
    },

    linkRow: {
        marginTop: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
    },
    link: {
        marginTop: 24,
        padding: 12,
        backgroundColor: theme.colors.link,
        borderRadius: 8,
        minWidth: 120,
        alignItems: 'center',
    },
    linkText: {
        color: theme.colors.lightText,
        fontWeight: 'bold',
    },
    openShareSection: {
        borderTopColor: theme.colors.accent,
        borderBottomColor: theme.colors.accent,
        marginHorizontal: 10,
        marginBottom: 5,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderTopWidth: StyleSheet.hairlineWidth,
    },
    openShareContainer: {
        flexDirection: 'row',
        textAlign: 'center',
        justifyContent: 'center',
    },
    openShareButtonContainer: {
        justifyContent: 'center',
        marginLeft: 10,
    },
    openShareGroupsButtonWrapper: {
        paddingLeft: 20,
        justifyContent: 'center',
    },
    openShareGroupsButtonContainer: {
        justifyContent: 'center',
        verticalAlign: 'middle',
        borderWidth: 1,
        borderColor: theme.colors.accent,
    },
    openShareGroupsListHeaderContainer: {
        alignItems: 'center',
    },
    openShareGroupsListHeaderText: {
        color: theme.colors.accent,
        fontFamily: 'Roboto-Regular',
    },
    openShareGroupsListFooterContainer: {
        alignItems: 'center',
    },
    openShareGroupsListFooterText: {
        color: theme.colors.accent,
        fontFamily: 'Roboto-Regular',
    },
    openShareGroupsText: {
        color: theme.colors.lightText,
        fontSize: 20,
        fontWeight: '400',
        fontFamily: 'Roboto-Regular',
        textAlign: 'center',
        paddingVertical: 5,
    },
});
