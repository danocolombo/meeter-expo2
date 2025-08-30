import { getActiveMeetings } from '@/uiils/api';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

const organizationId = process.env.EXPO_PUBLIC_ORGANIZATION_ID;

const ActiveMeetings = () => {
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
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <Text style={{ marginBottom: 12 }}>
                        {item.meeting_date}
                    </Text>
                )}
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
