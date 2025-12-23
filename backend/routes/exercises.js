module.exports = function(app, db, authenticateToken) {
  app.get('/api/exercises', authenticateToken, async (req, res) => {
    try {
      const exercises = await db.all('SELECT * FROM exercises WHERE user_id = $1 ORDER BY timestamp DESC', [req.user.id]);
      res.json(exercises);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch exercises' });
    }
  });

  app.post('/api/exercises', authenticateToken, async (req, res) => {
    try {
      const { exercise_type, duration, intensity, notes, timestamp } = req.body;
      const result = await db.run('INSERT INTO exercises (user_id, exercise_type, duration, intensity, notes, timestamp) VALUES ($1,$2,$3,$4,$5,$6)', [
        req.user.id, exercise_type, duration, intensity, notes, timestamp || new Date().toISOString()
      ]);
      res.json({ ok: true, id: result.lastInsertRowid });
    } catch (error) {
      res.status(500).json({ error: 'Failed to add exercise' });
    }
  });

  app.delete('/api/exercises/:id', authenticateToken, async (req, res) => {
    try {
      await db.run('DELETE FROM exercises WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
      res.json({ ok: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete exercise' });
    }
  });
};
