import { Router } from 'express';
import { helloService } from '../service/service';

const router = Router();



// Ruta para el webhook de PayPal
router.post('/paypal-webhook', helloService.handlePayPalWebhook);

// Ruta para fetch y log de ngrok URL
router.get('/hello', helloService.hello);
export default router;
