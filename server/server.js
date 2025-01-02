const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

// Ubicación del archivo JSON:
const BIRTHDAYS_FILE = path.join(__dirname, 'birthdays.json');

// Leer el contenido de birthdays.json
function getBirthdays() {
  const data = fs.readFileSync(BIRTHDAYS_FILE, 'utf8');
  return JSON.parse(data);
}

// Guardar en birthdays.json
function saveBirthdays(birthdays) {
  fs.writeFileSync(BIRTHDAYS_FILE, JSON.stringify(birthdays, null, 2), 'utf8');
}

// =============================================
// RUTAS
// =============================================

// GET: obtener todos los cumpleaños
app.get('/api/birthdays', (req, res) => {
  try {
    const birthdays = getBirthdays();
    res.json(birthdays);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error reading birthdays file' });
  }
});

// POST: crear un nuevo cumpleaños
app.post('/api/birthdays', (req, res) => {
  try {
    const newBirthday = req.body; // { name, birthday, ... }
    const birthdays = getBirthdays();

    // Generar un ID autoincremental sencillo
    const nextId = birthdays.length > 0
      ? Math.max(...birthdays.map(b => b.id ?? 0)) + 1
      : 1;
    newBirthday.id = nextId;

    birthdays.push(newBirthday);
    saveBirthdays(birthdays);

    return res.status(201).json(newBirthday);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error writing birthdays file' });
  }
});

// DELETE: borrar un cumpleaños por ID
app.delete('/api/birthdays/:id', (req, res) => {
  try {
    const idToDelete = parseInt(req.params.id, 10);
    let birthdays = getBirthdays();

    const initialLength = birthdays.length;
    birthdays = birthdays.filter(b => b.id !== idToDelete);

    if (birthdays.length === initialLength) {
      return res.status(404).json({ error: 'Birthday not found' });
    }

    saveBirthdays(birthdays);
    return res.json({ message: 'Birthday deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating birthdays file' });
  }
});

// PUT (o PATCH): actualizar un cumpleaños existente por ID
app.put('/api/birthdays/:id', (req, res) => {
  try {
    const idToUpdate = parseInt(req.params.id, 10);
    const updatedData = req.body; // { name?: string, birthday?: string, ... }

    let birthdays = getBirthdays();
    const index = birthdays.findIndex(b => b.id === idToUpdate);
    if (index === -1) {
      return res.status(404).json({ error: 'Birthday not found' });
    }

    birthdays[index] = { ...birthdays[index], ...updatedData };
    saveBirthdays(birthdays);

    return res.json(birthdays[index]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating birthdays file' });
  }
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
