import express from 'express';
import connection from './database.js';
import cors from 'cors';
import joi from 'joi';

const app = express();
app.use(express.json());
app.use(cors());

const categoriesSchema = joi.object( {name: joi.string().required()})


app.get('/categories', async (req, res) => {
   try{
    console.log(connection)
    const categories = await connection.query('SELECT * FROM categories;')
    
    res.send(categories.rows);

   } catch (err){
    console.error(err);
    res.sendStatus(500);
   }
    
  });


app.post('/categories', async (req, res) => {
    try{
    
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


app.listen(4000, () => {
    console.log('Server listening on port 4000.');
});
  