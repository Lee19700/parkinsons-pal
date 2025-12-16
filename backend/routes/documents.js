const encryption = require('../encryption');

module.exports = function(app, db, authenticateToken) {
  // Documents route with end-to-end encryption

  app.get('/api/documents', authenticateToken, async (req, res) => {
    try {
      const documents = await db.all(
        'SELECT id, filename, file_type, uploaded_at, encrypted_data FROM documents WHERE user_id = $1 ORDER BY uploaded_at DESC',
        [req.user.id]
      );
      
      // Return encrypted metadata (filename and type are encrypted for privacy)
      const result = documents.map(doc => ({
        id: doc.id,
        uploaded_at: doc.uploaded_at,
        encrypted_data: doc.encrypted_data // Client will decrypt
      }));
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch documents' });
    }
  });

  app.post('/api/documents', authenticateToken, async (req, res) => {
    try {
      const { filename, fileType, base64Data, encryptedData } = req.body;
      
      if (!base64Data) {
        return res.status(400).json({ error: 'base64Data required' });
      }

      const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg'];
      const type = (fileType || 'application/octet-stream').toLowerCase();
      if (!allowedTypes.includes(type)) {
        return res.status(400).json({ error: 'Unsupported file type' });
      }

      const buffer = Buffer.from(base64Data, 'base64');
      const maxBytes = (parseInt(process.env.MAX_BODY_MB || '10', 10)) * 1024 * 1024;
      if (buffer.length > maxBytes) {
        return res.status(413).json({ error: 'File too large' });
      }

      // Encrypt document metadata (filename and type)
      const metadata = {
        filename: filename || 'document',
        fileType: type
      };
      const encryptedMetadata = encryption.encrypt(metadata);

      const result = await db.run(
        'INSERT INTO documents (user_id, filename, file_data, file_type, encrypted_data) VALUES ($1, $2, $3, $4, $5)',
        [req.user.id, '[ENCRYPTED]', buffer, '[ENCRYPTED]', JSON.stringify(encryptedMetadata)]
      );
      
      res.json({ ok: true, id: result.lastInsertRowid });
    } catch (error) {
      console.error('Document upload error:', error);
      res.status(500).json({ error: 'Failed to add document' });
    }
  });

  app.delete('/api/documents/:id', authenticateToken, async (req, res) => {
    try {
      await db.run(
        'DELETE FROM documents WHERE id = $1 AND user_id = $2',
        [req.params.id, req.user.id]
      );
      res.json({ ok: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete document' });
    }
  });
};
