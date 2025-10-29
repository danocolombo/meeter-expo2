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
import {
    registerCallback,
    unregisterCallback,
} from '../../utils/navigationCallbacks';
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
import {
    deleteCurrentMeetingAndGroups,
    upsertMeeting,
} from '../../features/meetings/meetingsSlice';
import { fetchMeetingDetailsById } from '../../features/meetings/meetingsThunks';
import { refreshApiToken } from '../../features/user/userThunks';
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
    const {
        id,
        origin,
        org_id: orgParam,
    } = useLocalSearchParams<{
        id: string;
        origin?: string | string[];
        org_id?: string | string[];
    }>();
    // callback key reference for when we navigate to the edit screen and want
    // to register a callback that the edit screen can invoke on success.
    const editCallbackKeyRef = React.useRef<string | null>(null);
    // Normalize origin which may be a string or array (from query params)
    const originValue: string = React.useMemo(() => {
        if (!origin) return '';
        if (Array.isArray(origin)) return origin[0] || '';
        return String(origin || '');
    }, [origin]);
    const router = useRouter();
    const [historic, setHistoric] = React.useState(false);
    const [, setIsSavable] = React.useState(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [groups, setGroups] = React.useState<Group[]>([]);
    const [error, setError] = React.useState<string | null>(null);
    const user = useSelector((state: any) => state.user);
    // Normalize permissions arrays to avoid runtime errors when undefined
    const userPermissions: string[] = (
        user && user.profile && Array.isArray(user.profile.permissions)
            ? user.profile.permissions
            : []
    ) as string[];
    const userPermsLegacy: string[] = (
        user && user.profile && Array.isArray(user.profile.perms)
            ? user.profile.perms
            : []
    ) as string[];
    // Prefer organization id from route params if provided (e.g. when navigating
    // from a meeting list that passes org_id). Normalize if it's an array.
    const orgIdFromParams: string | undefined = React.useMemo(() => {
        if (!orgParam) return undefined;
        if (Array.isArray(orgParam)) return orgParam[0] || undefined;
        return String(orgParam || undefined);
    }, [orgParam]);

    const org_id = orgIdFromParams || user?.profile?.activeOrg?.id;
    // If the calling list passed a serialized meeting object in params, use it
    // to render immediately without fetching from the API.
    const routeMeetingParam = useLocalSearchParams<{ meeting?: string }>()
        .meeting;
    // Use only the user's stored API token plainTextToken. If absent, do not
    // attempt to call the API and show a message to the user.
    const api_token: string | undefined =
        user?.profile?.apiToken?.plainTextToken;
    const dispatch: AppDispatch = useDispatch();
    // Global groups cache (objects) from the meetings slice - used to
    // convert id-only group arrays into object arrays for rendering.
    const globalGroups: any[] = useSelector((state: any) =>
        Array.isArray(state.meetings?.groups) ? state.meetings.groups : []
    );
    // const defaultGroups = useSelector((state) => state.groups.defaultGroups);
    //const newPerms = useSelector((state) => state.user.perms);
    // No local meeting fallback — prefer the Redux store as the single source
    // of truth for meeting data. If navigation passes a serialized meeting
    // param and the store doesn't yet have it, we'll upsert it into the
    // store (see useEffect below) so the UI can render immediately.

    // Prefer meeting from Redux store (active/historic) when available so the
    // details screen updates automatically after thunks that modify the store.
    // Use a selector that returns a single meeting object (by id) instead of
    // composing a new array each render — this avoids returning a fresh
    // reference and eliminates the selector memoization warning.
    const meetingFromStore = useSelector((state: any) => {
        if (!id) return undefined;
        const active = Array.isArray(state.meetings?.activeMeetings)
            ? state.meetings.activeMeetings
            : [];
        const historic = Array.isArray(state.meetings?.historicMeetings)
            ? state.meetings.historicMeetings
            : [];
        const all = Array.isArray(state.meetings?.meetings)
            ? state.meetings.meetings
            : [];
        return (
            active.find((m: any) => String(m.id) === String(id)) ||
            historic.find((m: any) => String(m.id) === String(id)) ||
            all.find((m: any) => String(m.id) === String(id))
        );
    });

    // The displayed meeting prefers the Redux value (fresh after save), then
    // falls back to the locally parsed route param (fast initial render).
    const displayedMeeting: FullMeeting | null =
        (meetingFromStore as any) || null;
    const [isLoading, setIsLoading] = React.useState(false);
    const navigation = useNavigation();
    // callback helpers imported at module top

    // Top navigation cancel handler — navigate back to the meetings list
    const handleCancel = React.useCallback(() => {
        // Clear currentMeeting/currentGroups from Redux so subsequent
        // navigation does not accidentally reuse stale state.
        try {
            dispatch(deleteCurrentMeetingAndGroups());
        } catch {
            // ignore if dispatch fails
        }

        // origin expected to be 'active' or 'historic'
        if (originValue === 'historic') {
            router.replace('/(drawer)/(meetings)/historic');
            return;
        }
        // default to active
        router.replace('/(drawer)/(meetings)/active');
    }, [originValue, router, dispatch]);

    // Listen for navigation 'beforeRemove' events and clear currentMeeting
    // when the user is popping/backing out of this screen. This avoids
    // accidentally clearing state when navigating forward to an editor.
    React.useEffect(() => {
        const handler = (e: any) => {
            try {
                const actionType = e?.data?.action?.type;
                // POP indicates user pressed back / popped the screen
                if (actionType === 'POP' || actionType === 'GO_BACK') {
                    try {
                        dispatch(deleteCurrentMeetingAndGroups());
                    } catch {
                        // ignore
                    }
                }
            } catch {
                // ignore
            }
        };
        const unsub = navigation.addListener('beforeRemove', handler);
        return () => {
            try {
                unsub();
            } catch {
                // ignore
            }
        };
    }, [navigation, dispatch]);

    // Add Edit button to header (Expo Router v2+ pattern)
    // Use a custom header if needed, or add edit button in the screen for now

    // Helper to refresh meeting after group delete or on mount
    const refreshMeeting = React.useCallback(async () => {
        if (!org_id || !id) return;
        // Determine the API token to use. Prefer the one in the user slice, but
        // if missing attempt to refresh it via the refresh utility which will
        // dispatch an update to the user slice and also return the new token.
        let tokenToUse: string | undefined = api_token;
        if (!tokenToUse) {
            try {
                // Dispatch the refresh thunk which will update the user slice
                const refreshed = await dispatch(
                    refreshApiToken({ profile: user?.profile }) as any
                ).unwrap();

                if (
                    refreshed &&
                    typeof refreshed === 'object' &&
                    'plainTextToken' in refreshed
                ) {
                    tokenToUse = (refreshed as any).plainTextToken;
                } else if (typeof refreshed === 'string') {
                    tokenToUse = refreshed;
                } else if (user?.profile?.apiToken?.plainTextToken) {
                    // If the thunk updated the slice, the selector `user` will
                    // reflect the new token; prefer that as a fallback.
                    tokenToUse = user.profile.apiToken.plainTextToken;
                }
            } catch (e) {
                console.error('Failed to refresh API token:', e);
                setError(
                    'API token not available for this user. Please sign in or acquire a valid token.'
                );
                // no local meeting state any more
                setGroups([]);
                setIsLoading(false);
                return;
            }
        }
        if (!tokenToUse) {
            setError(
                'API token not available for this user. Please sign in or acquire a valid token.'
            );
            // no local meeting state any more
            setGroups([]);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            // Debug: record that we're attempting fetch and whether a token is present
            // console.info('MeetingDetails: fetching', {
            //     hasToken: !!tokenToUse,
            //     org_id,
            //     id,
            // });

            const result = await dispatch(
                fetchMeetingDetailsById({
                    apiToken: tokenToUse,
                    organizationId: org_id,
                    meetingId: id,
                })
            ).unwrap();

            let meetingData = result?.data?.currentMeeting || result?.data;
            if (meetingData) {
                dispatch(upsertMeeting(meetingData));

                let fetchedGroups: Group[] = meetingData.groups || [];

                setGroups(fetchedGroups);

                const meetingDate = new Date(meetingData.meeting_date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                setHistoric(meetingDate < today);
            } else {
                setGroups([]);
                setError('Meeting not found.');
            }
        } catch (err: any) {
            console.error('Failed to fetch meeting details:', err);
            setGroups([]);
            setError('Failed to load meeting. Please try again.');
        } finally {
            setIsLoading(false);
        }
        // We intentionally avoid including the full `user` object here because
        // updating the user's profile (for example when refreshing the api token)
        // would change the object identity and re-create the callback, causing
        // the focus effect to re-subscribe and re-run while the screen is still
        // focused. Use only the specific dependencies required.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [api_token, org_id, id, dispatch]);

    // Always use Redux thunk for fetching meeting details
    // Whenever the displayed meeting changes (either from Redux store or
    // our local fallback), update the derived groups and historic flag so
    // the UI reflects the current meeting immediately.
    React.useEffect(() => {
        const src = meetingFromStore as any;
        if (src) {
            try {
                let fetchedGroups: Group[] = src.groups || [];
                if (
                    fetchedGroups.length > 0 &&
                    typeof fetchedGroups[0] !== 'object'
                ) {
                    fetchedGroups = fetchedGroups.map(
                        (gid: any) =>
                            globalGroups.find((g: any) => g.id === gid) || {
                                id: gid,
                            }
                    );
                }
                fetchedGroups.sort(compareGroups);
                setGroups(fetchedGroups);
                const meetingDate = new Date(src.meeting_date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                setHistoric(meetingDate < today);
            } catch {
                // ignore parse errors
            }
        }
    }, [meetingFromStore, globalGroups]);

    // If route provided a serialized meeting but store doesn't have it yet,
    // upsert it into the store so displayedMeeting can be derived from store.
    React.useEffect(() => {
        if (!meetingFromStore && routeMeetingParam) {
            try {
                const parsed = JSON.parse(
                    routeMeetingParam as string
                ) as FullMeeting;
                dispatch(upsertMeeting(parsed));
            } catch {
                // ignore parse errors
            }
        }
    }, [routeMeetingParam, meetingFromStore, dispatch]);

    // Always attempt to refresh from backend when the screen focuses so the
    // latest values are fetched after returning from Edit. Also clean up any
    // pending callback key that may remain registered.
    useFocusEffect(
        React.useCallback(() => {
            refreshMeeting();

            if (editCallbackKeyRef.current) {
                try {
                    unregisterCallback(editCallbackKeyRef.current);
                } catch {
                    // ignore
                }
                editCallbackKeyRef.current = null;
            }
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
        if (!userPermissions.includes('manage')) {
            return;
        }
        let titleVal = false;
        let contactVal = false;
        switch (displayedMeeting?.meeting_type) {
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
        displayedMeeting &&
        (meetingTypeDisplay[displayedMeeting.meeting_type] ||
            displayedMeeting.meeting_type ||
            '');

    // Set header title dynamically after meeting is loaded and add edit
    // button that registers a callback and navigates to the edit screen.
    React.useLayoutEffect(() => {
        if (
            meetingTypeString &&
            navigation &&
            typeof navigation.setOptions === 'function'
        ) {
            navigation.setOptions({
                title: '',
                headerRight: () => {
                    if (!displayedMeeting) return null;
                    const canEdit =
                        user?.profile?.permissions?.includes('manage') ||
                        user?.profile?.perms?.includes('meetings');
                    if (!canEdit) return null;

                    return (
                        <TouchableOpacity
                            style={{ marginRight: 16 }}
                            onPress={() => {
                                try {
                                    const key = `md-${Date.now().toString(
                                        36
                                    )}-${Math.random().toString(36).slice(2)}`;

                                    registerCallback(
                                        key,
                                        (updatedMeeting: any) => {
                                            try {
                                                if (updatedMeeting) {
                                                    // Preserve or map groups to avoid losing
                                                    // group objects when the editor returns
                                                    // a meeting without groups or with id-only
                                                    // group arrays.
                                                    const merged: any = {
                                                        ...updatedMeeting,
                                                    };
                                                    if (
                                                        !Array.isArray(
                                                            merged.groups
                                                        ) ||
                                                        merged.groups.length ===
                                                            0
                                                    ) {
                                                        merged.groups =
                                                            (
                                                                meetingFromStore as any
                                                            )?.groups || [];
                                                    } else if (
                                                        merged.groups.length >
                                                            0 &&
                                                        typeof merged
                                                            .groups[0] !==
                                                            'object'
                                                    ) {
                                                        merged.groups =
                                                            merged.groups.map(
                                                                (gid: any) =>
                                                                    globalGroups.find(
                                                                        (
                                                                            g: any
                                                                        ) =>
                                                                            String(
                                                                                g.id
                                                                            ) ===
                                                                            String(
                                                                                gid
                                                                            )
                                                                    ) || {
                                                                        id: gid,
                                                                    }
                                                            );
                                                    }

                                                    dispatch(
                                                        upsertMeeting(merged)
                                                    );
                                                }
                                            } catch {
                                                // ignore
                                            }
                                            setTimeout(
                                                () => refreshMeeting(),
                                                60
                                            );
                                        }
                                    );

                                    editCallbackKeyRef.current = key;

                                    router.push({
                                        pathname: '/(meeting)/(edit)/[id]',
                                        params: {
                                            id: String(id),
                                            meeting:
                                                JSON.stringify(
                                                    displayedMeeting
                                                ),
                                            callbackKey: key,
                                            origin: originValue,
                                        },
                                    });
                                } catch (err) {
                                    console.error(
                                        'Failed to open edit screen',
                                        err
                                    );
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
    }, [
        meetingTypeString,
        navigation,
        displayedMeeting,
        router,
        id,
        origin,
        user,
        dispatch,
        originValue,
        refreshMeeting,
        globalGroups,
        meetingFromStore,
    ]);

    // cleanup any pending callback registration when this component
    // unmounts (extra safety)
    React.useEffect(() => {
        return () => {
            const key = editCallbackKeyRef.current;
            if (key) {
                try {
                    unregisterCallback(key);
                } catch {
                    // ignore
                }
                editCallbackKeyRef.current = null;
            }
        };
    }, []);

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
    if (!displayedMeeting) {
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
                                Back
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
                                    pick={displayedMeeting?.meeting_type}
                                    setPick={handleTypeChange}
                                />
                            </View>
                        </View>
                    </View>
                    <View style={themedStyles.firstRow}>
                        <MeetingDate date={displayedMeeting.meeting_date} />
                        <View style={{ flex: 1 }}>
                            <MeetingIds
                                meeting={displayedMeeting}
                                historic={historic}
                            />
                        </View>
                    </View>
                    {displayedMeeting.attendance_count > 0 && (
                        <MeetingAttendance
                            attendanceCount={displayedMeeting.attendance_count}
                        />
                    )}
                    <MealDetails
                        meal={displayedMeeting.meal}
                        mealContact={displayedMeeting.meal_contact}
                        historic={historic}
                        mealCount={displayedMeeting.meal_count}
                    />
                    {Number(displayedMeeting.newcomers_count) > 0 && (
                        <View style={themedStyles.row}>
                            <View style={themedStyles.meetingDetailsContainer}>
                                <Text style={themedStyles.meetingLabel}>
                                    Newcomers:
                                </Text>
                            </View>

                            <View
                                style={
                                    themedStyles.meetingDetailsBadgeContainer
                                }
                            >
                                <BadgeNumber
                                    value={Number(
                                        displayedMeeting.newcomers_count
                                    )}
                                />
                            </View>
                        </View>
                    )}
                    {displayedMeeting.notes && (
                        <View style={themedStyles.notesContainer}>
                            <Text style={themedStyles.notesText}>
                                {displayedMeeting.notes}
                            </Text>
                        </View>
                    )}
                    <View style={themedStyles.openShareSection}>
                        <View style={themedStyles.openShareContainer}>
                            <Text style={themedStyles.openShareGroupsText}>
                                Open-Share Groups
                            </Text>
                            {(userPermissions.includes('manage') ||
                                userPermsLegacy.includes('groups')) && (
                                <View
                                    style={
                                        themedStyles.openShareButtonContainer
                                    }
                                >
                                    <TouchableOpacity
                                        key={0}
                                        onPress={() =>
                                            router.push({
                                                pathname: '/(group)/newGroup',
                                                params: {
                                                    meetingId: String(id),
                                                    origin:
                                                        originValue ||
                                                        undefined,
                                                    org_id: org_id || undefined,
                                                    meeting:
                                                        routeMeetingParam ||
                                                        undefined,
                                                },
                                            })
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
                        data={displayedMeeting?.groups || []}
                        keyExtractor={(item, index) =>
                            item && item.id
                                ? String(item.id)
                                : `group-${index}-${String(item?.title || '')}`
                        }
                        renderItem={({ item }) => (
                            <GroupListCard
                                group={item}
                                fromMeetingId={id}
                                onGroupDeleted={refreshMeeting}
                            />
                        )}
                        ListEmptyComponent={() => (
                            <View
                                style={
                                    themedStyles.meetingNoGroupsLabelContainer
                                }
                            >
                                <Text
                                    style={
                                        themedStyles.meetingNoGroupsLabelText
                                    }
                                >
                                    No groups defined for this meeting.
                                </Text>
                            </View>
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
                            router.push({
                                pathname: '/(group)/newGroup',
                                params: {
                                    meetingId: String(id),
                                    origin: originValue || undefined,
                                    org_id: org_id || undefined,
                                    meeting: routeMeetingParam || undefined,
                                },
                            })
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
