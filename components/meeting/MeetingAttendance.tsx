import theme from '@assets/Colors';
import themedStyles from '@assets/Styles';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import BadgeNumber from '../ui/BadgeNumber';

interface MeetingAttendanceProps {
    attendanceCount?: number;
}

const MeetingAttendance: React.FC<MeetingAttendanceProps> = ({
    attendanceCount = 0,
}) => {
    return (
        <View style={localStyles.row}>
            <View style={localStyles.detailsContainer}>
                <Text style={themedStyles.meetingLabel}>Attendance:</Text>
            </View>

            <View style={localStyles.detailsBadgeContainer}>
                <BadgeNumber value={attendanceCount} />
            </View>
        </View>
    );
};

export default MeetingAttendance;

const localStyles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        // borderColor: theme.colors.white,
        // borderWidth: 1,
        padding: 5,
    },
    detailsContainer: { marginLeft: 20 },
    detailsBadgeContainer: {
        marginLeft: 'auto',
        paddingVertical: 0,
        paddingHorizontal: 10,
    },
    detailsBadge: {
        backgroundColor: theme.colors.lightGraphic,
    },
    detailsTitle: {
        fontSize: 24,
        fontFamily: 'Roboto-Bold',
        color: theme.colors.landingAppName,
    },
});
