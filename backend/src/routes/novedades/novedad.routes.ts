import * as express from 'express';
import {
  crearNovedad,
  obtenerNovedades,
  obtenerNovedadPorId,
  actualizarEstadoNovedad,
  obtenerEstadisticas
} from '../../controllers/novedades/novedad.controller';

const auth = (req: any, res: any, next: any) => {
  req.user = { _id: 'temp-user-id', role: 'admin' };
  next();
};

const router = express.Router();

router.use(auth);

router.post('/', crearNovedad);
router.get('/', obtenerNovedades);
router.get('/estadisticas', obtenerEstadisticas);
router.get('/:id', obtenerNovedadPorId);
router.patch('/:id/estado', actualizarEstadoNovedad);

export default router;
