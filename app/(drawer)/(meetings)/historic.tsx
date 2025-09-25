import MeetingListCard from '@components/MeetingListCard';
import { useAppSelector } from '@utils/hooks';
import React, { useCallback } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import type { Meeting } from '../../../types/interfaces';

const HistoricMeetings = () => {
    const renderMeeting = useCallback(({ item }: { item: Meeting }) => {
        return (
            <View style={styles.itemContainer}>
                <MeetingListCard meeting={item} />
            </View>
        );
    }, []);

    const meetings = useAppSelector(
        (state: any) => state.meetings.historicMeetings
    );
    const isLoading = useAppSelector((state: any) => state.meetings.isLoading);

    if (isLoading)
        return (
            <View style={styles.container}>
                <Text style={styles.text}>Loading...</Text>
            </View>
        );

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Historic Meetings</Text>
            <FlatList
                data={meetings || []}
                renderItem={renderMeeting}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ alignItems: 'center' }}
            />
        </View>
    );
};

export default HistoricMeetings;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 48,
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 16,
    },
    itemContainer: {
        width: '100%',
        paddingHorizontal: 15,
        marginVertical: 8,
    },
    link: {
        marginTop: 24,
        padding: 12,
        backgroundColor: '#F2A310',
        borderRadius: 8,
    },
    linkText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
