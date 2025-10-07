import DateBall from '@components/ui/DateBall';
import { Platform, StyleSheet, View } from 'react-native';

const MeetingDate = ({ date }) => {
    return (
        <View style={styles.dateWrapper}>
            {Platform.OS === 'ios' && (
                <View style={styles().dateContainerIOS}>
                    <DateBall date={date} />
                </View>
            )}
        </View>
    );
};

const styles = () =>
    StyleSheet.create({
        dateWrapper: {
            margin: 0,
        },
        dateContainerIOS: {
            paddingHorizontal: 5,
        },
        dateContainerAndroid: {
            paddingVertical: 1,
        },
    });

export default MeetingDate;
