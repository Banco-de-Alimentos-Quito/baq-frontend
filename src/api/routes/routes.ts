import { Router } from 'express';
import { helloService } from '../service/service';

const router = Router();

// Ruta para "Hola mundo"
router.get('/hello', helloService.getHelloWorld);

export default router;
