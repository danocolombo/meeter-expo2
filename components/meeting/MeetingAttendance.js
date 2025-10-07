import React from 'react';
import { View, Text } from 'react-native';
import { Badge, useTheme } from 'react-native-paper';
import BadgeNumber from '../ui/BadgeNumber';
const MeetingAttendance = ({ attendanceCount }) => {
    const mtrTheme = useTheme();

    return (
        <View style={mtrTheme.row}>
            <View style={mtrTheme.detailsContainer}>
                <Text style={mtrTheme.detailsRowLabel}>Attendance:</Text>
            </View>

            <View style={mtrTheme.detailsBadgeContainer}>
                <BadgeNumber value={attendanceCount} />
            </View>
        </View>
    );
};

export default MeetingAttendance;
