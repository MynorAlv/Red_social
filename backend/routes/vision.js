const express = require('express');
const router = express.Router();
const visionClient = require('../config/visionClient');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

// Analiza una imagen y devuelve etiquetas detectadas
router.post('/analyze', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No se subió ninguna imagen.' });

    const [result] = await visionClient.labelDetection(req.file.buffer);
    const labels = result.labelAnnotations.map(label => ({
      description: label.description,
      score: (label.score * 100).toFixed(2) + '%'
    }));

    res.json({ success: true, labels });
  } catch (err) {
    console.error('Error analizando imagen:', err);
    res.status(500).json({ success: false, error: 'Error analizando imagen.' });
  }
});

module.exports = router;
