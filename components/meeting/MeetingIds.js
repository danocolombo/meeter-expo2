import React from 'react';
import { View, Text } from 'react-native';
import { Badge, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const MeetingIds = ({ meeting, historic }) => {
    const mtrTheme = useTheme();
    return (
        <View style={mtrTheme.row1col2}>
            {meeting?.meeting_type !== 'Testimony' && (
                <View style={mtrTheme.textColumn}>
                    <Text style={mtrTheme.detailsTitle}>{meeting.title}</Text>
                </View>
            )}
            <View
                style={[
                    mtrTheme.row && {
                        borderColor: 'white',
                    },
                ]}
            >
                <Text style={mtrTheme.subTitle}>
                    {meeting?.meeting_type !== 'Testimony'
                        ? meeting.support_contact
                        : meeting.title}
                </Text>
                {/* {!historic && (
                    <Badge size={40} style={mtrTheme.detailsBadge}>
                        {meeting.attendance_count || 0}
                    </Badge>
                )} */}
            </View>
            {meeting?.worship && (
                <View style={mtrTheme.worshipContainer}>
                    <MaterialCommunityIcons
                        name='music'
                        size={20}
                        color='white'
                    />
                    <Text style={mtrTheme.worshipText}>{meeting?.worship}</Text>
                </View>
            )}
        </View>
    );
};

export default MeetingIds;
