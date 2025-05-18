import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { sendPaymentVoucher } from '../utils/sendmail';
import type { PayPalWebhookData } from '../types/paypal';

export const helloService = {
 
  
  handlePayPalWebhook: async (req: Request, res: Response) => {
    try {
      // Recibir la notificación de PayPal
      const webhookData = req.body as PayPalWebhookData;
      
      // Loguear los datos recibidos para depuración
      console.log('PayPal Webhook recibido:', JSON.stringify(webhookData, null, 2));
      
      // Procesar según el evento recibido
      const eventType = webhookData.event_type || webhookData.event_name;
      console.log('Tipo de evento PayPal:', eventType);
      
      // Guardar los datos en response.json
      const responsePath = path.join(__dirname, '../responses/response.json');
      
      // Leer el archivo existente
      let existingData = [];
      try {
        const fileContent = fs.readFileSync(responsePath, 'utf8');
        existingData = JSON.parse(fileContent);
      } catch {
        console.log('El archivo no existe o está vacío, se creará uno nuevo');
      }
      
      // Añadir la nueva respuesta con timestamp
      existingData.push({
        timestamp: new Date().toISOString(),
        data: webhookData
      });
      
      // Escribir los datos actualizados al archivo
      fs.writeFileSync(responsePath, JSON.stringify(existingData, null, 2), 'utf8');
      console.log('Datos guardados en response.json');
      
      // Enviar el voucher de pago por email
      if (eventType === 'PAYMENT.CAPTURE.COMPLETED' || 
          eventType === 'CHECKOUT.ORDER.APPROVED' ||
          eventType === 'PAYMENT.SALE.COMPLETED') {
        try {
          const emailSent = await sendPaymentVoucher(webhookData);
          if (emailSent) {
            console.log('Voucher de pago enviado con éxito');
          } else {
            console.error('Error al enviar el voucher de pago');
          }
        } catch (emailError) {
          console.error('Error en el envío del email:', emailError);
        }
      }
      
      // Responder a PayPal con éxito
      res.status(200).json({ status: 'success' });
    } catch (error) {
      console.error('Error procesando webhook de PayPal:', error);
      res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
  }
};
