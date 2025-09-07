import theme from '@/assets/Colors';
import GroupListCard from '@/components/GroupListCard';
import MeetingMealInfo from '@/components/MeetingMealInfo';
import DateStack from '@/components/ui/DateStack';
import { FullMeeting, Group } from '@/types/interfaces';
import { getAMeeting } from '@/uiils/api';
import { useFocusEffect } from '@react-navigation/native';
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
    const { id, org_id } = useLocalSearchParams<{
        id: string;
        org_id: string;
    }>();
    const router = useRouter();
    const [groups, setGroups] = React.useState<Group[]>([]);
    const [meeting, setMeeting] = React.useState<FullMeeting | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);

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
    const acknowledgePress = () => {
        console.log('Acknowledging press');
    };

    return (
        <View style={[localStyles.container, localStyles.infoContainer]}>
            <View style={localStyles.meetingInfoRow}>
                <View style={{ flexShrink: 0 }}>
                    <DateStack date={meeting.meeting_date} />
                </View>
                <View style={localStyles.meetingTitleContainer}>
                    <Text
                        style={localStyles.meetingTitleText}
                        numberOfLines={2}
                        ellipsizeMode='tail'
                    >
                        {meeting?.title}
                    </Text>
                    <Text>{meeting?.support_contact}</Text>
                </View>
            </View>
            <View style={localStyles.meetingInfoRow}>
                <MeetingMealInfo meeting={meeting} />
            </View>
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
