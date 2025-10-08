import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
// import { Badge, useTheme } from 'react-native-paper';
import theme from '@assets/Colors';
import BadgeNumber from '../ui/BadgeNumber';
const MeetingAttendance = ({ attendanceCount }) => {
    return (
        <View style={localStyles.row}>
            <View style={localStyles.detailsContainer}>
                <Text style={localStyles.detailsRowLabel}>Attendance:</Text>
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
    detailsRowLabel: {
        fontFamily: 'Roboto-Regular',
        color: theme.colors.lightText,
        fontSize: 24,
        fontWeight: '400',
    },
    detailsContainer: { marginLeft: 20 },
    detailsBadgeContainer: {
        marginLeft: 'auto',
        paddingVertical: 0,
        paddingHorizontal: 10,
    },
    detailsBadge: {
        backgroundColor: theme.colors.lightColor,
        textColor: theme.colors.darkText,
    },
    detailsTitle: {
        fontSize: 24,
        fontFamily: 'Roboto-Bold',
        color: theme.colors.accentColor,
    },
});
