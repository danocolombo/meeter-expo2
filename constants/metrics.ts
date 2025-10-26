import { PixelRatio, StyleSheet } from 'react-native';

// Centralized metrics/design tokens for the app.
// hairlineWidth uses the platform-provided hairline if available,
// otherwise falls back to a 0.5/1.0 value depending on pixel density.
export const hairlineWidth =
    (StyleSheet && StyleSheet.hairlineWidth) ||
    (PixelRatio.get() >= 2 ? 0.5 : 1);
export const screenTopMargin = 50;
export const screenPaddingHorizontal = 15;
export const screenPaddingVertical = 16;
export const screenMarginHorizontal = 10;
export const screenMarginVertical = 10;
export const rowPadding = 5;
export const rowMargin = 10;
export default {
    hairlineWidth,
    screenTopMargin,
    screenMarginHorizontal,
    screenMarginVertical,
    screenPaddingHorizontal,
    screenPaddingVertical,
    rowPadding,
    rowMargin,
};
