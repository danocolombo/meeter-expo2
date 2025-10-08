import theme from '@assets/Colors';
import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { Badge } from 'react-native-paper';

interface BadgeNumberProps {
    value: number;
    size?: number;
    style?: StyleProp<ViewStyle>;
}

/**
 * A reusable numeric badge component
 * @param {BadgeNumberProps} props
 * @returns {JSX.Element} Badge component with number
 */
const BadgeNumber: React.FC<BadgeNumberProps> = ({
    value,
    size = 40,
    style,
}) => {
    return (
        <Badge
            size={size}
            style={{
                backgroundColor: theme.colors.lightGraphic,
                // @ts-ignore: textColor is not a valid prop for Badge, but keeping for compatibility
                color: theme.colors.darkText,
                ...(Array.isArray(style) ? Object.assign({}, ...style) : style),
            }}
        >
            {value || 0}
        </Badge>
    );
};

export default BadgeNumber;
