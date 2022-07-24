import {Router} from "express"
import { getRentals, createRental, deleteRent, returnRent, getRevenue } from "../controllers/rentalsController.js"
import { validateRent, validateReturn, validateDeleteRent } from "../middlewares/validateRent.js";

const router = Router()

router.post("/rentals", validateRent, createRental);
router.get("/rentals", getRentals);
router.post("/rentals/:id/return",validateReturn,returnRent);
router.delete("/rentals/:id", validateDeleteRent,deleteRent);
router.get("/rentals/metrics", getRevenue);

export default router