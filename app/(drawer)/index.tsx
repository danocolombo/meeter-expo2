import { useQuery } from '@tanstack/react-query';
import { getAffiliations } from '@utils/api';
import { printObject } from '@utils/helpers';
import React from 'react';
import {
    ActivityIndicator,
    Button,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import HeroMessage from '../../components/ui/heroMessage';
import { updateProfile } from '../../features/user/userSlice';

const Landing = () => {
    const dispatch = useDispatch();
    const { data: affiliations } = useQuery({
        queryKey: ['affiliations'],
        queryFn: getAffiliations,
    });
    // On mount, set isLoading to false to hide activity indicator after navigation
    React.useEffect(() => {
        dispatch(updateProfile({ isLoading: false }));
    }, [dispatch]);
    // Access activeMeetings from Redux store
    const activeMeetings = useSelector(
        (state: any) => state.meetings.activeMeetings
    );
    const userData = useSelector((state: any) => state.user);
    const system = useSelector((state: any) => state.system);

    // Show loading indicator if userData is not loaded yet
    if (!userData || !userData.profile) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size='large' />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* prefer system.activeOrg.heroMessage when available */}
            {system?.activeOrg?.heroMessage ? (
                <HeroMessage message={system.activeOrg.heroMessage} />
            ) : userData.profile.activeOrg?.heroMessage ? (
                <HeroMessage message={userData.profile.activeOrg.heroMessage} />
            ) : null}
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
            <Button
                title='Log System Info'
                onPress={() => {
                    printObject('System Data:\n', system);
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
        width: '100%', // Add this line
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
