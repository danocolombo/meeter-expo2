import theme from '@assets/Colors';
import GroupListCard from '@components/GroupListCard';
import MealDetails from '@components/meeting/MealDetails';
import MeetingAttendance from '@components/meeting/MeetingAttendance';
import MeetingDate from '@components/meeting/MeetingDate';
import MeetingIds from '@components/meeting/MeetingIds';
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
import { Surface } from 'react-native-paper';
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
            <View style={localStyles.screenTitleContainer}>
                <Text style={localStyles.screenTitleText}>
                    {meeting?.meeting_type}
                </Text>
            </View>
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
        </Surface>
    );
};

export default MeetingDetails;

const localStyles = StyleSheet.create({
    surface: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: theme.colors.primaryBackground,
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
