import connection from '../database/database.js';
import joi from 'joi';

export async function getGames (req, res){
    try{
            const name = req.query.name;
            let query = `SELECT g.*, c.name AS "categoryName", 
            COUNT(CASE WHEN r."gameId" = g.id THEN g.id END) AS "rentalsCount"
            FROM rentals r, games g
            JOIN categories c 
            ON g."categoryId" = c.id
            GROUP BY (g.id , c.name)`
            const limit = req.query.limit;
            const offset= req.query.offset;
            const desc = req.query.desc
            const order = req.query.order;

            if(limit){
                query+= ` LIMIT ${limit}` 
            }

            if(offset){
                query+= ` OFFSET ${offset}`
            }

            if(order){
                query+=` ORDER BY ${order}`
                if(desc === 'true'){
                    query+=` DESC`
                }
            }

            if(name !== undefined){
                const search = await connection.query(`
                SELECT g.*, c.name AS "categoryName",
                COUNT(CASE WHEN r."gameId" = g.id THEN g.id END) as "rentalsCount"
                FROM rentals r, games g 
                JOIN categories c 
                ON g."categoryId" = c.id 
                WHERE LOWER (g.name) LIKE $1
                GROUP BY (g.id , c.name)`, [`${name.toLocaleLowerCase()}%`])
                res.send(search.rows);
                return
            }
            const games = await connection.query(query)
            
            res.send(games.rows);    
    } catch (err){
     console.error(err);
     res.sendStatus(500);
    }
};

export async function createGame(req, res){
    try{
    
    
    await connection.query(`
    INSERT INTO games (name, image, "stockTotal", "categoryId", "pricePerDay") 
    VALUES ($1, $2, $3, $4, $5)`, [game.name, game.image, game.stockTotal, game.categoryId, game.pricePerDay])

    res.sendStatus(201)
    
    }catch (err){
        console.error(err);
        res.sendStatus(500);
    }


}