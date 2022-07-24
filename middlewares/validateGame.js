import connection from '../database/database.js';
import gamesSchema from '../schemas/gamesSchema.js'

async function validateGame(req, res, next){
    const game = req.body
   
    const validation = gamesSchema.validate(game,{abortEarly: false});
    if(validation.error){
        res.status(400).send(validation.error.details.map(item => item.message))
        return
    }

    const existingGame = await connection.query('SELECT * FROM games WHERE name = $1', [game.name])
    if (existingGame.rowCount !== 0) {
        return res.sendStatus(409);
      }

    res.locals.game = game;
    next()
}

export default validateGame