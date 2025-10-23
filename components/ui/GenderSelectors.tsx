import Selectors from '@components/ui/Selectors';
import React from 'react';

type GenderSelectorsProps = {
    pick: string;
    setPick?: (v: string) => void;
    values?: string[];
};

const GenderSelectors = ({
    pick,
    setPick,
    values = ['m', 'f', 'x'],
}: GenderSelectorsProps) => {
    return (
        <>
            <Selectors
                selectedValue={pick}
                values={values}
                setSelectedValue={setPick ?? (() => {})}
            ></Selectors>
        </>
    );
};

export default GenderSelectors;
