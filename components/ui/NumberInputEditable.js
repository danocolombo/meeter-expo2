import React, { useEffect, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { RoundedButton } from './RoundedButton';

function NumberInputEditable({
    value,
    numberStyle,
    graphicStyle,
    onAction,
    min = 0,
    max = 999,
}) {
    const mtrTheme = useTheme();
    const [gsStyle, setGsStyle] = useState('black');
    const [inputValue, setInputValue] = useState(String(value));

    useEffect(() => {
        setInputValue(String(value));
    }, [value]);

    useEffect(() => {
        if (graphicStyle?.color) {
            setGsStyle(graphicStyle.color);
        }
    }, [graphicStyle]);

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
        } else {
            onAction(min);
        }
    };
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

    return (
        <View>
            <View style={styles.rootContainer}>
                <RoundedButton
                    title='-'
                    size={30}
                    textStyle={[
                        { fontSize: 18, alignItems: 'center' },
                        numberStyle,
                    ]}
                    style={{ borderColor: gsStyle }}
                    onPress={decreaseValue}
                />
                <TextInput
                    style={[
                        styles.numberBox,
                        graphicStyle,
                        styles.input,
                        numberStyle,
                    ]}
                    keyboardType='numeric'
                    value={inputValue}
                    onChangeText={handleInputChange}
                    maxLength={String(max).length}
                />
                <RoundedButton
                    title='+'
                    size={30}
                    style={{ borderColor: gsStyle }}
                    textStyle={[
                        { fontSize: 18, alignItems: 'center' },
                        numberStyle,
                    ]}
                    onPress={increaseValue}
                />
            </View>
        </View>
    );
}
export default NumberInputEditable;

const styles = StyleSheet.create({
    rootContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    numberBox: {
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: 'white',
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
        backgroundColor: 'white',
        borderRadius: 4,
    },
});
