import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const Landing = () => {
    return (
        <View style={styles.container}>
            <Text>Landing</Text>
        </View>
    );
};

export default Landing;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
