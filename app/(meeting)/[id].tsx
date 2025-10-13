import theme from '@assets/Colors';
import GroupListCard from '@components/GroupListCard';
import MealDetails from '@components/meeting/MealDetails';
import MeetingAttendance from '@components/meeting/MeetingAttendance';
import BadgeNumber from '@components/ui/BadgeNumber';
import { FontAwesome5 } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { FullMeeting, Group } from '@types/interfaces';
// import { getAMeeting } from '@utils/api';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Surface } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMeetingDetailsById } from '../../features/meetings/meetingsThunks';
import type { AppDispatch } from '../../utils/store';
const Colors = theme.colors;

const MeetingDetails = () => {
    const { id, origin } = useLocalSearchParams<{
        id: string;
        origin?: string;
    }>();
    const router = useRouter();
    const [historic, setHistoric] = React.useState(false);
    const [groups, setGroups] = React.useState<Group[]>([]);
    const [error, setError] = React.useState<string | null>(null);
    const user = useSelector((state: any) => state.user);
    const org_id = user?.profile?.activeOrg?.id;
    const api_token = user?.apiToken || user?.token || user?.profile?.apiToken;
    const dispatch: AppDispatch = useDispatch();
    // const defaultGroups = useSelector((state) => state.groups.defaultGroups);
    //const newPerms = useSelector((state) => state.user.perms);
    const [meeting, setMeeting] = React.useState<FullMeeting | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const navigation = useNavigation();

    // Add Edit button to header (Expo Router v2+ pattern)
    // Use a custom header if needed, or add edit button in the screen for now

    // Helper to refresh meeting after group delete or on mount
    const refreshMeeting = React.useCallback(async () => {
        if (!api_token || !org_id || !id) return;
        setIsLoading(true);
        setError(null);
        try {
            const result = await dispatch(
                fetchMeetingDetailsById({
                    apiToken: api_token,
                    organizationId: org_id,
                    meetingId: id,
                })
            ).unwrap();
            // Support both result.data.currentMeeting and result.data (for legacy)
            let meetingData = result?.data?.currentMeeting || result?.data;
            if (meetingData) {
                setMeeting(meetingData);
                setGroups(meetingData.groups || []);
                // Set historic flag
                const meetingDate = new Date(meetingData.meeting_date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                setHistoric(meetingDate < today);
            } else {
                setMeeting(null);
                setGroups([]);
                setError('Meeting not found.');
            }
        } catch (err) {
            setMeeting(null);
            setGroups([]);
            setError('Failed to load meeting. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [api_token, org_id, id, dispatch]);

    // Always use Redux thunk for fetching meeting details
    useFocusEffect(
        React.useCallback(() => {
            refreshMeeting();
        }, [refreshMeeting])
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
    if (isLoading) {
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
    if (error) {
        return (
            <View style={localStyles.container}>
                <Text style={{ color: Colors.critical, marginBottom: 12 }}>
                    {error}
                </Text>
                <TouchableOpacity
                    style={{
                        backgroundColor: Colors.accent,
                        padding: 12,
                        borderRadius: 6,
                    }}
                    onPress={refreshMeeting}
                >
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                        Retry
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }
    if (!meeting) {
        return (
            <View style={localStyles.container}>
                <Text>No meeting data found.</Text>
            </View>
        );
    }

    // Basic Meeting info form (read-only)
    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
        >
            <Surface style={localStyles.surface}>
                <View style={localStyles.firstRow}>
                    <View style={localStyles.meetingTitleContainer}>
                        <View style={mtrTheme.selectorWrapper}>
                            <TypeSelectors
                                pick={theMeeting?.meeting_type}
                                setPick={handleTypeChange}
                            />
                        </View>
                    </View>
                </View>
                {meeting.attendance_count > 0 && (
                    <MeetingAttendance
                        attendanceCount={meeting.attendance_count}
                    />
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
                            <BadgeNumber
                                value={Number(meeting.newcomers_count)}
                            />
                        </View>
                    </View>
                )}
                {meeting.notes && (
                    <View style={localStyles.notesContainer}>
                        <Text style={localStyles.notesText}>
                            {meeting.notes}
                        </Text>
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
                        <GroupListCard
                            group={item}
                            fromMeetingId={id}
                            onGroupDeleted={refreshMeeting}
                        />
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
                            `/(group)/newGroup?meetingId=${encodeURIComponent(
                                id
                            )}`
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
        </KeyboardAvoidingView>
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
