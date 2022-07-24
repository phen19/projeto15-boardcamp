import {Router} from "express"
import { getCustomers, getCustomerById, createCustomer, updateCustomer } from "../controllers/customersController.js"
import { validateCustomer , validateUpdateCustomer } from "../middlewares/validateCustomer.js";

const router = Router();

router.get("/customers", getCustomers);
router.post("/customers", validateCustomer, createCustomer);
router.get("/customers/:id", getCustomerById);
router.put("/customers/:id", validateUpdateCustomer ,updateCustomer)

export default router