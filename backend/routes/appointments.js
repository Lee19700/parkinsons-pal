module.exports = function(app, db, authenticateToken) {
  app.get('/api/appointments', authenticateToken, async (req, res) => {
    try {
      const appointments = await db.all('SELECT * FROM appointments WHERE user_id = $1 ORDER BY timestamp ASC', [req.user.id]);
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch appointments' });
    }
  });

  app.post('/api/appointments', authenticateToken, async (req, res) => {
    try {
      const { title, timestamp, location, notes } = req.body;
      const result = await db.run('INSERT INTO appointments (user_id, title, timestamp, location, notes) VALUES ($1,$2,$3,$4,$5)', [
        req.user.id, title, timestamp, location, notes
      ]);
      res.json({ ok: true, id: result.lastInsertRowid });
    } catch (error) {
      res.status(500).json({ error: 'Failed to add appointment' });
    }
  });

  app.put('/api/appointments/:id', authenticateToken, async (req, res) => {
    try {
      const { title, timestamp, location, notes } = req.body;
      await db.get('UPDATE appointments SET title = $1, timestamp = $2, location = $3, notes = $4 WHERE id = $5 AND user_id = $6', [
        title, timestamp, location, notes, req.params.id, req.user.id
      ]);
      res.json({ ok: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update appointment' });
    }
  });

  app.delete('/api/appointments/:id', authenticateToken, async (req, res) => {
    try {
      await db.get('DELETE FROM appointments WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
      res.json({ ok: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete appointment' });
    }
  });
};
