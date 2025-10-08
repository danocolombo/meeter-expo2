import theme from '@assets/Colors';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import BadgeNumber from '../ui/BadgeNumber';

const MealDetails = ({ meal, mealContact, historic, mealCount }) => {
    return (
        <>
            <View style={localStyles.row}>
                <View style={localStyles.detailsContainer}>
                    <Text style={localStyles.detailsRowLabel}>
                        {historic ? 'Meal:' : 'Meal Plans:'}
                    </Text>
                </View>

                <View style={{ flex: 1, marginHorizontal: 2 }}>
                    <Text style={localStyles.detailsRowValue}>
                        {meal === '' || meal === null ? 'TBD' : meal}
                    </Text>
                </View>
                {historic && (
                    <View style={localStyles.detailsBadgeContainer}>
                        <BadgeNumber value={mealCount} />
                    </View>
                )}
            </View>
            <View style={localStyles.row}>
                <View style={localStyles.detailsContainer}>
                    <Text style={localStyles.detailsRowLabel}>
                        Meal Contact:
                    </Text>
                </View>
                <View style={{ flex: 1, marginHorizontal: 2 }}>
                    <Text style={localStyles.detailsRowValue}>
                        {mealContact === '' || mealContact === null
                            ? 'TBD'
                            : mealContact}
                    </Text>
                </View>
            </View>
        </>
    );
};

export default MealDetails;
const localStyles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 5,
    },
    detailsContainer: { marginLeft: 20 },
    detailsRowLabel: {
        fontFamily: 'Roboto-Regular',
        color: theme.colors.lightText,
        fontSize: 24,
        fontWeight: '400',
    },
    detailsRowValue: {
        fontFamily: 'Roboto-Regular',
        color: theme.colors.lightText,
        fontSize: 24,
        padding: 10,
    },
    detailsBadgeContainer: {
        marginLeft: 'auto',
        paddingVertical: 0,
        paddingHorizontal: 10,
    },
});
