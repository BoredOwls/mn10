import { Router } from "express";
import { requireAuth } from "../middlewares/auth-middleware";
import { projectController } from "../controllers/project-controller";

const router = Router();

router.use(requireAuth);

router.post("/", projectController.createProject);
router.get("/", projectController.getProjects);
router.get("/:id", projectController.getProject);
router.delete("/:id", projectController.deleteProject);

export { router as projectRouter };
