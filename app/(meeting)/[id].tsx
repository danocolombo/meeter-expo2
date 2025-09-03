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
            console.log('[id] id:', id);
            console.log('[id] org_id:', org_id);
            async function fetchMeeting() {
                if (!id || !org_id) return;
                setIsLoading(true);
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
            <View style={styles.container}>
                <Text>Loading meeting...</Text>
                <ActivityIndicator size='large' color='#F2A310' />
            </View>
        );
    }
    return (
        <View style={styles.container}>
            <Text>Meeting Details for {meeting.id}</Text>
            <Text>Organization ID: {meeting.organization_id}</Text>
            <View style={styles.linkRow}>
                <Text>Groups:</Text>
            </View>
            <FlatList
                data={groups}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.link}
                        onPress={() => {
                            router.push(
                                `/(group)/${item.id}?title=${encodeURIComponent(
                                    item.title
                                )}&fromMeetingId=${encodeURIComponent(id)}`
                            );
                        }}
                    >
                        <Text style={styles.linkText}>{item.title}</Text>
                        <Text style={styles.linkText}>ID: {item.id}</Text>
                    </TouchableOpacity>
                )}
            />
            <TouchableOpacity
                style={{
                    backgroundColor: 'green',
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
                        color: 'white',
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
        backgroundColor: '#F2A310',
        borderRadius: 8,
        minWidth: 120,
        alignItems: 'center',
    },
    linkText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
