module.exports = function(app, db, authenticateToken) {
  app.get('/api/symptoms', authenticateToken, async (req, res) => {
    try {
      const symptoms = await db.all('SELECT * FROM symptoms WHERE user_id = $1 ORDER BY timestamp DESC LIMIT 100', [req.user.id]);
      res.json(symptoms);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch symptoms' });
    }
  });

  app.post('/api/symptoms', authenticateToken, async (req, res) => {
    try {
      const { tremor, bradykinesia, rigidity, gait, dyskinesia, sleep, mood, cognition, notes, timestamp } = req.body;
      const result = await db.run(
        'INSERT INTO symptoms (user_id, tremor, bradykinesia, rigidity, gait, dyskinesia, sleep, mood, cognition, notes, timestamp) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)',
        [req.user.id, tremor, bradykinesia, rigidity, gait, dyskinesia, sleep, mood, cognition, notes, timestamp || new Date().toISOString()]
      );
      res.json({ ok: true, id: result.lastInsertRowid });
    } catch (error) {
      res.status(500).json({ error: 'Failed to add symptom' });
    }
  });

  app.delete('/api/symptoms/:id', authenticateToken, async (req, res) => {
    try {
      await db.get('DELETE FROM symptoms WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
      res.json({ ok: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete symptom' });
    }
  });
};
