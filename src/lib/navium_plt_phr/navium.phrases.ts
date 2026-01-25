import { MessageKey } from "./message.key.js";

export const NAVIUM_PHRASES: Record<MessageKey, string> = {

    // Debugs
    [MessageKey.NAVIUM_PLT_ETR]: "route entered user registration.",
    [MessageKey.NAVIUM_REG_CREDS]: "required fields aren't provided by the user.",
    [MessageKey.NAVIUM_PLT_CR_F]: "navium plt account creation failedd.",
    [MessageKey.NAVIUM_PLT_CHK_ETR]: "route entered user login",
    [MessageKey.INVALID_EMAIL]: "email is invalid",

    [MessageKey.NAVIUM_PLT_PASS_INVALID]: "username or password is invalid."
}