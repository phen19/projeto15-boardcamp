import connection from '../database/database.js';
import joi from 'joi';
import dayjs from 'dayjs';

export async function createRental(req, res){
    try{
        const rental = res.locals.rental
        await connection.query(`
        INSERT INTO rentals ("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee")
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [rental.customerId, rental.gameId, rental.rentDate, rental.daysRented, rental.returnDate, rental.originalPrice, rental.delayFee])

        res.sendStatus(201)
    }catch(err){
        console.error(err);
        res.sendStatus(500);        
    }
}

export async function getRentals (req, res){
    try{

            const customerId = req.query.customerId;
            const gameId = req.query.gameId
            let query = `
            SELECT r.*,
            jsonb_build_object('id', c.id, 'name', c.name) AS customer, 
            jsonb_build_object('id',g.id, 'name', g.name, 'categoryId', g."categoryId", 'categoryName', cat.name) AS game
            
            FROM rentals r
            JOIN games g ON r."gameId" = g.id 
            JOIN customers c ON r."customerId" = c.id
            JOIN categories cat ON g."categoryId"= cat.id`
            const limit = req.query.limit;
            const offset= req.query.offset;
            const desc = req.query.desc
            const order = req.query.order;
            const status = req.query.status;
            const startDate = req.query.startDate;

            if(status === 'open'){
                query+= ` WHERE r."returnDate" IS NULL AND r."delayFee" IS NULL`
            }

            if(status === 'closed'){
                query+= ` WHERE r."returnDate" IS NOT NULL AND r."delayFee" IS NOT NULL`
            }

            if(startDate){
                query+= ` WHERE r."rentDate" >= '${startDate}'`
            }

            if(limit){
                query+= ` LIMIT ${limit}` 
            }

            if(offset){
                query+= ` OFFSET ${offset}`
            }

            if(order){
                query+=` ORDER BY ${order}`
                if(desc==='true'){
                    query+=` DESC`
                }
            }

            if(customerId !== undefined && gameId !== undefined){
                const search = await connection.query(`
            SELECT r.*,
            jsonb_build_object('id', c.id, 'name', c.name) AS customer, 
            jsonb_build_object('id',g.id, 'name', g.name, 'categoryId', g."categoryId", 'categoryName', cat.name) AS game
            
            FROM rentals r
            JOIN games g ON r."gameId" = g.id 
            JOIN customers c ON r."customerId" = c.id
            JOIN categories cat ON g."categoryId"= cat.id
            WHERE r."customerId"= $1 AND r."gameId"= $2`, [customerId, gameId])
                res.send(search.rows);
                return
            }


           if(gameId!== undefined){
                const search = await connection.query(`
            SELECT r.*,
            jsonb_build_object('id', c.id, 'name', c.name) AS customer, 
            jsonb_build_object('id',g.id, 'name', g.name, 'categoryId', g."categoryId", 'categoryName', cat.name) AS game
            
            FROM rentals r
            JOIN games g ON r."gameId" = g.id 
            JOIN customers c ON r."customerId" = c.id
            JOIN categories cat ON g."categoryId"= cat.id
            WHERE r."gameId"= $1`, [gameId])
                res.send(search.rows);
                return
            }
            
           if(customerId !== undefined){
                const search = await connection.query(`
            SELECT r.*,
            jsonb_build_object('id', c.id, 'name', c.name) AS customer, 
            jsonb_build_object('id',g.id, 'name', g.name, 'categoryId', g."categoryId", 'categoryName', cat.name) AS game
            
            FROM rentals r
            JOIN games g ON r."gameId" = g.id 
            JOIN customers c ON r."customerId" = c.id
            JOIN categories cat ON g."categoryId"= cat.id
            WHERE r."customerId"= $1`, [customerId])
                res.send(search.rows);
                return
            }

            const rentals = await connection.query(query)
            res.send(rentals.rows);    
    }catch(err){
        console.error(err)
        res.sendStatus(500)
    }
}

export async function returnRent (req, res){
    try{
        const id = res.locals.id
        const retDate = dayjs(Date.now()).format('YYYY-MM-DD');
        const checkRent = await connection.query(`
        SELECT "rentDate", "gameId", "daysRented" FROM rentals WHERE id = $1
        `, [id])
        const diff = (dayjs().diff(checkRent.rows[0].rentDate, 'day')) - checkRent.rows[0].daysRented;
        const price = await connection.query(`
        SELECT "pricePerDay" 
        FROM games 
        WHERE id = ${checkRent.rows[0].gameId}`)
        
        
        let fee = diff* price.rows[0].pricePerDay
        if (diff <= 0){
            fee = 0
        }
       
        await connection.query(`
        UPDATE 
        rentals 
        SET 
        "returnDate" = '${retDate}',
        "delayFee" = ${fee}
        WHERE
        id = $1
        `, [id])

        res.sendStatus(200)
    }catch(err){
        console.error(err)
        res.sendStatus(500)
    }
}

export async function deleteRent (req,res){
    try{
        
        const id = res.locals.id;

        await connection.query(`
        DELETE FROM rentals WHERE id = $1
        `, [id])

        res.sendStatus(200)
    }catch(err){
        console.error(err)
        res.sendStatus(500)
    }

}

export async function getRevenue(req, res){
    try{
        let query =` 
        SELECT SUM ("originalPrice") + SUM("delayFee") AS revenue,
        COUNT(*) AS rentals,
        (SUM("originalPrice") + SUM("delayFee"))/COUNT(*) AS average
        FROM rentals
        `
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        
        if(startDate !== undefined && endDate !== undefined){
            query+= ` WHERE "rentDate" >= '${startDate}' AND "returnDate" <= '${endDate}'`
        }

        if(startDate !==undefined && endDate === undefined){
            query+= ` WHERE "rentDate" >= '${startDate}'`
        }

        if(endDate !== undefined && startDate === undefined){
            query+= ` WHERE "returnDate" <= '${endDate}'`
        }

        const metrics = await connection.query(query)

        res.status(200).send(metrics.rows[0])
    }catch(err){
        console.error(err)
        res.sendStatus(500)
    }
}