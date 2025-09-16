import MeetingListCard from '@components/MeetingListCard';
import { useQuery } from '@tanstack/react-query';
import { getActiveMeetings } from '@utils/api';
import React, { useCallback } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

const organizationId = process.env.EXPO_PUBLIC_TEST_ORGANIZATION_ID;

const ActiveMeetings = () => {
    // const renderMeeting = useCallback(({ item }: { item: any }) => {
    //     return <MeetingListCard meeting={item} />;
    // }, []);

    // const renderMeeting1 = useCallback(({ item }: { item: Meeting }) => {
    //     return <MeetingListCard meeting={item} />;
    // }, []);
    const renderMeeting = useCallback(({ item }: { item: Meeting }) => {
        return (
            <View style={styles.itemContainer}>
                <MeetingListCard meeting={item} />
            </View>
        );
    }, []);

    const {
        data: meetings,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['activeMeetings', organizationId],
        queryFn: () => getActiveMeetings(organizationId || ''),
    });

    if (isLoading)
        return (
            <View style={styles.container}>
                <Text style={styles.text}>Loading...</Text>
            </View>
        );
    if (error)
        return (
            <View style={styles.container}>
                <Text style={styles.text}>Error loading meetings</Text>
            </View>
        );

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Active Meetings</Text>
            <FlatList
                data={meetings || []}
                renderItem={renderMeeting}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ alignItems: 'center' }}
            />
        </View>
    );
};

export default ActiveMeetings;

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
