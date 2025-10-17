import themedStyle from '@assets/Styles';
import { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
const Tooltip = ({ children, content }) => {
    const [isTooltipVisible, setTooltipVisible] = useState(false);
    const toggleTooltip = () => {
        setTooltipVisible(!isTooltipVisible);
    };

    return (
        <View style={themedStyle.tooltipContainer}>
            <TouchableOpacity onPress={toggleTooltip}>
                {children}
            </TouchableOpacity>
        </View>
    );
};

export default Tooltip;
