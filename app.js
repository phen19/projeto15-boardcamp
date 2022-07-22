import express from 'express';
import connection from './database.js';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());


app.get('/categories', (req, res) => {
    console.log(connection)
    connection.query('SELECT * FROM categories;').then(produtos => {
      res.send(produtos.rows);
    });
  });



app.listen(4000, () => {
    console.log('Server listening on port 4000.');
});
  