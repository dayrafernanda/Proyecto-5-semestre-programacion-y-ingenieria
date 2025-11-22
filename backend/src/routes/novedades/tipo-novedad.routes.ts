import * as express from 'express';

const router = express.Router();

// Rutas para tipos de novedad (placeholder)
router.get('/', (req, res) => {
  res.json({ 
    success: true, 
    data: [], 
    message: 'Endpoint de tipos de novedad - En desarrollo' 
  });
});

export default router;
