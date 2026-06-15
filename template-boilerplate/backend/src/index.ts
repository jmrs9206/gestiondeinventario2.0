import express, { Request, Response } from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Database Pool Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Test Connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error acquiring client from database pool:', err.stack);
  } else {
    console.log('Successfully connected to PostgreSQL database.');
    release();
  }
});

// API Routes

// Health check with DB status
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      status: 'OK',
      database: 'CONNECTED',
      timestamp: result.rows[0].now
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'ERROR',
      database: 'DISCONNECTED',
      error: error.message
    });
  }
});

// List items
app.get('/api/items', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM items ORDER BY id ASC');
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create item
app.post('/api/items', async (req: Request, res: Response) => {
  const { title, description, status } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO items (title, description, status) VALUES ($1, $2, $3) RETURNING *',
      [title, description || '', status || 'ACTIVE']
    );
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete item
app.delete('/api/items/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM items WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json({ message: 'Item deleted successfully', item: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// List users
app.get('/api/users', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT id, name, email, role, active, created_at FROM users');
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Start Server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
