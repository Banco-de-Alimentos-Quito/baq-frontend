import { Router } from 'express';
import { helloService } from '../service/service';

const router = Router();

// Ruta para "Hola mundo"
router.get('/hello', helloService.getHelloWorld);

// Ruta para el webhook de PayPal
router.post('/paypal-webhook', helloService.handlePayPalWebhook);

// Ruta para fetch y log de ngrok URL
router.post('/fetch-ngrok', );

export default router;
