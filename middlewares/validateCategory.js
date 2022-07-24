import connection from '../database/database.js';
import categoriesSchema from '../schemas/categoriesSchema.js'

async function validateCategory (req, res, next){
    
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

    res.locals.name = name;

    next()
}

export default validateCategory