import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const GroupEdit = () => {
    const router = useRouter();
    const { id, fromMeetingId } = useLocalSearchParams<{
        id: string;
        fromMeetingId?: string;
    }>();

    const handleSave = () => {
        console.log(
            `Group ID: ${id} updated. Meeting ID: ${fromMeetingId ?? 'none'}`
        );
        if (fromMeetingId) {
            router.replace({
                pathname: '/(meeting)/[id]',
                params: { id: fromMeetingId },
            });
        } else {
            router.replace('/(meeting)/[id]');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Edit Group</Text>
            {fromMeetingId && (
                <Text style={styles.meetingId}>
                    Meeting ID: {fromMeetingId}
                </Text>
            )}
            <Text style={styles.uuid}>Group UUID: {id}</Text>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
        </View>
    );
};

export default GroupEdit;

const styles = StyleSheet.create({
    meetingId: {
        fontSize: 18,
        color: '#007AFF',
        marginBottom: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    uuid: {
        fontSize: 18,
        color: '#333',
        marginBottom: 48,
    },
    saveButton: {
        position: 'absolute',
        bottom: 32,
        left: 32,
        right: 32,
        backgroundColor: '#007AFF',
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    saveText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
