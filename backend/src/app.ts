
// Importar rutas de novedades (agregar esto con las otras importaciones de rutas)
import novedadRoutes from './routes/novedades/novedad.routes';

// Usar rutas (agregar esto con los otros app.use)
app.use('/api/novedades', novedadRoutes);
