// nuvei/email.js
// Envío de email de confirmación — REQUISITO BANCARIO OBLIGATORIO.
// Debe enviarse después de cada transacción aprobada.
// Configurar con tu proveedor SMTP real (Gmail, SendGrid, Mailgun, etc.)

const nodemailer = require('nodemailer');

// Cambia estas variables por las de tu proveedor de email real
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Envía el correo de confirmación requerido por el banco.
 * Debe incluir: detalle de compra, transaction_id y authorization_code.
 */
async function sendPaymentConfirmation({ toEmail, transactionId, authorizationCode, amount, description, devReference }) {
  const subject = `Confirmación de pago – ${description}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
      <h2 style="color: #333;">Pago confirmado</h2>
      <p>Gracias por tu pago. A continuación el detalle de tu transacción:</p>
      <table style="width:100%; border-collapse: collapse; margin: 16px 0;">
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 8px; color: #666;">Descripción</td>
          <td style="padding: 8px; font-weight: bold;">${description}</td>
        </tr>
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 8px; color: #666;">Monto</td>
          <td style="padding: 8px; font-weight: bold;">$${parseFloat(amount).toFixed(2)}</td>
        </tr>
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 8px; color: #666;">N.º de orden</td>
          <td style="padding: 8px;">${devReference}</td>
        </tr>
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 8px; color: #666;">Transaction ID</td>
          <td style="padding: 8px; font-family: monospace;">${transactionId}</td>
        </tr>
        <tr>
          <td style="padding: 8px; color: #666;">Código de autorización</td>
          <td style="padding: 8px; font-family: monospace; font-weight: bold;">${authorizationCode}</td>
        </tr>
      </table>
      <p style="color: #999; font-size: 12px;">Este comprobante es válido para cualquier reclamo o consulta.</p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || '"Banco de Alimentos" <no-reply@baq.ec>',
    to: toEmail,
    subject,
    html,
  });
}

module.exports = { sendPaymentConfirmation };
