import connection from '../database/database.js';
import joi from 'joi';
import customersSchema from '../schemas/customersSchema.js'

export async function validateCustomer(req,res,next){
   
    const customer = req.body
    const validation = customersSchema.validate(customer,{abortEarly: false});
    if(validation.error){
        res.status(400).send(validation.error.details.map(item => item.message))
        return
    }

    const existingCustomer = await connection.query('SELECT * FROM customers WHERE name = $1', [customer.name])
        if (existingCustomer.rowCount !== 0) {
            return res.sendStatus(409);
        }
    res.locals.customer = customer;

    next();
}

export async function validateUpdateCustomer(req, res, next){
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

    res.locals.customer= customer;
    next()
}
