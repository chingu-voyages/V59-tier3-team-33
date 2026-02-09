import Cookies from 'js-cookie';

const ACCESS_TOKEN_KEY = 'access_token';

export const cookieManager = {
  setAccessToken: (token: string) => {
    Cookies.set(ACCESS_TOKEN_KEY, token, {
      expires: 1, // 1 day
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  },

  getAccessToken: (): string | undefined => {
    return Cookies.get(ACCESS_TOKEN_KEY);
  },

  removeAccessToken: () => {
    Cookies.remove(ACCESS_TOKEN_KEY);
  },
};
