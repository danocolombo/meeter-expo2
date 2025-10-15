import theme from '@assets/Colors';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { RoundedButton } from './RoundedButton';
// CLEANUP: Remove all duplicate/erroneous declarations above. Only the following function should exist:
function NumberInputEditable({
    value,
    numberStyle,
    graphicStyle,
    onAction,
    min = 0,
    max = 999,
    fontSize = 24,
    paddingHorizontal = 10,
    controlSize = 30,
}) {
    const [inputValue, setInputValue] = useState(String(value));

    useEffect(() => {
        setInputValue(String(value));
    }, [value]);

    const handleInputChange = (text) => {
        // Only allow numbers
        const sanitized = text.replace(/[^0-9]/g, '');
        setInputValue(sanitized);
        let numericValue = parseInt(sanitized);
        if (!isNaN(numericValue)) {
            if (numericValue < min) numericValue = min;
            if (numericValue > max) numericValue = max;
            onAction(numericValue);
        } else if (sanitized === '') {
            onAction(min);
        }
    };

    const increaseValue = () => {
        let numericValue = parseInt(inputValue) || 0;
        if (numericValue < max) {
            onAction(numericValue + 1);
        }
    };

    const decreaseValue = () => {
        let numericValue = parseInt(inputValue) || 0;
        if (numericValue > min) {
            onAction(numericValue - 1);
        }
    };

    return (
        <View>
            <View style={localStyles.rootContainer}>
                <RoundedButton
                    title='-'
                    size={controlSize}
                    textStyle={[
                        {
                            fontSize: fontSize * 0.75,
                            alignItems: 'center',
                            color: 'white',
                        },
                        numberStyle,
                    ]}
                    style={{ borderColor: 'white' }}
                    onPress={decreaseValue}
                />
                <TextInput
                    style={[
                        localStyles.numberBox,
                        graphicStyle,
                        localStyles.input,
                        numberStyle,
                        { fontSize, paddingHorizontal },
                    ]}
                    keyboardType='numeric'
                    value={inputValue}
                    onChangeText={handleInputChange}
                    maxLength={3}
                />
                <RoundedButton
                    title='+'
                    size={controlSize}
                    style={{ borderColor: 'white' }}
                    textStyle={[
                        {
                            fontSize: fontSize * 0.75,
                            alignItems: 'center',
                            color: 'white',
                        },
                        numberStyle,
                    ]}
                    onPress={increaseValue}
                />
            </View>
        </View>
    );
}
export default NumberInputEditable;

const localStyles = StyleSheet.create({
    rootContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    numberBox: {
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: theme.colors.lightGraphic,
        marginLeft: 10,
        marginRight: 10,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 48,
        textAlign: 'center',
        fontSize: 24,
    },
    input: {
        fontSize: 24,
        textAlign: 'center',
        paddingVertical: 4,
        backgroundColor: theme.colors.lightGraphic,
        borderRadius: 4,
    },
});
