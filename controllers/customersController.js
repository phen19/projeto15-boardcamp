import connection from '../database/database.js';

export async function createCustomer(req, res){
    try{
    const customer = res.locals.customer
    
    await connection.query(`
    INSERT INTO customers (name, phone, cpf, birthday) 
    VALUES ($1, $2, $3, $4)`, [customer.name, customer.phone, customer.cpf, customer.birthday])

    res.sendStatus(201)
    
    }catch (err){
        console.error(err);
        res.sendStatus(500);
    }
}

export async function getCustomers (req, res){
    try{
            const cpf = req.query.cpf;
            let query = `SELECT cus.*,
            COUNT(CASE WHEN r."customerId" = cus.id THEN cus.id END) AS "rentalsCount"
            FROM rentals r, customers cus
            
            GROUP BY (cus.id)`
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
                const search = await connection.query(`SELECT cus.*,
                COUNT(CASE WHEN r."customerId" = cus.id THEN cus.id END) AS "rentalsCount"
                FROM rentals r, customers cus
                WHERE cpf LIKE $1
                GROUP BY (cus.id)`, [`${cpf}%`])
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

export async function getCustomerById (req, res){
    
    try{
        
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.sendStatus(400);
        }
        const search = await connection.query('SELECT * FROM customers WHERE id = $1;', [id])
        if (search.rowCount == 0) {
            return res.sendStatus(404);
        }
        
        res.send(search.rows[0])
    }catch(err){
        console.error(err);
        res.sendStatus(500);
    }
  
};

export async function updateCustomer (req, res){
    try{
       const customer = res.locals.customer;

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
}