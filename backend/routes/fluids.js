module.exports = function(app, db, authenticateToken) {
  app.get('/api/fluids', authenticateToken, async (req, res) => {
    try {
      const fluids = await db.all('SELECT * FROM fluids WHERE user_id = $1 ORDER BY timestamp DESC', [req.user.id]);
      res.json(fluids);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch fluids' });
    }
  });

  app.post('/api/fluids', authenticateToken, async (req, res) => {
    try {
      const { type, amount, timestamp, notes } = req.body;
      const result = await db.run('INSERT INTO fluids (user_id, type, amount, timestamp, notes) VALUES ($1,$2,$3,$4,$5)', [
        req.user.id, type, amount, timestamp || new Date().toISOString(), notes
      ]);
      res.json({ ok: true, id: result.lastInsertRowid });
    } catch (error) {
      res.status(500).json({ error: 'Failed to add fluid' });
    }
  });

  app.delete('/api/fluids/:id', authenticateToken, async (req, res) => {
    try {
      await db.run('DELETE FROM fluids WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
      res.json({ ok: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete fluid' });
    }
  });
};
