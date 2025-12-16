module.exports = function(app, db, authenticateToken) {
  app.get('/api/foods', authenticateToken, async (req, res) => {
    try {
      const foods = await db.all('SELECT * FROM foods WHERE user_id = $1 ORDER BY timestamp DESC', [req.user.id]);
      res.json(foods);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch foods' });
    }
  });

  app.post('/api/foods', authenticateToken, async (req, res) => {
    try {
      const { meal_type, food_items, protein, notes, timestamp } = req.body;
      const result = await db.run('INSERT INTO foods (user_id, meal_type, food_items, protein, notes, timestamp) VALUES ($1,$2,$3,$4,$5,$6)', [
        req.user.id, meal_type, food_items, protein, notes, timestamp || new Date().toISOString()
      ]);
      res.json({ ok: true, id: result.lastInsertRowid });
    } catch (error) {
      res.status(500).json({ error: 'Failed to add food' });
    }
  });

  app.delete('/api/foods/:id', authenticateToken, async (req, res) => {
    try {
      await db.get('DELETE FROM foods WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
      res.json({ ok: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete food' });
    }
  });
};
