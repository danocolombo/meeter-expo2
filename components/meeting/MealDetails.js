import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from 'react-native-paper';
import BadgeNumber from '../ui/BadgeNumber';

const MealDetails = ({ meal, mealContact, historic, mealCount }) => {
    const mtrTheme = useTheme();

    return (
        <>
            <View style={mtrTheme.row}>
                <View style={mtrTheme.detailsContainer}>
                    <Text style={mtrTheme.detailsRowLabel}>
                        {historic ? 'Meal:' : 'Meal Plans:'}
                    </Text>
                </View>

                <View style={{ flex: 1, marginHorizontal: 2 }}>
                    <Text style={mtrTheme.detailsRowValue}>
                        {meal === '' || meal === null ? 'TBD' : meal}
                    </Text>
                </View>
                {historic && (
                    <View style={mtrTheme.detailsBadgeContainer}>
                        <BadgeNumber value={mealCount} />
                    </View>
                )}
            </View>
            <View style={mtrTheme.row}>
                <View style={mtrTheme.detailsContainer}>
                    <Text style={mtrTheme.detailsRowLabel}>Meal Contact:</Text>
                </View>
                <View style={{ flex: 1, marginHorizontal: 2 }}>
                    <Text style={mtrTheme.detailsRowValue}>
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
