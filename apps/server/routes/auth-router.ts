import { Router } from "express";
import { authController } from "../controllers/auth-controller";

const router = Router();

router.post("/login/oauth", authController.oauthLogin);
router.post("/login/pat",   authController.patLogin);

router.get("/callback", authController.callback);
router.get("/session", authController.getSession);
router.post("/logout", authController.logout);

export { router as authRouter };
