import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const ActiveMeetings = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>ActiveMeetings</Text>

            <TouchableOpacity
                style={styles.link}
                onPress={() => router.push('/(drawer)/(meetings)/1')}
            >
                <Text style={styles.linkText}>Meeting 1</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.link}
                onPress={() => router.push('/(drawer)/(meetings)/2')}
            >
                <Text style={styles.linkText}>Meeting 2</Text>
            </TouchableOpacity>
        </View>
    );
};

export default ActiveMeetings;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
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
