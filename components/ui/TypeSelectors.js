import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import TypeSelector from './ui/TypeSelector';
const TypeSelectors = ({ pick, setPick }) => {
    const mtrTheme = useTheme();
    const bUnselected = {
        paddingHorizontal: 8,
        // paddingVertical: 6,
        // borderRadius: 4,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: mtrTheme.colors.darkObject,
        backgroundColor: mtrTheme.colors.darkObject,
        alignSelf: 'flex-start',
        marginHorizontal: '1%',
        // marginBottom: 6,
        minWidth: '30%',
        textAlign: 'center',
    };
    const tUnselected = {
        fontSize: 12,
        fontWeight: '500',
        color: 'blue',
        textAlign: 'center',
    };

    const tSelected = {
        color: mtrTheme.colors.lightText,
    };
    return (
        <TypeSelector
            title='Meeting Type'
            selectedValue={pick}
            values={['Lesson', 'Testimony', 'Special']}
            setSelectedValue={setPick}
        >
            buttonUnselected={bUnselected}
        </TypeSelector>
    );
};

export default TypeSelectors;
