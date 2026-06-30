import { Router } from "express";
import { authController } from "../controllers/auth-controller";
import { requireAuth } from "../middlewares/auth-middleware";

const router = Router();

router.post("/login/oauth", authController.oauthLogin);
router.post("/login/pat",   authController.patLogin);

router.get("/callback", authController.callback);
router.get("/session", authController.getSession);
router.post("/logout", authController.logout);

router.get("/org/membership", requireAuth, authController.checkOrgMembership);

export { router as authRouter };
