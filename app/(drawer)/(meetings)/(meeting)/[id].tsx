import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const MeetingDetails = () => {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    return (
        <View style={styles.container}>
            <Text>Meeting Details for {id}</Text>
            <TouchableOpacity
                style={styles.link}
                onPress={() => router.push('/(drawer)/(meeting)/(group)')}
            >
                <Text style={styles.linkText}>Go to Group</Text>
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
