import theme from '@assets/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
const MeetingIds = ({ meeting, historic }) => {
    return (
        <View style={localStyles.row1col2}>
            {meeting?.meeting_type !== 'Testimony' && (
                <View style={localStyles.textColumn}>
                    <Text style={localStyles.detailsTitle}>
                        {meeting.title}
                    </Text>
                </View>
            )}
            <View
                style={[
                    localStyles.row && {
                        borderColor: 'white',
                    },
                ]}
            >
                <Text style={localStyles.subTitle}>
                    {meeting?.meeting_type !== 'Testimony'
                        ? meeting.support_contact
                        : meeting.title}
                </Text>
                {/* {!historic && (
                    <Badge size={40} style={localStyles.detailsBadge}>
                        {meeting.attendance_count || 0}
                    </Badge>
                )} */}
            </View>
            {meeting?.worship && (
                <View style={localStyles.worshipContainer}>
                    <MaterialCommunityIcons
                        name='music'
                        size={20}
                        color='white'
                    />
                    <Text style={localStyles.worshipText}>
                        {meeting?.worship}
                    </Text>
                </View>
            )}
        </View>
    );
};

export default MeetingIds;
const localStyles = StyleSheet.create({
    row1col2: {
        flexDirection: 'column',
        backgroundColor: theme.colors.primaryBackground,
        padding: 10,
    },
    textColumn: {
        marginBottom: 8,
    },
    detailsTitle: {
        color: theme.colors.primary,
        fontWeight: 'bold',
        fontSize: 18,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: theme.colors.white,
        borderWidth: 1,
        padding: 5,
    },
    subTitle: {
        color: theme.colors.text,
        fontSize: 16,
    },
    detailsBadge: {
        backgroundColor: theme.colors.primary,
        color: theme.colors.primaryBackground,
        marginLeft: 8,
    },
    worshipContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    worshipText: {
        color: theme.colors.secondary,
        marginLeft: 4,
    },
});
