import { loginUser } from '@features/user/userThunks';
import { useNavigation } from '@react-navigation/native';
import type { AppDispatch } from '@utils/store';
import { useState } from 'react';
import { useDispatch } from 'react-redux';

export default function useAuth() {
    const navigation = useNavigation();
    const dispatch = useDispatch<AppDispatch>();
    // const user = useSelector((state: RootState) => state.user);
    const [isLoading, setIsLoading] = useState(false);
    const [userError, setUserError] = useState(null);
    const handleLoginUser = (login: string, password: string) => {
        setIsLoading(true);
        const mockData: any = {
            signInUserSession: {
                idToken: {
                    jwtToken:
                        'eyJraWQiOiJSVzFMbnpJNTZUZ1lwRENoRnZrZTd0Vk9nbjBYNmpMM0FvelBmVWhsTktRPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI0NTVmZmUzNy1iYmJjLTQ5NGMtOWY1MC0yMmJiNWNhNzBkNWEiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLWVhc3QtMS5hbWF6b25hd3MuY29tXC91cy1lYXN0LTFfWE00V1hRNmxqIiwicGhvbmVfbnVtYmVyX3ZlcmlmaWVkIjpmYWxzZSwiY29nbml0bzp1c2VybmFtZSI6ImRjb2xvbWJvIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiZGNvbG9tYm8iLCJnaXZlbl9uYW1lIjoiRGFubyIsIm9yaWdpbl9qdGkiOiJiODY3Yzc4MC05ZjNlLTQxNjktYWU3MC04ODM2YzFmZDUyOWQiLCJhdWQiOiI2ZmUyNmxoMWhwdnB2czczdWs1cXQ1MGc1NyIsImV2ZW50X2lkIjoiYjkwNDEwOWMtYjQxZi00MTQ1LTg4MzItMzg5YThiNTA3NzJmIiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE3NTk0NTA0MTksImV4cCI6MTc1OTQ1NDAxOSwiaWF0IjoxNzU5NDUwNDE5LCJmYW1pbHlfbmFtZSI6IkNvbG9tYm8iLCJqdGkiOiIxOGI3ODZkYy01MDg4LTRmZTEtYTkyMC1hZDYxYjdjNDM3YTMiLCJlbWFpbCI6ImRhbm9jb2xvbWJvQGdtYWlsLmNvbSJ9.XWlZdZYJZdKVxOwPox8r1jPJW8Vb3c4uau9ekh8Hxn7zJr_T8phYXbIvmbbjbrHtnbVT-K-PPA6KQD6G8Q_SEZ91bUwK2AgZH8LhwphTx-mkx5HYgnRSeI7Dngzh6Y4cLrYbegrw6Q26zepoe4eFQ0BWIrr-jICD41pFbgJGZQ340GRXoUeiS4nEb8PU11KZ23AtPcTKTrJbd-YW2Gs2hSswcHf92NBa7C7GM5Hnvf5gnormfF6OvC0eJ7T3boYvh5xm9fGVki1XIWvjg0iUUepB3VKqu7XxierxIiRwzDtOnyNbIToYXeyGuarI7kPOd-bTYoHpM7jWk33JLTtsbw',
                    payload: {
                        sub: '455ffe37-bbbc-494c-9f50-22bb5ca70d5a',
                        email_verified: true,
                        iss: 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_XM4WXQ6lj',
                        phone_number_verified: false,
                        'cognito:username': 'dcolombo',
                        preferred_username: 'dcolombo',
                        given_name: 'Dano',
                        origin_jti: 'b867c780-9f3e-4169-ae70-8836c1fd529d',
                        aud: '6fe26lh1hpvpvs73uk5qt50g57',
                        event_id: 'b904109c-b41f-4145-8832-389a8b50772f',
                        token_use: 'id',
                        auth_time: 1759450419,
                        exp: 1759454019,
                        iat: 1759450419,
                        family_name: 'Colombo',
                        jti: '18b786dc-5088-4fe1-a920-ad61b7c437a3',
                        email: 'danocolombo@gmail.com',
                    },
                },
                refreshToken: {
                    token: 'eyJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiUlNBLU9BRVAifQ.JkKJiyMb8D1KNEC0S-s09FxEr7Y9bGg2MRFZFsY-jURexTlueD5aTe_xUNMo2UBzoUfwI-wDmcNTcLlShD9rcaXPKdj4mlMQhQE2YPGQUpSDXF58QiMyZyfw0TMwSqMtkRohBuBYUARz8LuHA_JVnrAgGVc_U6NyxMzkR2LP1ZHvu8lKR38aZkXmAenpSEsruOLT2umumN2f7ydkWW9_xYtjQ-54e34lAcykCt4KqEc961O5ZsU79iHTEKyCB-RpUqbGxIgZMFWWmUl5qmG8KDSDacZov34AnSZEB15qVWYj_FoFsyycC_mP51AUO5O-oxNT0uWoAWQFfX6sH1OMWg.TWgfKyiKe76F0IYp.J2mN1znc5ZryTAcwVbeg4yDY_cwo9VqHQbvvTJ-Ln81BeEaJGGIHrenLNDdyPAMk3R_cpFQA1V85_FMq1U4IkRjL2fMM5WkCJ7b7SNdfnGzxAZSyWkxwlGEmfVOeLHgs-2WuoCoXjoT6E7QJqsVeZLVpXUDw44XfOAwBIm2b2DGezarUFpw-JGVmkS4R-iBP7lNgHIGnP1ugp8UV0CywF5ROmkvsD6HdalAD8Fw27LHBHUZZm0JS_ptMGPPw4h22MgYo4Nia2sqcQB8eI6V1_a4IYrUT7VZHiUs958ZZBj4lWB_opd38VulGjo-3rV39GO39khlI1_TmSt5XoWvEqDN6LW9d73o0_1Q-qmHSsuBINYxbGhigffQK4X5-D5RdMXvhMOXaIPbRDw1UmZ2qF5dUCEE3KytVCehm8CEIBe4jspqWY1iUckBwaCnL2nz3WuNwElfAkJc_8AADjFtyh1nnw7JQKDpR0FqC8zdwlLGzhwoI5rCOdI2Tq3kNVUGrswKog7JCjnDER2m6jytbMPwe0vPXJLT42fXJixTTeV81zM-Xzk3IxgudSTaEV_oef374SnsrI-TzWc7IOcNJy0yKlsuSt-vUqTrOXgVrbtAVrmyTAITwpB_z8UN6sRS0FjovsFIZijA9w0xK6j-7sckP-M0bKOlkvIMV6Roif0cRYzO6vFpR__pV8sR3apxpTfWqkJu3RGuoDlA3rLD4wMdYvgNUNqz8YXBaYbGtRBLYrBCFX4T82A-AGslMsRLD1bt-OaltXTZvO5uLJSxVb1jMGCUFKr-5xoY3LkJCPn0BeMtrXP-OCyVysw6_9Yt2ONukFiPUacd63byTD8ygu_RgyUjXrtr79acINPQp_FwCjxemuS3HzbOtLD898H_q4lQ1kh7GO22_iQ95dLTt6cgPgsveH6D_vBTJgULJhf8dEAS3P6dVjglEndzGPIv05F0piWX6FyQsefW3eHr_-giN_7ZLm4gpndb9RsFiBvWrBjy6FT84X357OLKB5ngSrJHuAbBWHu_JiCl-NnQh9LPraK9Tab2uLIqdDCcfV5b88bbpgecEMYn2aJbHBn8vPJVtuRlTFzl7WvRFlE3fAH4x41kGiHAXesQzasySxcxDr7ge-NdKJOmkI-r9bW1lkavJ7B80ZpiMx1pdG1LPautf8No0pNmodyDUHk5DNX3MNVrfvHTRW9YGvi3i90YQSTWAQWmKgGp3gjlR12VROQm1gPW6WYOWB-B_n07rqEPfbNH3NDCQ-_u-lvPkilW65pQAFSeu.nt_UEgm9rDURmNdD53G5Hg',
                },
                accessToken: {
                    jwtToken:
                        'eyJraWQiOiIyYmF2NDdDNmN1ektcL0VZMHdBS0FKV1ZGeUFValZuZXE5NmQ1c1wvUzFwMHc9IiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiI0NTVmZmUzNy1iYmJjLTQ5NGMtOWY1MC0yMmJiNWNhNzBkNWEiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV9YTTRXWFE2bGoiLCJjbGllbnRfaWQiOiI2ZmUyNmxoMWhwdnB2czczdWs1cXQ1MGc1NyIsIm9yaWdpbl9qdGkiOiJiODY3Yzc4MC05ZjNlLTQxNjktYWU3MC04ODM2YzFmZDUyOWQiLCJldmVudF9pZCI6ImI5MDQxMDljLWI0MWYtNDE0NS04ODMyLTM4OWE4YjUwNzcyZiIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiYXdzLmNvZ25pdG8uc2lnbmluLnVzZXIuYWRtaW4iLCJhdXRoX3RpbWUiOjE3NTk0NTA0MTksImV4cCI6MTc1OTQ1NDAxOSwiaWF0IjoxNzU5NDUwNDE5LCJqdGkiOiI1YmI5MGJiNy0yYzExLTQ0MTMtODhkOC0wNTc2ZmMzZTc2Y2QiLCJ1c2VybmFtZSI6ImRjb2xvbWJvIn0.nK6FY5V3l7WKllik_eYa0yoES88rLIRXy5B9gCmN9PCL0pZTZoXBHphe_tUtCHskI8_LC2Y_xmwB62yTpBSkpRVEv4AscAanPrsUvPkyGjgE9CmH0hAK83hgwTSc0mJGSHNAIfvcwDcBpK54mDCKVx3qluMQSrrPgvZJlm4sqxHknNU3eAwwTQRgTKWLDAAoBpk-WZei-X39UqzIKoCE89ZyENGn88dGiqhk-0InEL0q6Xq4sCdiEe-70tVHwqd6sDSu2hIxCdREO2wGcj1yAXoQmWBGK34b5p6iFM-5uCcwTkSweStRs2kqsPd8Lb08mVJlZS2D_OlMXddZdI5Kdw',
                    payload: {
                        sub: '455ffe37-bbbc-494c-9f50-22bb5ca70d5a',
                        iss: 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_XM4WXQ6lj',
                        client_id: '6fe26lh1hpvpvs73uk5qt50g57',
                        origin_jti: 'b867c780-9f3e-4169-ae70-8836c1fd529d',
                        event_id: 'b904109c-b41f-4145-8832-389a8b50772f',
                        token_use: 'access',
                        scope: 'aws.cognito.signin.user.admin',
                        auth_time: 1759450419,
                        exp: 1759454019,
                        iat: 1759450419,
                        jti: '5bb90bb7-2c11-4413-88d8-0576fc3e76cd',
                        username: 'dcolombo',
                    },
                },
                clockDrift: 3,
            },
        };
        //add a couple of flags for auth state
        // e.g. isAuthenticated, isLoading, error, etc.
        // then
        mockData.isAuthenticated = true;
        mockData.isLoading = false;
        mockData.error = null;
        const apiToken =
            process.env.EXPO_PUBLIC_JERICHO_API_TOKEN || 'test-token';
        dispatch(loginUser({ inputs: mockData, apiToken }));
        setIsLoading(false);
        setUserError(null);
    };
    return {
        navigation,
        handleLoginUser,
        isLoading,
        userError,
    };
}
