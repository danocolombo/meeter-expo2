import * as userAPI from '@features/user/userAPI';
import { refreshApiToken } from '@features/user/userThunks';
// avoid importing the slice (ESM import) in Jest env; we'll assert on action.type string

describe('refreshApiToken thunk', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('dispatches setAPIToken and resolves token on success', async () => {
        const fakeToken = { plainTextToken: 'abc123' };
        jest.spyOn(userAPI, 'getAPIToken').mockResolvedValue({
            status: 200,
            data: fakeToken,
        });

        const dispatched: any[] = [];
        const dispatch = (action: any) => {
            dispatched.push(action);
            return action;
        };
        const getState = () => ({
            user: { profile: { username: 'u', email: 'e', sub: 's' } },
        });

        const thunkAction = refreshApiToken({
            profile: { username: 'u', email: 'e', sub: 's' },
        }) as any;
        const result = await thunkAction(dispatch, getState, undefined);

        // verify the returned action is a fulfilled action with the token payload
        expect(typeof result.type).toBe('string');
        expect(/fulfilled$/.test(result.type)).toBe(true);
        expect(result.payload).toEqual(fakeToken);
        // expect setAPIToken to be dispatched (action type should end with 'setAPIToken')
        expect(
            dispatched.some(
                (a: any) =>
                    typeof a.type === 'string' && /setAPIToken$/.test(a.type)
            )
        ).toBe(true);
    });

    it('rejects when profile is missing', async () => {
        const dispatched: any[] = [];
        const dispatch = (action: any) => dispatched.push(action);
        const getState = () => ({ user: { profile: null } });

        const thunkAction = refreshApiToken() as any;
        const result = await thunkAction(dispatch, getState, undefined);
        expect(typeof result.type).toBe('string');
        expect(/rejected$/.test(result.type)).toBe(true);
    });

    it('rejects when profile lacks username/sub', async () => {
        const dispatched: any[] = [];
        const dispatch = (action: any) => dispatched.push(action);
        const getState = () => ({ user: { profile: { email: 'e' } } });

        const thunkAction = refreshApiToken() as any;
        const result = await thunkAction(dispatch, getState, undefined);
        expect(typeof result.type).toBe('string');
        expect(/rejected$/.test(result.type)).toBe(true);
    });

    it('rejects when getAPIToken returns non-200', async () => {
        jest.spyOn(userAPI, 'getAPIToken').mockResolvedValue({
            status: 422,
            data: { message: 'nope' },
        });
        const dispatched: any[] = [];
        const dispatch = (action: any) => dispatched.push(action);
        const getState = () => ({
            user: { profile: { username: 'u', email: 'e', sub: 's' } },
        });

        const thunkAction = refreshApiToken({
            profile: { username: 'u', email: 'e', sub: 's' },
        }) as any;
        const result = await thunkAction(dispatch, getState, undefined);
        expect(typeof result.type).toBe('string');
        expect(/rejected$/.test(result.type)).toBe(true);
    });

    it('rejects when getAPIToken throws', async () => {
        jest.spyOn(userAPI, 'getAPIToken').mockRejectedValue(
            new Error('network')
        );
        const dispatched: any[] = [];
        const dispatch = (action: any) => dispatched.push(action);
        const getState = () => ({
            user: { profile: { username: 'u', email: 'e', sub: 's' } },
        });

        const thunkAction = refreshApiToken({
            profile: { username: 'u', email: 'e', sub: 's' },
        }) as any;
        const result = await thunkAction(dispatch, getState, undefined);
        expect(typeof result.type).toBe('string');
        expect(/rejected$/.test(result.type)).toBe(true);
    });
});
