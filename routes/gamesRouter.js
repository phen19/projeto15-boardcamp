import {Router} from "express"
import { getGames, createGame } from "../controllers/gamesController.js"
import validateGame from "../middlewares/validateGame.js"

const router = Router();

router.get("/games", getGames);
router.post("/games", validateGame,createGame);

export default router