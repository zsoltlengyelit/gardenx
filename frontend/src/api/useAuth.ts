import {atom, useAtom, useAtomValue} from "jotai";
import {useState} from "react";
import axios from "axios";
import {atomWithStorage} from "jotai/utils";
import jwt_decode from 'jwt-decode';
import {axiosInstance} from "./axiosInstance";

const accessTokenAtom = atomWithStorage<string>('happy_access_token', '');

const jwtContent = atom<Record<string, string> | null>((get) => {
    const tokenString = get(accessTokenAtom);

    return tokenString ? jwt_decode(tokenString) : null;
});

export function useAuth() {
    const [accessToken, setAccessToken] = useAtom(accessTokenAtom);
    const [authError, setAuthError] = useState<any>(null);

    const jwt = useAtomValue(jwtContent)

    async function login(pin: string) {
        try {
            const resp = await axiosInstance.post('/auth/login', {
                username: 'admin',
                password: pin
            });

            setAccessToken(resp.data.access_token);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setAuthError(error.response?.statusText);
            } else
                setAuthError("Unknown error");
        }
    }

    return {
        login,
        authError,
        accessToken,
        jwt,
        isAuthenticated: !!accessToken,
        logout: () => setAccessToken('')
    }
}