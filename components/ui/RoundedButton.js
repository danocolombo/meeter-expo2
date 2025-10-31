import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

export const RoundedButton = ({
    style = {},
    textStyle = {},
    size = 125,
    onPress,
    ...props
}) => {
    // Defensive: ensure size is a finite number to avoid NaN in styles
    const s = Number(size) || 125;
    return (
        <TouchableOpacity style={[styles(s).radius, style]} onPress={onPress}>
            <Text style={[styles(s).text, textStyle]}>{props.title}</Text>
        </TouchableOpacity>
    );
};

const styles = (size) => {
    const s = Number(size) || 125;
    const textSize = Number(s / 3) || 16;
    return {
        radius: {
            borderRadius: s / 2,
            width: s,
            height: s,
            alignItems: 'center',
            justifyContent: 'center',
            borderColor: 'black',
            borderWidth: 2,
        },
        text: { color: 'black', fontSize: textSize },
    };
};
