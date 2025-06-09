import 'dotenv/config'; // Load environment variables from .env file
import express from 'express';
import routes from './routes/routes';

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
