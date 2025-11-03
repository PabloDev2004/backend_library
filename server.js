const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// --- CORRECCIÓN: Habilitar CORS ---
// Esto permite que tu frontend (ej. en localhost:4200) se comunique con este backend.
const corsOptions = {
    origin: 'http://localhost:4200',
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
// --- FIN DE LA CORRECCIÓN ---

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Conectado a MongoDB Atlas exitosamente');
  })
  .catch((error) => {
    console.error('❌ Error conectando a MongoDB:', error);
  });

app.get('/', (req, res) => {
  res.json({ message: 'Servidor de la Biblioteca funcionando' });
});

// Rutas de la aplicación
const libroRoutes = require('./routes/libro.route');
app.use('/api/libros', libroRoutes);

const usuarioRoutes = require('./routes/usuario.route');
app.use('/api/usuarios', usuarioRoutes);

const prestamoRoutes = require('./routes/prestamo.route');
app.use('/api/prestamos', prestamoRoutes);

const authRoutes = require('./routes/auth.route');
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log('🌐 CORS habilitado para: http://localhost:4200');
});