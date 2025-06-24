import 'dotenv/config'; // Load environment variables from .env file
import express from 'express';
import routes from './routes/routes';

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use((req, res, next) => {
  const allowedOrigin = process.env.CORS_ALLOWED_ORIGIN;
  
  if (!allowedOrigin) {
    console.error('❌ CORS_ALLOWED_ORIGIN no está configurada');
    return res.status(500).json({ error: 'CORS no configurado' });
  }
  
  res.header('Access-Control-Allow-Origin', allowedOrigin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Rutas
app.use('/api', routes);

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  
  // Log configuration for debugging
  console.log('Environment variables loaded:', {
    PORT: PORT,
    MONDAY_API_TOKEN_SET: process.env.MONDAY_API_TOKEN ? 'Yes' : 'No'
  });
});
