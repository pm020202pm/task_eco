const express = require('express');
const pool = require('./db');
require('dotenv').config();
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: 'http://localhost:3000',  // Or the port where your Next.js app runs
}));
app.use(express.json());

pool.connect((err) => {
  if (err) {
    return console.error('Error connecting to the database', err.stack);
  }
  console.log('Connected to the database successfully.');
});

app.get('/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching products', error.stack);
    res.status(500).json({ error: 'An error occurred while fetching products.' });
  }
});

app.post('/products', async (req, res) => {
  const { name, description, price, quantity } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO products (name, description, price, quantity) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, description, price, quantity]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error inserting product', error.stack);
    res.status(500).json({ error: 'An error occurred while creating the product.' });
  }
});

app.put('/products/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, price, quantity } = req.body;  // Accept name, description, price, and quantity as updatable fields
  try {
    const result = await pool.query(
      'UPDATE products SET name = $1, description = $2, price = $3, quantity = $4 WHERE id = $5 RETURNING *',
      [name, description, price, quantity, id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Product not found.' });
    } else {
      res.status(200).json(result.rows[0]);
    }
  } catch (error) {
    console.error('Error updating product', error.stack);
    res.status(500).json({ error: 'An error occurred while updating the product.' });
  }
});

app.delete('/products/:id', async (req, res) => {
  const { id } = req.params;
  console.log(id)
  try {
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Product not found.' });
    } else {
      res.status(200).json({ message: 'Product deleted successfully.' });
    }
  } catch (error) {
    console.error('Error deleting product', error.stack);
    res.status(500).json({ error: 'An error occurred while deleting the product.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
