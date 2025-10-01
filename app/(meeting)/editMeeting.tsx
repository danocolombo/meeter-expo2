import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const EditMeetingScreen = () => {
    const params = useLocalSearchParams();
    let id = params?.id;
    const from = params?.from;
    if (Array.isArray(id)) {
        id = id[0];
    }
    const router = useRouter();

    const handleSave = () => {
        console.log('SAVED');
        if (id) {
            router.push({
                pathname: '/(meeting)/[id]',
                params: { id: String(id), from },
            });
        } else {
            router.push('/(meeting)/[id]');
        }
    };

    return (
        <View style={styles.container}>
            <Text>OLD /app/(meeting)/editMeeting.tsx </Text>
            <Text>{id ? `for ${id}` : ''}</Text>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
        </View>
    );
};

export default EditMeetingScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        justifyContent: 'flex-start',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 32,
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
});
