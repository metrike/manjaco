import UserRegister from "../type/user_register";
import AXIOS_ERROR from "../type/axios_error";
import axios from "axios";
const API_URL=process.env.EXPO_PUBLIC_API_URL as string
import RETURN  from "../type/return";
import UserLogin from "../type/user_login";
const config = {
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true
}

export const registerUser = async (userData: UserRegister): Promise<boolean> => {

    try {
        const { email, password,username } = userData;
        const response = await axios.post(
            `${API_URL}/auth/register`,
            {
                email,
                password,
                username
            },
            config
        );

        return response.data;
    } catch (err: unknown) {
        if ((err as AXIOS_ERROR).message) {
            throw new Error('Error connecting');
        } else {
            throw new Error('Error connecting to server');
        }
    }
};

export const loginUser = async (userData: UserLogin): Promise<RETURN> => {

    try {
        const { username, password } = userData;

        const response = await axios.post<RETURN>(
            `${API_URL}/auth/login`,
            {
                username,
                password,
            },
            config
        );
        console.log(response)

        return response.data;
    } catch (err: unknown) {
        console.error("Erreur lors de la connexion :", err);

        if (axios.isAxiosError(err) && err.message) {
            throw new Error("Erreur de connexion.");
        } else {
            throw new Error("Erreur de connexion au serveur.");
        }
    }
};