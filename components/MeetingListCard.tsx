import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Meeting } from '../types/interfaces';

interface MeetingListCardProps {
    meeting: Meeting;
}
const MeetingListCard = ({ meeting }: MeetingListCardProps) => {
    const router = useRouter();
    return (
        <Pressable
            style={styles.meetingCard}
            onPress={() =>
                router.push(
                    `/(meeting)/${meeting.id}?org_id=${encodeURIComponent(
                        meeting.organization_id
                    )}`
                )
            }
        >
            <View>
                <Text>{meeting.meeting_date}</Text>
                <Text>{meeting.title}</Text>
                <Text>ID: {meeting.id}</Text>
                <Text>Organization ID: {meeting.organization_id}</Text>
            </View>
        </Pressable>
    );
};

export default MeetingListCard;

const styles = StyleSheet.create({
    meetingCard: {
        minWidth: '100%',
        flex: 1,
        gap: 8,
        padding: 12,
        borderRadius: 12,
        backgroundColor: '#fff',
        boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.1)',
    },
});
