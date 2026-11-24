import express from 'express';
import cors from 'cors';
import { pool } from './db.js';
import { jurnal } from './jurnal.js';
import statistici from './rute/statistici.js';
import jurnalRute from './rute/jurnal.js';

const app = express();

// Middleware-uri (jurnal înainte de cors pentru a înregistra și OPTIONS)
app.use((req, res, next) => {
  console.log(req.method, req.originalUrl);
  next();
});
app.use(jurnal);
app.use(cors());
app.use(express.json());

// Exercițiul 1c: Ruta temporară de ecou (pentru Fișa de laborator)
app.all('/api/ecou/:id', (req, res) => {
  res.json({ params: req.params, query: req.query, body: req.body });
});

// Exercițiul 5a: Căutare exactă după oraș (trebuie pusă înainte de rutele cu :id)
app.get('/api/destinatii/caut', async (req, res) => {
  const oras = req.query.oras ?? '';
  const [randuri] = await pool.query(
    'SELECT id, oras, tara, zile, vizitat FROM destinatii WHERE oras = ?',
    [oras]
  );
  res.json(
    randuri.map((d) => ({
      ...d,
      id: String(d.id),
      vizitat: Boolean(d.vizitat),
    }))
  );
});

// Exercițiul 1b: Lista tuturor destinațiilor
app.get('/api/destinatii', async (req, res) => {
  const [randuri] = await pool.query(
    'SELECT id, oras, tara, zile, vizitat FROM destinatii ORDER BY id'
  );
  res.json(
    randuri.map((d) => ({
      ...d,
      id: String(d.id),
      vizitat: Boolean(d.vizitat),
    }))
  );
});

// Exercițiul 2: Adăugare destinație nouă cu validare pe server
app.post('/api/destinatii', async (req, res) => {
  const { oras, tara, zile } = req.body;

  if (
    typeof oras !== 'string' || oras.trim().length < 2 ||
    typeof tara !== 'string' || tara.trim().length === 0 ||
    !Number.isInteger(zile) || zile < 1 || zile > 30
  ) {
    return res.status(400).json({ eroare: 'Date invalide.' });
  }

  const [rezultat] = await pool.query(
    'INSERT INTO destinatii (oras, tara, zile, vizitat) VALUES (?, ?, ?, ?)',
    [oras.trim(), tara.trim(), zile, false]
  );

  res.status(201).json({
    id: String(rezultat.insertId),
    oras: oras.trim(),
    tara: tara.trim(),
    zile,
    vizitat: false,
  });
});

// Exercițiul 3a: Modificare stare vizitat
app.patch('/api/destinatii/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { vizitat } = req.body;

  const [rezultat] = await pool.query(
    'UPDATE destinatii SET vizitat = ? WHERE id = ?',
    [Boolean(vizitat), id]
  );

  if (rezultat.affectedRows === 0) {
    return res.status(404).json({ eroare: 'Destinația nu există.' });
  }

  const [randuri] = await pool.query(
    'SELECT id, oras, tara, zile, vizitat FROM destinatii WHERE id = ?',
    [id]
  );

  const d = randuri[0];
  res.json({
    ...d,
    id: String(d.id),
    vizitat: Boolean(d.vizitat),
  });
});

// Montarea routerelor externe
app.use('/api/statistici', statistici);
app.use('/api/jurnal', jurnalRute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API pornit pe http://localhost:${PORT}`);
});