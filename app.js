import express from 'express';
import connection from './database.js';
import cors from 'cors';
import joi from 'joi';
import dayjs from 'dayjs';

const app = express();
app.use(express.json());
app.use(cors());




app.get('/categories', async (req, res) => {
   try{
    let query = 'SELECT * FROM categories'
    const limit = req.query.limit;
    const offset= req.query.offset;
    const desc = req.query.desc
    const order = req.query.order;
    console.log(query)
    if(limit){
        query += ` LIMIT ${limit}`
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
    console.log(query)
    const categories = await connection.query(query)
    
    res.send(categories.rows);

   } catch (err){
    console.error(err);
    res.sendStatus(500);
   }
    
  });


app.post('/categories', async (req, res) => {
    try{
    const categoriesSchema = joi.object( {name: joi.string().required()})
    const name = req.body;
    const validation = categoriesSchema.validate(name,{abortEarly: false});
    if(validation.error){
        console.log(validation.error)
        res.status(400).send(validation.error.details.map(item => item.message))
        return
    }

    const existingName = await connection.query('SELECT * FROM categories WHERE name = $1', [name.name])
        console.log(existingName)
        if (existingName.rowCount !== 0) {
            return res.sendStatus(409);
          }

    await connection.query('INSERT INTO categories (name) VALUES ($1)', [name.name])

    res.sendStatus(201)
    } catch (err){
    console.error(err);
    res.sendStatus(500);
   }


})


app.post('/games', async(req, res) => {
    try{
    const gamesSchema = joi.object({
        name: joi.string().required(),
        image: joi.string().required(),
        stockTotal: joi.number().min(1).required(),
        categoryId: joi.number().required(),
        pricePerDay: joi.number().min(1).required()
    })

    const game = req.body
    const validation = gamesSchema.validate(game,{abortEarly: false});
    if(validation.error){
        console.log(validation.error)
        res.status(400).send(validation.error.details.map(item => item.message))
        return
    }

    const existingGame = await connection.query('SELECT * FROM games WHERE name = $1', [game.name])
        console.log(existingGame)
        if (existingGame.rowCount !== 0) {
            return res.sendStatus(409);
          }
    
    await connection.query(`
    INSERT INTO games (name, image, "stockTotal", "categoryId", "pricePerDay") 
    VALUES ($1, $2, $3, $4, $5)`, [game.name, game.image, game.stockTotal, game.categoryId, game.pricePerDay])

    res.sendStatus(201)
    
    }catch (err){
        console.error(err);
        res.sendStatus(500);
    }


})

app.get('/games', async (req, res) => {
    try{
            const name = req.query.name;
            let query = 'SELECT g.*, c.name AS "categoryName" FROM games g JOIN categories c ON g."categoryId" = c.id'
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

            console.log(name)
            if(name !== undefined){
                const search = await connection.query(`SELECT g.*, c.name AS "categoryName" FROM games g JOIN categories c ON g."categoryId" = c.id WHERE LOWER (g.name) LIKE $1`, [`${name.toLocaleLowerCase()}%`])
                res.send(search.rows);
                return
            }
            console.log(connection)
            const games = await connection.query(query)
            
            res.send(games.rows);    
    } catch (err){
     console.error(err);
     res.sendStatus(500);
    }
});

app.post('/customers', async(req, res) => {
    try{
    const customersSchema = joi.object({
        name: joi.string().required(),
        phone: joi.string().pattern(/[0-9]/).min(10).max(11).required(),
        cpf: joi.string().pattern(/[0-9]/).min(11).max(11).required(),
        birthday: joi.date().required()
    })

    const customer = req.body
    const validation = customersSchema.validate(customer,{abortEarly: false});
    if(validation.error){
        console.log(validation.error)
        res.status(400).send(validation.error.details.map(item => item.message))
        return
    }

    const existingCustomer = await connection.query('SELECT * FROM customers WHERE name = $1', [customer.name])
        console.log(existingCustomer)
        if (existingCustomer.rowCount !== 0) {
            return res.sendStatus(409);
          }
    
    await connection.query(`
    INSERT INTO customers (name, phone, cpf, birthday) 
    VALUES ($1, $2, $3, $4)`, [customer.name, customer.phone, customer.cpf, customer.birthday])

    res.sendStatus(201)
    
    }catch (err){
        console.error(err);
        res.sendStatus(500);
    }


})

app.get('/customers', async (req, res) => {
    try{
            const cpf = req.query.cpf;
            console.log(cpf)
            let query = `SELECT * FROM customers`
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
                if(desc==='true'){
                    query+=` DESC`
                }
            }

            if(cpf !== undefined){
                const search = await connection.query(`SELECT * FROM customers WHERE cpf LIKE $1`, [`${cpf}%`])
                res.send(search.rows);
                return
            }
            console.log(connection)
            const games = await connection.query(query)
            
            res.send(games.rows);    
    } catch (err){
     console.error(err);
     res.sendStatus(500);
    }
});

app.get('/customers/:id', async (req, res) => {
    
    try{
        
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.sendStatus(400);
        }
        const search = await connection.query('SELECT * FROM customers WHERE id = $1;', [id])
        console.log(search)
        if (search.rowCount == 0) {
            return res.sendStatus(404);
        }
        
        res.send(search.rows[0])
    }catch(err){
        console.error(err);
        res.sendStatus(500);
    }
  
});

app.put('/customers/:id', async (req, res) => {
    try{
        const customersSchema = joi.object({
            name: joi.string().required(),
            phone: joi.string().pattern(/[0-9]/).min(10).max(11).required(),
            cpf: joi.string().pattern(/[0-9]/).min(11).max(11).required(),
            birthday: joi.date().required()
        })
    
        const customer = req.body
        const validation = customersSchema.validate(customer,{abortEarly: false});
        if(validation.error){
            console.log(validation.error)
            res.status(400).send(validation.error.details.map(item => item.message))
            return
        }

        const existingCpf = await connection.query('SELECT * FROM customers WHERE cpf = $1', [customer.cpf])
        console.log(existingCpf)
        if (existingCpf.rowCount !== 0) {
            return res.sendStatus(409);
          }

        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.sendStatus(400);
        }

    await connection.query(`
    UPDATE 
        customers
    SET 
        name = '${customer.name}',
        phone = '${customer.phone}',
        cpf = '${customer.cpf}',
        birthday = '${customer.birthday}'
    WHERE
        id = $1
    `, [id])

    res.sendStatus(200)
    }catch (err){
        console.error(err);
        res.sendStatus(500);
    }
})


app.post('/rentals', async (req, res)=> {
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
        console.log(available.rowCount)
        if(available.rowCount === game.rows[0].stockTotal){
            res.status(400).send("jogo não disponível para aluguel")
            return
        }

        rental.rentDate = dayjs(Date.now()).format('YYYY-MM-DD');
        rental.originalPrice = game.rows[0].pricePerDay * rental.daysRented;
        rental.returnDate = null;
        rental.delayFee = null;
        console.log(rental)

        await connection.query(`
        INSERT INTO rentals ("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee")
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [rental.customerId, rental.gameId, rental.rentDate, rental.daysRented, rental.returnDate, rental.originalPrice, rental.delayFee])
        

        res.sendStatus(201)
    }catch(err){
        console.error(err);
        res.sendStatus(500);        
    }
})

app.get('/rentals', async (req, res)=> {
    try{

            const customerId = req.query.customerId;
            console.log(customerId)
            const gameId = req.query.gameId
            console.log(gameId)
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

           console.log(query)

            
            const rentals = await connection.query(query)
                    
            
            res.send(rentals.rows);    
    }catch(err){
        console.error(err)
        res.sendStatus(500)
    }
})


app.post('/rentals/:id/return', async (req, res) => {
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
        

        const retDate = dayjs(Date.now()).format('YYYY-MM-DD');
        const checkRent = await connection.query(`
        SELECT "rentDate", "gameId", "daysRented" FROM rentals WHERE id = $1
        `, [id])
        const diff = (dayjs().diff(checkRent.rows[0].rentDate, 'day')) - checkRent.rows[0].daysRented;
        const price = await connection.query(`
        SELECT "pricePerDay" 
        FROM games 
        WHERE id = ${checkRent.rows[0].gameId}`)
        
        const fee = diff* price.rows[0].pricePerDay
       
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
})


app.delete('/rentals/:id', async (req,res) => {
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

        await connection.query(`
        DELETE FROM rentals WHERE id = $1
        `, [id])

        res.sendStatus(200)
    }catch(err){
        console.error(err)
        res.sendStatus(500)
    }

})

app.listen(4000, () => {
    console.log('Server listening on port 4000.');
});
  