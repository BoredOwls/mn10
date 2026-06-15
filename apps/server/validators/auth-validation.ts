import { z } from "zod";
import { BadRequestError } from "../common/api-error";

const callBackSchema = z.object({
    code: z.string().min(1, "missing_code"),
    state: z.string().min(1, "missing_state"),
    cookieState: z.string().min(1, "missing_cookie_state"),
});

const parseCallback = (params: unknown) => {
    const result = callBackSchema.safeParse(params);
    if (!result.success) {
        throw new BadRequestError("invalid_callback_params");
    }
    return result.data;
};

export const AuthValidation = { parseCallback };
