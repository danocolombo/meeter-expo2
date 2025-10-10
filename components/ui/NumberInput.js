import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { RoundedButton } from './RoundedButton';
import { useTheme } from 'react-native-paper';
function NumberInput({ value, numberStyle, graphicStyle, onAction }) {
    const mtrTheme = useTheme();
    const inputStyles = [styles.input];
    const [gsStyle, setGsStyle] = useState('black');

    let numericValue = parseInt(value);
    const increaseValue = () => {
        const newOne = numericValue + 1;
        onAction(newOne);
    };
    const decreaseValue = () => {
        if (numericValue > 0) {
            onAction(numericValue - 1);
        } else {
            onAction(0);
        }
    };
    useEffect(() => {
        if (graphicStyle?.color) {
            setGsStyle(graphicStyle.color);
        }
    }, []);

    return (
        <View>
            <View style={styles.rootContainer}>
                <RoundedButton
                    title='-'
                    size={30}
                    textStyle={[
                        {
                            fontSize: 18,
                            alignItems: 'center',
                        },
                        numberStyle,
                    ]}
                    style={{ borderColor: gsStyle }}
                    onPress={decreaseValue}
                />
                <View style={[styles.numberBox, graphicStyle]}>
                    <Text style={[styles.number, graphicStyle]}>
                        {numericValue}
                    </Text>
                </View>
                <RoundedButton
                    title='+'
                    size={30}
                    style={{ borderColor: gsStyle }}
                    textStyle={[
                        {
                            fontSize: 18,
                            alignItems: 'center',
                        },
                        numberStyle,
                    ]}
                    onPress={increaseValue}
                />
            </View>
        </View>
    );
}
export default NumberInput;

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
        // backgroundColor: Colors.gray75,
        alignItems: 'center',
        justifyContent: 'center',
    },
    number: {
        fontSize: 24,
    },
});
