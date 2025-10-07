import theme from '@assets/Colors';
import GroupListCard from '@components/GroupListCard';
import MeetingDate from '@components/meeting/MeetingDate';
import { useFocusEffect } from '@react-navigation/native';
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
const Colors = theme.colors;

const MeetingDetails = () => {
    const { id, org_id, origin } = useLocalSearchParams<{
        id: string;
        org_id: string;
        origin?: string;
    }>();
    const router = useRouter();
    const [groups, setGroups] = React.useState<Group[]>([]);
    const [meeting, setMeeting] = React.useState<FullMeeting | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);

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
        <View style={[localStyles.container, localStyles.infoContainer]}>
            <TouchableOpacity
                style={{ position: 'absolute', top: 40, left: 16, zIndex: 10 }}
                onPress={() => {
                    if (origin === 'active') {
                        router.replace('/(drawer)/(meetings)/active');
                    } else if (origin === 'historic') {
                        router.replace('/(drawer)/(meetings)/historic');
                    } else {
                        router.back();
                    }
                }}
            ></TouchableOpacity>
            {/* Edit button now handled by navigation header in _layout.tsx */}

            <Text style={localStyles.meetingTitleText}>{meeting.title}</Text>
            <MeetingDate date={meeting.meeting_date} />
            <Text>Support Contact: {meeting.support_contact}</Text>
            <Text>Organization ID: {meeting.organization_id}</Text>
            {/* Add more fields as needed */}
            {/* Existing group list and add group button below */}
            <View style={localStyles.linkRow}>
                <Text>Groups:</Text>
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
        </View>
    );
};

export default MeetingDetails;

const localStyles = StyleSheet.create({
    meetingInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginVertical: 8,
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
});
