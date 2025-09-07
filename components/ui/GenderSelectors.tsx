import Selectors from '@/components/ui/Selectors';
const GenderSelectors = ({ pick, setPick }) => {
    return (
        <>
            <Selectors
                selectedValue={pick}
                values={['f', 'm', 'x']}
                setSelectedValue={setPick}
            ></Selectors>
        </>
    );
};

export default GenderSelectors;
