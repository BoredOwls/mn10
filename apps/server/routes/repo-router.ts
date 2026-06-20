
import { Router } from "express";
import { requireAuth } from "../middlewares/auth-middleware";
import { repoController } from "../controllers/repo-controller";

const router = Router();

router.use(requireAuth);

router.get("/", repoController.getRepos);
router.get("/:owner", repoController.getReposByOwner);

router.get("/:owner/:repo/issues", repoController.getIssues);
router.get("/:owner/:repo/issues/:issueNumber", repoController.getIssue);
router.get("/:owner/:repo/issues/:issueNumber/comments", repoController.getIssueComments);

router.get("/:owner/:repo/pr", repoController.getPrs);
router.get("/:owner/:repo/pr/:prNumber", repoController.getPr);
router.get("/:owner/:repo/pr/:prNumber/comments", repoController.getPrComments);

export { router as repoRouter };
