import connection from '../database/database.js';

export async function getCategories (req, res){
    try{
     let query = 'SELECT * FROM categories'
     const limit = req.query.limit;
     const offset= req.query.offset;
     const desc = req.query.desc
     const order = req.query.order;
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
     const categories = await connection.query(query)
     
     res.send(categories.rows);
 
    } catch (err){
     console.error(err);
     res.sendStatus(500);
    }
     
};

export async function createCategory (req, res){
    try{
    const name = res.locals.name;

    await connection.query('INSERT INTO categories (name) VALUES ($1)', [name.name])

    res.sendStatus(201)
    } catch (err){
    console.error(err);
    res.sendStatus(500);
   }


}