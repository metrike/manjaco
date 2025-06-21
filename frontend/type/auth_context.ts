import USER_LOGIN from "./user_login";
import CONNECTION_RESPONSE_LOGIN from "./connection_response_login";
import Return from "./return";

interface auth_context {
    isAuthenticated: boolean
    login: (userData: USER_LOGIN) => Promise<Return>
    // logout: () => Promise<CONNECTION_RESPONSE_LOGIN>
    // checkDoubleAuth: (code: string, username: string) => Promise<CONNECTION_RESPONSE_LOGIN>
    // checkRecoveryCodeLogin: (code: string, recoveryCode: string) => Promise<CONNECTION_RESPONSE_LOGIN>
}

export default auth_context