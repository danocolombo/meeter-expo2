import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const Group = () => {
    return (
        <View style={styles.container}>
            <Text>Group </Text>
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
});
