// ...existing code...
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const Group = () => {
    const router = useRouter();
    const { id, title, fromMeetingId } = useLocalSearchParams<{
        id: string;
        title?: string;
        fromMeetingId?: string;
    }>();
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Group Details</Text>
            <Text style={styles.uuid}>ID: {id}</Text>
            {title && <Text style={styles.groupTitle}>Title: {title}</Text>}
            {fromMeetingId && (
                <Text style={styles.groupTitle}>
                    Meeting ID: {fromMeetingId}
                </Text>
            )}
            <TouchableOpacity
                style={styles.editButton}
                onPress={() => {
                    router.push({
                        pathname: '/(group)/editGroup',
                        params: { id, fromMeetingId },
                    });
                }}
            >
                <Text style={styles.editText}>Edit Group</Text>
            </TouchableOpacity>
        </View>
    );
};

export default Group;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    uuid: {
        fontSize: 18,
        color: '#333',
        marginBottom: 12,
    },
    groupTitle: {
        fontSize: 18,
        color: '#555',
        marginBottom: 12,
    },
    editButton: {
        marginTop: 32,
        padding: 12,
        backgroundColor: '#007AFF',
        borderRadius: 8,
        minWidth: 120,
        alignItems: 'center',
    },
    editText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    },
});
