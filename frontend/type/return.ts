interface ReturnWithMessage {
    message: string;
}

interface ReturnWithErrors {
    errors: string;
}

interface ReturnWithToken {
    token: string;
    img: string;
}

interface returnWIthBooleanAndMessage {
    message: string;
    success: boolean;
}

interface returnWIthBooleanAndMessageAndOrderId {
    message: string;
    success: boolean;
    orderId: number;
}
type Return = ReturnWithToken | ReturnWithMessage | ReturnWithErrors| returnWIthBooleanAndMessage| returnWIthBooleanAndMessageAndOrderId;

export default Return;
