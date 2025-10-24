import React from 'react';
import renderer from 'react-test-renderer';

// Import components under test after mocks
import Group from '../../app/(group)/[id]';
import MeetingDetails from '../../app/(meeting)/[id]';
import GroupListCard from '../../components/GroupListCard';

// Mocks for expo-router (useRouter, useLocalSearchParams, Stack)
const mockUseRouter = jest.fn();
const mockUseLocalSearchParams = jest.fn();

jest.mock('expo-router', () => {
    const useRouter = () => mockUseRouter();
    const useLocalSearchParams = () => mockUseLocalSearchParams();

    const Stack: any = ({ children }: any) =>
        React.createElement(React.Fragment, null, children);
    // Render headerLeft/headerRight functions for tests so we can find buttons
    Stack.Screen = ({ options, children }: any) => {
        const left = options?.headerLeft ? options.headerLeft() : null;
        const right = options?.headerRight ? options.headerRight() : null;
        return React.createElement(
            React.Fragment,
            null,
            left,
            right,
            children || null
        );
    };

    return { useRouter, useLocalSearchParams, Stack };
});

// Mock react-navigation's useNavigation for MeetingDetails setOptions capture
const mockSetOptions = jest.fn();
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({ setOptions: mockSetOptions }),
    useFocusEffect: (cb: any) => cb(),
}));

// Mock react-redux
const mockUseSelector = jest.fn();
const mockUseDispatch = jest.fn();
jest.mock('react-redux', () => ({
    useSelector: (fn: any) => mockUseSelector(fn),
    useDispatch: () => mockUseDispatch(),
}));

describe('Navigation transitions: meeting -> group -> group/edit', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('MeetingDetails Edit button navigates to meeting edit with meeting param and origin', () => {
        // prepare a fake meeting and params
        const fakeMeeting = {
            id: 'm1',
            meeting_date: new Date().toISOString(),
            meeting_type: 'regular',
            title: 'Test Meeting',
            groups: [],
        };

        // useLocalSearchParams is called twice: first for id/origin/org_id, second for routeMeetingParam
        mockUseLocalSearchParams
            .mockImplementationOnce(() => ({
                id: 'm1',
                origin: 'active',
                org_id: 'org1',
            }))
            .mockImplementationOnce(() => ({
                meeting: JSON.stringify(fakeMeeting),
            }));

        const pushSpy = jest.fn();
        mockUseRouter.mockReturnValue({
            push: pushSpy,
            replace: jest.fn(),
            back: jest.fn(),
        });

        // ensure selector returns a user with manage perms
        mockUseSelector.mockImplementation((sel: any) => {
            return {
                profile: {
                    apiToken: { plainTextToken: 't' },
                    permissions: ['manage'],
                },
            };
        });

        // render MeetingDetails
        renderer.create(React.createElement(MeetingDetails));

        // navigation.setOptions should have been called with headerRight
        expect(mockSetOptions).toHaveBeenCalled();
        const optionsArg = mockSetOptions.mock.calls[0][0];
        expect(typeof optionsArg.headerRight).toBe('function');

        // call the headerRight to get the element and invoke its onPress
        const headerElement = optionsArg.headerRight();
        // headerElement should be a React element with props.onPress
        expect(headerElement).toBeDefined();
        // call the onPress handler and assert router.push called with meeting edit path
        headerElement.props.onPress();
        expect(pushSpy).toHaveBeenCalled();
        const pushArg = pushSpy.mock.calls[0][0];
        expect(pushArg.pathname).toBe('/(meeting)/(edit)/[id]');
        expect(pushArg.params).toBeDefined();
        expect(pushArg.params.id).toBe('m1');
        expect(pushArg.params.meeting).toBe(JSON.stringify(fakeMeeting));
        expect(pushArg.params.from).toBe('active');
    });

    it('GroupListCard navigates to group with origin and meeting id', () => {
        const pushSpy = jest.fn();
        mockUseRouter.mockReturnValue({ push: pushSpy });

        // parent params include origin and org_id
        mockUseLocalSearchParams.mockReturnValue({
            origin: 'active',
            org_id: 'org1',
        });

        mockUseSelector.mockImplementation((sel: any) => ({
            profile: { permissions: ['groups'] },
        }));

        const fakeGroup = {
            id: 'g1',
            title: 'G',
            location: 'L',
            facilitator: 'F',
            cofacilitator: 'C',
            notes: 'N',
            gender: 'x',
            attendance: 5,
        };

        const tree = renderer.create(
            React.createElement(GroupListCard, {
                group: fakeGroup as any,
                fromMeetingId: 'm1',
            })
        );
        const pressable = tree.root.findByProps({
            onPress: expect.any(Function),
        });
        // invoke onPress
        pressable.props.onPress();

        expect(pushSpy).toHaveBeenCalled();
        const arg = pushSpy.mock.calls[0][0];
        expect(arg.pathname).toBe('/(group)/[id]');
        expect(arg.params).toMatchObject({
            id: 'g1',
            fromMeetingId: 'm1',
            origin: 'active',
            org_id: 'org1',
        });
    });

    it('Group screen Edit header navigates to group edit with group params', () => {
        const pushSpy = jest.fn();
        mockUseRouter.mockReturnValue({ push: pushSpy, back: jest.fn() });

        // Provide params for group page (single call)
        mockUseLocalSearchParams.mockReturnValue({
            id: 'g1',
            meetingId: 'm1',
            title: 'Group Title',
            location: 'Loc',
            facilitator: 'F',
            cofacilitator: 'C',
            notes: 'N',
            gender: 'x',
            attendance: '4',
        });

        mockUseSelector.mockImplementation((sel: any) => ({
            profile: { permissions: ['groups'] },
            meetings: { meetings: [] },
        }));

        const tree = renderer.create(React.createElement(Group));
        // Stack.Screen mock renders headerRight inline; find the Edit button by text
        const editButton = tree.root.findAllByProps({ children: 'Edit' })[0];
        expect(editButton).toBeDefined();
        // parent of Text is TouchableOpacity; call its onPress
        const touch = editButton.parent;
        expect(typeof touch.props.onPress).toBe('function');
        touch.props.onPress();

        expect(pushSpy).toHaveBeenCalled();
        const navArg = pushSpy.mock.calls[0][0];
        // push should target the group edit path
        expect(navArg.pathname).toBe('/(group)/(edit)/[id]');
        expect(navArg.params).toMatchObject({
            id: 'g1',
            meetingId: 'm1',
            title: 'Group Title',
        });
    });
});
