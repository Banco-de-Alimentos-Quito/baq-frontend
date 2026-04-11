// server.js
// Backend Express — integración Nuvei Ecuador
// Endpoints: init-reference, webhook, refund, link-to-pay

require('dotenv').config({ path: '.env.staging' }); // cambiar a .env.production en prod

const express = require('express');
const cors    = require('cors');
const { initReference, refundTransaction, debitWithToken, getTransactionInfo, createLinkToPay } = require('./nuvei/client');
const { sendPaymentConfirmation } = require('./nuvei/email');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middlewares ─────────────────────────────────────────────────────────────

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5500', // URL de tu frontend
}));
app.use(express.json());
app.use(express.static('../frontend')); // sirve el HTML del frontend

// ── Base de datos simulada (reemplaza con tu BD real) ───────────────────────
// En producción esto sería PostgreSQL, MySQL, MongoDB, etc.
const ordersDB = new Map();

// ── ENDPOINT 1: Init Reference ──────────────────────────────────────────────
// El frontend llama aquí cuando el usuario hace clic en "Pagar".
// Devuelve el transaction.id para abrir el modal de Nuvei.
//
// POST /api/payments/init
// Body: { userId, userEmail, amount, description, devReference }

app.post('/api/payments/init', async (req, res) => {
  const { userId, userEmail, amount, description, devReference } = req.body;

  // Validación básica
  if (!userId || !userEmail || !amount || !description || !devReference) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  try {
    const nuveiResponse = await initReference({
      userId,
      userEmail,
      amount: parseFloat(amount),
      vat: 0, // IVA incluido en el monto si aplica
      devReference: String(devReference),
      description,
    });

    // Guardar la orden pendiente en tu BD
    ordersDB.set(String(devReference), {
      devReference,
      userId,
      userEmail,
      amount,
      description,
      nuveiTransactionId: nuveiResponse.transaction?.id,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });

    // Devolver solo el reference al frontend — nunca keys ni datos sensibles
    res.json({
      reference: nuveiResponse.transaction?.id,
    });

  } catch (err) {
    console.error('[init-reference] Error:', err.message);
    res.status(500).json({ error: 'No se pudo inicializar el pago' });
  }
});


// ── ENDPOINT 2: Webhook ─────────────────────────────────────────────────────
// Nuvei hace POST aquí después de cada transacción.
// OBLIGATORIO: debes responder HTTP 200 de inmediato, procesar después.
//
// POST /webhook/nuvei

app.post('/webhook/nuvei', async (req, res) => {
  // Responder 200 PRIMERO — si tardas, Nuvei reintenta
  res.status(200).send('OK');

  const payload = req.body;
  const { transaction, order } = payload;

  if (!transaction) {
    console.warn('[webhook] Payload sin transaction:', payload);
    return;
  }

  console.log('[webhook] Recibido:', JSON.stringify({ transaction, order }, null, 2));

  // ── Validación oficial: ambos campos deben coincidir ──
  const isApproved = transaction.status === 'success' && transaction.status_detail === 3;

  // Buscar la orden por dev_reference
  const devReference = order?.dev_reference || transaction.dev_reference;
  const existingOrder = ordersDB.get(String(devReference));

  if (!existingOrder) {
    console.warn('[webhook] Orden no encontrada para dev_reference:', devReference);
    return;
  }

  if (isApproved) {
    // ── Pago aprobado ────────────────────────────────────
    ordersDB.set(String(devReference), {
      ...existingOrder,
      status: 'paid',
      nuveiTransactionId: transaction.id,
      authorizationCode: transaction.authorization_code,
      paidAt: new Date().toISOString(),
    });

    console.log(`[webhook] ✓ Orden ${devReference} marcada como PAGADA. Auth: ${transaction.authorization_code}`);

    // ── Email de confirmación (OBLIGATORIO BANCARIO) ─────
    try {
      await sendPaymentConfirmation({
        toEmail: existingOrder.userEmail,
        transactionId: transaction.id,
        authorizationCode: transaction.authorization_code,
        amount: existingOrder.amount,
        description: existingOrder.description,
        devReference,
      });
      console.log('[webhook] ✓ Email de confirmación enviado a', existingOrder.userEmail);
    } catch (emailErr) {
      // El email falló pero el pago sí fue procesado — loguear y continuar
      console.error('[webhook] ✗ Error enviando email:', emailErr.message);
    }

  } else {
    // ── Pago rechazado o pendiente ───────────────────────
    ordersDB.set(String(devReference), {
      ...existingOrder,
      status: transaction.status === 'pending' ? 'pending' : 'failed',
      statusDetail: transaction.status_detail,
      updatedAt: new Date().toISOString(),
    });

    console.log(`[webhook] ✗ Orden ${devReference} — status: ${transaction.status}, detail: ${transaction.status_detail}`);
  }
});


// ── ENDPOINT 3: Refund ──────────────────────────────────────────────────────
// OBLIGATORIO BANCARIO — debe estar implementado antes de ir a producción.
//
// POST /api/payments/refund
// Body: { transactionId, amount? }   ← amount opcional, si se omite = refund total

app.post('/api/payments/refund', async (req, res) => {
  const { transactionId, amount } = req.body;

  if (!transactionId) {
    return res.status(400).json({ error: 'transactionId requerido' });
  }

  try {
    const result = await refundTransaction({
      transactionId,
      amount: amount ? parseFloat(amount) : null,
    });

    res.json({
      success: result.status === 'success',
      detail: result.detail,
      transaction: result.transaction,
    });

  } catch (err) {
    console.error('[refund] Error:', err.message);
    res.status(500).json({ error: 'No se pudo procesar el refund' });
  }
});


// ── ENDPOINT 4: Estado de una orden (para polling desde frontend) ───────────
//
// GET /api/payments/status/:devReference

app.get('/api/payments/status/:devReference', (req, res) => {
  const order = ordersDB.get(req.params.devReference);
  if (!order) return res.status(404).json({ error: 'Orden no encontrada' });
  res.json({ status: order.status, order });
});


// ── ENDPOINT 5: Link to Pay ─────────────────────────────────────────────────
//
// POST /api/payments/link
// Body: { userId, userEmail, amount, description, devReference, expirationDays? }

app.post('/api/payments/link', async (req, res) => {
  const { userId, userEmail, amount, description, devReference, expirationDays } = req.body;

  try {
    const result = await createLinkToPay({
      userId,
      userEmail,
      amount: parseFloat(amount),
      vat: 0,
      devReference: String(devReference),
      description,
      expirationDays: expirationDays || 2,
    });

    res.json({ paymentUrl: result.transaction?.payment_url || result });

  } catch (err) {
    console.error('[link-to-pay] Error:', err.message);
    res.status(500).json({ error: 'No se pudo crear el link de pago' });
  }
});


// ── START ───────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n🚀 Servidor Nuvei corriendo en http://localhost:${PORT}`);
  console.log(`   Entorno:  ${process.env.NUVEI_ENV}`);
  console.log(`   Webhook:  POST http://localhost:${PORT}/webhook/nuvei`);
  console.log(`   Init:     POST http://localhost:${PORT}/api/payments/init\n`);
});
