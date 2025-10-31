import theme from '@assets/Colors';
import themedStyles from '@assets/Styles';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import BadgeNumber from '../ui/BadgeNumber';

const MealDetails = ({
    meal,
    mealContact,
    historic,
    mealCount,
    showMealCountBadge = true,
}) => {
    return (
        <>
            <View style={localStyles.row}>
                <View style={localStyles.detailsContainer}>
                    <Text style={themedStyles.meetingLabel}>
                        {historic ? 'Meal:' : 'Meal Plans:'}
                    </Text>
                </View>

                <View style={{ flex: 1, marginHorizontal: 2 }}>
                    <Text style={localStyles.detailsRowValue}>
                        {meal === '' || meal === null ? 'TBD' : meal}
                    </Text>
                </View>
                {showMealCountBadge && (
                    <View style={localStyles.detailsBadgeContainer}>
                        <BadgeNumber value={mealCount} />
                    </View>
                )}
            </View>
            <View style={localStyles.row}>
                <View style={localStyles.detailsContainer}>
                    <Text style={themedStyles.meetingLabel}>Meal Contact:</Text>
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
