import { useQuery } from '@tanstack/react-query';
import { getAffiliations } from '@utils/api';
import { printObject } from '@utils/helpers';
import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';

const Landing = () => {
    const { data: affiliations } = useQuery({
        queryKey: ['affiliations'],
        queryFn: getAffiliations,
    });
    // Access activeMeetings from Redux store
    const activeMeetings = useSelector(
        (state: any) => state.meetings.activeMeetings
    );
    const userData = useSelector((state: any) => state.user);
    return (
        <View style={styles.container}>
            <Text>Landing</Text>
            <Button
                title='Log Active Meetings'
                onPress={() => {
                    console.log('Active Meetings:', activeMeetings);
                }}
            />
            <Button
                title='Log User Info'
                onPress={() => {
                    printObject('User Data:\n', userData);
                }}
            />
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
