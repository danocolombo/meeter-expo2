import { setAPIToken } from '@features/user/userSlice';
import { getAPIToken } from '../features/user/userAPI';

function isSuccessResponse<T>(
    res: unknown
): res is { status: number; data: T } {
    return (
        !!res &&
        typeof res === 'object' &&
        'status' in (res as any) &&
        typeof (res as any).status === 'number' &&
        (res as any).status === 200
    );
}

export async function refreshUserApiToken(dispatch: any, profile: any) {
    if (!profile) throw new Error('No profile');
    const username = profile.username || profile.firstName || profile.email;
    const email = profile.email || '';
    const sub = profile.sub || profile.awsId || '';
    if (!username || !sub) throw new Error('Insufficient profile info');

    const tokenResponse = await getAPIToken(username, email, sub);
    if (isSuccessResponse<any>(tokenResponse)) {
        const token = tokenResponse.data;
        // update redux if dispatch provided
        if (dispatch && typeof dispatch === 'function') {
            dispatch(setAPIToken(token));
        }
        return token;
    }
    throw new Error('Failed to refresh token');
}

export default refreshUserApiToken;
