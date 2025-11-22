import * as express from 'express';

const router = express.Router();

// Rutas para reportes de novedades (placeholder)
router.get('/', (req, res) => {
  res.json({ 
    success: true, 
    data: [], 
    message: 'Endpoint de reportes de novedad - En desarrollo' 
  });
});

export default router;
