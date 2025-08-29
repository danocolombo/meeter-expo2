// ===============================
// TEMPORARY GLOBAL VARIABLE IMPLEMENTATION
// ---------------------------------------
// This is a temporary solution for persisting the 'from' value across routes.
// When you implement a proper state management solution (e.g. Zustand, Redux, React Context),
// REMOVE everything between the lines marked 'TEMPORARY GLOBAL VARIABLE IMPLEMENTATION'.
// Replace usages of useMeetingFrom and MeetingFromProvider with your state management logic.
// ===============================
let globalFrom: string | undefined = undefined;

export function useMeetingFrom() {
    return {
        from: globalFrom,
        setFrom: (val: string | undefined) => {
            globalFrom = val;
        },
    };
}

export function MeetingFromProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
// ===============================
// END TEMPORARY GLOBAL VARIABLE IMPLEMENTATION
// ===============================
