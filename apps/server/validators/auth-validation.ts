import { z } from "zod";
import { BadRequestError } from "../common/api-error";

const callBackSchema = z.object({
    code: z.string().min(1, "missing_code"),
    state: z.string().min(1, "missing_state"),
    cookieState: z.string().min(1, "missing_cookie_state"),
});


const oauthLoginSchema = z.object({
    clientId:     z.string().min(1, "missing_client_id"),
    clientSecret: z.string().min(1, "missing_client_secret"),
});
 
const patLoginSchema = z.object({
    pat: z.string().min(1, "missing_pat"),
});


const parseCallback = (params: unknown) => {
    const result = callBackSchema.safeParse(params);
    if (!result.success) {
        throw new BadRequestError("invalid_callback_params");
    }
    return result.data;
};


const parseOAuthLogin = (body: unknown) => {
    const result = oauthLoginSchema.safeParse(body);
    if (!result.success) throw new BadRequestError("invalid_oauth_params");
    return result.data;
};
 
const parsePatLogin = (body: unknown) => {
    const result = patLoginSchema.safeParse(body);
    if (!result.success) throw new BadRequestError("invalid_pat_params");
    return result.data;
};


export const AuthValidation = { parseCallback, parsePatLogin, parseOAuthLogin };
