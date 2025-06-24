import { Router } from 'express';
import { paypalService } from '../service/service';
import { donacionMensualService } from '../service/donacionMensualService';

const router = Router();



// Ruta para el webhook de PayPal
router.post('/paypal-webhook', paypalService.handlePayPalWebhook);

// Ruta para donaciones mensuales
router.post('/donacion-mensual', donacionMensualService.handleDonacionMensual);

//router.post('/DeUna-webhook', deUnaService.handleDeUnaWebhook);  lo haremos cuando tengamos el webhook de DeUna
// Ruta para fetch y log de ngrok URL
router.get('/hello', paypalService.hello);
export default router;
