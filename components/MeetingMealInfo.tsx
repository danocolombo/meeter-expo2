import { FullMeeting } from '@/types/interfaces';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface MeetingMealInfoProps {
    meeting: FullMeeting;
}

const MeetingMealInfo: React.FC<MeetingMealInfoProps> = ({ meeting }) => {
    return (
        <View style={styles.container}>
            <View style={styles.row}>
                <Text style={styles.label}>Meal Plans: </Text>
                <View style={styles.valueContainer}>
                    <Text
                        style={styles.value}
                        numberOfLines={0}
                        ellipsizeMode='tail'
                    >
                        {meeting.meal || 'TBD'}
                    </Text>
                </View>
            </View>
            <View style={styles.row}>
                <Text style={styles.label}>Meal Contact: </Text>
                <View style={styles.valueContainer}>
                    <Text
                        style={styles.value}
                        numberOfLines={0}
                        ellipsizeMode='tail'
                    >
                        {meeting.meal_contact || 'TBD'}
                    </Text>
                </View>
            </View>
        </View>
    );
};

export default MeetingMealInfo;

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        width: '100%',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        width: '100%',
        alignSelf: 'stretch',
        marginBottom: 4,
    },
    label: {
        fontWeight: 'bold',
        flexShrink: 0,
        textAlign: 'left',
        paddingRight: 8,
        minWidth: 90,
        maxWidth: 120,
    },
    valueContainer: {
        flex: 1,
        minWidth: 0,
    },
    value: {
        textAlign: 'left',
        fontWeight: '500',
        flex: 1,
        flexWrap: 'wrap',
    },
});
