import TypeSelector from '@components/ui/TypeSelector';
const TypeSelectors = ({ pick, setPick }) => {
    return (
        <TypeSelector
            title='Meeting Type'
            selectedValue={pick}
            values={['Lesson', 'Testimony', 'Special']}
            setSelectedValue={setPick}
        ></TypeSelector>
    );
};

export default TypeSelectors;
