import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const NewGroup = () => {
    const router = useRouter();
    const { fromMeetingId, from } = useLocalSearchParams<{
        fromMeetingId?: string;
        from?: string;
    }>();

    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
            /[xy]/g,
            function (c) {
                const r = (Math.random() * 16) | 0,
                    v = c === 'x' ? r : (r & 0x3) | 0x8;
                return v.toString(16);
            }
        );
    }

    const handleCancel = () => {
        if (fromMeetingId) {
            router.replace({
                pathname: '/(meeting)/[id]',
                params: { id: fromMeetingId, from },
            });
        } else {
            router.replace('/(meeting)/[id]');
        }
    };

    const handleSave = () => {
        const uuid = generateUUID();
        if (fromMeetingId) {
            console.log(
                `New Group UUID: ${uuid} added to Meeting ID: ${fromMeetingId}`
            );
            router.replace({
                pathname: '/(meeting)/[id]',
                params: { id: fromMeetingId, from },
            });
        } else {
            console.log(`New Group UUID: ${uuid} added to unknown Meeting`);
            router.replace('/(meeting)/[id]');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create New Group</Text>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
        </View>
    );
};

export default NewGroup;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 48,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    title: {
        marginTop: 80,
        fontSize: 24,
        fontWeight: 'bold',
    },
    saveButton: {
        marginTop: 48,
        paddingVertical: 12,
        paddingHorizontal: 32,
        backgroundColor: '#007AFF',
        borderRadius: 8,
    },
    saveText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
