import { Router } from "express";
import { requireAuth } from "../middlewares/auth-middleware";
import { organizationController } from "../controllers/organization-controller";

const router : Router = Router()
router.use(requireAuth);

//list all orgs this user has access to (+ roles like admin/member)
router.get("/list", organizationController.listUser_organizations);

//check role of user in this org
router.get("/checkrole/:org_name", organizationController.checkUser_organizationRole);

//if user=admin, allow creation of org table
router.post("/:org_name", organizationController.registerOrganization)

//if user=admin, unregister this org
router.delete("/:org_name", organizationController.unregisterOrganization)


export { router as organizationRouter }
