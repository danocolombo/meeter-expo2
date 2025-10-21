import theme from '@assets/Colors';
import themedStyles from '@assets/Styles';
import GroupListCard from '@components/GroupListCard';
import MealDetails from '@components/meeting/MealDetails';
import MeetingAttendance from '@components/meeting/MeetingAttendance';
import MeetingIds from '@components/meeting/MeetingIds';
import BadgeNumber from '@components/ui/BadgeNumber';
import { FontAwesome5 } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { FullMeeting, Group } from '../../types/interfaces';
// import { getAMeeting } from '@utils/api';
import MeetingDate from '@components/meeting/MeetingDate';
import TypeSelectors from '@components/meeting/TypeSelectors';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Surface } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMeetingDetailsById } from '../../features/meetings/meetingsThunks';
import type { AppDispatch } from '../../utils/store';
const Colors = theme.colors;

// Comparator to sort groups by gender, then title, then location
function compareGroups(a: Group, b: Group) {
    const ga = (a.gender || '').toString();
    const gb = (b.gender || '').toString();
    if (ga < gb) return -1;
    if (ga > gb) return 1;

    const ta = (a.title || '').toString().toLowerCase();
    const tb = (b.title || '').toString().toLowerCase();
    if (ta < tb) return -1;
    if (ta > tb) return 1;

    const la = (a.location || '').toString().toLowerCase();
    const lb = (b.location || '').toString().toLowerCase();
    if (la < lb) return -1;
    if (la > lb) return 1;

    return 0;
}

const MeetingDetails = () => {
    const { id, origin } = useLocalSearchParams<{
        id: string;
        origin?: string | string[];
    }>();
    // Normalize origin which may be a string or array (from query params)
    const originValue: string = React.useMemo(() => {
        if (!origin) return '';
        if (Array.isArray(origin)) return origin[0] || '';
        return String(origin || '');
    }, [origin]);
    const router = useRouter();
    const [historic, setHistoric] = React.useState(false);
    const [, setIsSavable] = React.useState(false);
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

    // Top navigation cancel handler — navigate back to the meetings list
    const handleCancel = React.useCallback(() => {
        // origin expected to be 'active' or 'historic'
        if (originValue === 'historic') {
            router.replace('/(drawer)/(meetings)/historic');
            return;
        }
        // default to active
        router.replace('/(drawer)/(meetings)/active');
    }, [originValue, router]);

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
                const fetchedGroups: Group[] = meetingData.groups || [];
                // Sort groups by gender, title, location for display
                fetchedGroups.sort(compareGroups);
                setGroups(fetchedGroups);
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
        } catch (err: any) {
            console.error('Failed to fetch meeting details:', err);
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
    const handleTypeChange = (value: string) => {
        if (!user.profile.permissions.includes('manage')) {
            return;
        }
        let titleVal = false;
        let contactVal = false;
        switch (meeting?.meeting_type) {
            case 'Testimony':
                setIsSavable(titleVal);
                break;
            case 'Special':
                if (titleVal && contactVal) {
                    setIsSavable(true);
                }
                break;
            case 'Lesson':
                if (titleVal && contactVal) {
                    setIsSavable(true);
                }
                break;
            default:
                break;
        }
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
            // Set title and add Edit button to header that passes the meeting object
            navigation.setOptions({
                title: '',
                headerRight: () => {
                    // Only show edit when we have a meeting and user has manage perms
                    if (!meeting) return null;
                    const canEdit =
                        user?.profile?.permissions?.includes('manage') ||
                        user?.profile?.perms?.includes('meetings');
                    if (!canEdit) return null;
                    return (
                        <TouchableOpacity
                            style={{ marginRight: 16 }}
                            onPress={() => {
                                try {
                                    const meetingParam =
                                        JSON.stringify(meeting);
                                    router.push({
                                        pathname: '/(meeting)/(edit)/[id]',
                                        params: {
                                            id,
                                            meeting: meetingParam,
                                            from: origin || undefined,
                                        },
                                    });
                                } catch (e) {
                                    console.warn(
                                        'Failed to serialize meeting for edit navigation',
                                        e
                                    );
                                    // fallback: navigate with id only
                                    router.push({
                                        pathname: '/(meeting)/(edit)/[id]',
                                        params: {
                                            id,
                                            from: origin || undefined,
                                        },
                                    });
                                }
                            }}
                        >
                            <Text style={{ color: '#007AFF', fontSize: 16 }}>
                                Edit
                            </Text>
                        </TouchableOpacity>
                    );
                },
            });
        }
    }, [meetingTypeString, navigation, meeting, router, id, origin, user]);

    // Removed unused generateUUID
    if (isLoading) {
        return (
            <View style={themedStyles.container}>
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
            <View style={themedStyles.container}>
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
            <View style={themedStyles.container}>
                <Text>No meeting data found.</Text>
            </View>
        );
    }

    // Basic Meeting info form (read-only)
    return (
        <>
            <Stack.Screen
                options={{
                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={handleCancel}
                            style={{ marginLeft: 16 }}
                        >
                            <Text style={{ color: '#007AFF', fontSize: 18 }}>
                                Cancel
                            </Text>
                        </TouchableOpacity>
                    ),
                }}
            />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
            >
                <Surface style={themedStyles.surface}>
                    <View style={themedStyles.firstRow}>
                        <View style={themedStyles.meetingSelectorContainer}>
                            <View style={themedStyles.meetingSelectorWrapper}>
                                <TypeSelectors
                                    pick={meeting?.meeting_type}
                                    setPick={handleTypeChange}
                                />
                            </View>
                        </View>
                    </View>
                    <View style={themedStyles.firstRow}>
                        <MeetingDate date={meeting.meeting_date} />
                        <View style={{ flex: 1 }}>
                            <MeetingIds meeting={meeting} historic={historic} />
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
                        <View style={themedStyles.row}>
                            <View style={themedStyles.meetingDetailsContainer}>
                                <Text
                                    style={themedStyles.meetingDetailsRowLabel}
                                >
                                    Newcomers:
                                </Text>
                            </View>

                            <View
                                style={
                                    themedStyles.meetingDetailsBadgeContainer
                                }
                            >
                                <BadgeNumber
                                    value={Number(meeting.newcomers_count)}
                                />
                            </View>
                        </View>
                    )}
                    {meeting.notes && (
                        <View style={themedStyles.notesContainer}>
                            <Text style={themedStyles.notesText}>
                                {meeting.notes}
                            </Text>
                        </View>
                    )}
                    <View style={themedStyles.openShareSection}>
                        <View style={themedStyles.openShareContainer}>
                            <Text style={themedStyles.openShareGroupsText}>
                                Open-Share Groups
                            </Text>
                            {(user.profile.permissions.includes('manage') ||
                                user.profile.perms.includes('groups')) && (
                                <View
                                    style={
                                        themedStyles.openShareButtonContainer
                                    }
                                >
                                    <TouchableOpacity
                                        key={0}
                                        onPress={() =>
                                            router.push(
                                                `/(group)/newGroup?meetingId=${encodeURIComponent(
                                                    id
                                                )}`
                                            )
                                        }
                                        style={
                                            themedStyles.openShareButtonContainer
                                        }
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
                            <View style={themedStyles.openShareGroupsButtonWrapper}>
                                <View
                                    style={
                                        themedStyles.openShareGroupsButtonContainer
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
        </>
    );
};

export default MeetingDetails;
