import connection from '../database/database.js';
import dayjs from 'dayjs'

export async function validateRent(req, res, next){
        
    try{
        const rental = req.body;    
        const game = await connection.query(`SELECT "pricePerDay", "stockTotal" FROM games WHERE id = ${rental.gameId}`)
        if(game.rowCount ===0){
            res.status(400).send("game n existe")
            return
        }

        const existingCustomer = await connection.query(`
        SELECT id FROM customers WHERE id = ${rental.customerId}
        `)
        if(existingCustomer.rowCount ===0){
            res.status(400).send("cliente n existe")
            return
        }

        if(rental.daysRented <=0){
            res.status(400).send("dias alugados deve ser maior que 0")
            return
        }

        const available = await connection.query(`
        SELECT * FROM rentals WHERE "gameId" = ${rental.gameId} AND "returnDate" = null`)
        if(available.rowCount === game.rows[0].stockTotal){
            res.status(400).send("jogo não disponível para aluguel")
            return
        }

        rental.rentDate = dayjs(Date.now()).format('YYYY-MM-DD');
        rental.originalPrice = game.rows[0].pricePerDay * rental.daysRented;
        rental.returnDate = null;
        rental.delayFee = null;
        
        res.locals.rental= rental
        next()
    }catch(err){
        console.error(err);
        res.sendStatus(500);  
    }
}

export async function validateReturn(req, res, next){
    try{
    const id = req.params.id;

        const existingRental = await connection.query(`
        SELECT * FROM rentals WHERE id = ${id}
        `)
        if(existingRental.rowCount ===0){
            res.status(404).send("Aluguel n existe")
            return
        }

        if(existingRental.rows[0].returnDate !== null && existingRental.rows[0].delayFee !== null){
            res.status(400).send("Aluguel já finalizado")
        }
    res.locals.id = id
    next()
    }catch(err){
        console.error(err);
        res.sendStatus(500); 
    }
}

export async function validateDeleteRent(req, res, next){
    try{
    const id =req.params.id
        const existingRental = await connection.query(`
        SELECT * FROM rentals WHERE id = ${id}
        `)
        if(existingRental.rowCount ===0){
            res.status(404).send("Aluguel n existe")
            return
        }

        if(existingRental.rows[0].returnDate === null && existingRental.rows[0].delayFee === null){
            res.status(400).send("Aluguel ainda não finalizado")
            return
        }

        res.locals.id = id
        next()
    }catch(err){
        console.error(err);
        res.sendStatus(500);  
    }    
}