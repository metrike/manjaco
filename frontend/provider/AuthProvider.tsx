import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import USER_LOGIN from "../type/user_login"
import AUTH_CONTEXT_TYPE from "../type/auth_context"
import CONNECTION_RESPONSE_LOGIN from "../type/connection_response_login"
import { useLocation } from "react-router-dom"
import {checkIsLogin, loginUser} from "../services/AuthService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Return from "../type/return";
import {router, usePathname} from "expo-router";
const defaultContextValue: AUTH_CONTEXT_TYPE = {
    isAuthenticated: false,
    login: async (): Promise<Return> => {
        await Promise.resolve()

        return { message: "" }
    },
    // logout: async (): Promise<CONNECTION_RESPONSE_LOGIN> => {
    //     await Promise.resolve()
    //
    //     return { message: "" }
    // },
    // checkDoubleAuth: async (): Promise<CONNECTION_RESPONSE_LOGIN> => {
    //     await Promise.resolve()
    //
    //     return { message: "" }
    // },
    // checkRecoveryCodeLogin: async (): Promise<CONNECTION_RESPONSE_LOGIN> => {
    //     await Promise.resolve()
    //
    //     return { message: "" }
    // }
}
const publicRoutes = ["/+not-found", "/login", "/register"];

const AUTH_CONTEXT = createContext<AUTH_CONTEXT_TYPE>(defaultContextValue)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(true)
    const pathName = usePathname();
    useEffect(() => {
        const result = async () => {
            try {
                const data = await checkIsLogin()
                if (data.message) {
                    setIsAuthenticated(true)
                }else{
                    setIsAuthenticated(false)
                    await AsyncStorage.removeItem("token");
                }
            } catch (error) {
                setIsAuthenticated(false)
                const isPublic = publicRoutes.some((route) => {
                    return pathName === route;
                })
                if (!isPublic) {
                    router.push("/+not-found");
                }
                await AsyncStorage.removeItem("token");
                throw new Error("Error")
            }
        }
        result().then(r => r).catch((e: unknown) => e)
    }, [location.pathname])

    const login = async (userData: USER_LOGIN): Promise<Return> => {
        const data = await loginUser(userData)
        if (data.token) {
            await AsyncStorage.setItem("token", data.token.token);
            setIsAuthenticated(true)
        }

        return data
    }
    // const logout = async (): Promise<CONNECTION_RESPONSE_LOGIN> => {
    //     const result = await logoutUser()
    //     if (result.message) {
    //         cookies.remove("token", { path: "/" })
    //         setIsAuthenticated(false)
    //     }
    //
    //     return result
    // }
    // const checkDoubleAuth = async (code: string, username: string):Promise<CONNECTION_RESPONSE_LOGIN> => {
    //     const data = await checkDoubleAuthLogin(code, username)
    //     if (data.message) {
    //         setIsAuthenticated(true)
    //         sessionStorage.removeItem("username")
    //         cookies.set("token", data.message, { path: "/", secure: true , sameSite: "none"})
    //     }
    //
    //     return data
    // }
    // const checkRecoveryCodeLogin = async (code: string, username: string):Promise<CONNECTION_RESPONSE_LOGIN> => {
    //     const data = await checkRecoveryCode(code, username)
    //     if (data.message) {
    //         setIsAuthenticated(true)
    //         sessionStorage.removeItem("username")
    //         cookies.set("token", data.message, { path: "/", secure: true , sameSite: "none"})
    //     }
    //
    //     return data
    // }

    return (
        <AUTH_CONTEXT.Provider value={{ isAuthenticated, login}}>
            {children}
        </AUTH_CONTEXT.Provider>
    )
}

export const useAuth = () => useContext(AUTH_CONTEXT)