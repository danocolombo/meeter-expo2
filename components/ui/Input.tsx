import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
const Input = ({ label, labelStyle, textInputConfig }) => {
    const inputStyles = [styles.input];
    if (textInputConfig && textInputConfig.multiline) {
        inputStyles.push(styles.inputMultiline);
    }
    return (
        <>
            <View>
                {label && (
                    <View>
                        <Text style={labelStyle}>{label}</Text>
                    </View>
                )}
                <View style={[]}>
                    <TextInput style={inputStyles} {...textInputConfig} />
                </View>
            </View>
        </>
    );
};

export default Input;

const styles = StyleSheet.create({
    inputStyles: {
        height: 20,
    },
    inputMultiline: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    inputContainer: {},
});
