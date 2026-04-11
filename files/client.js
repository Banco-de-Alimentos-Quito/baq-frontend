// nuvei/client.js
// Wrapper para todas las llamadas al API de Nuvei.
// Genera el Auth-Token fresco en cada request.

const fetch = require('node-fetch');
const { buildAuthToken } = require('./auth');

const CARDS_URL  = process.env.NUVEI_CARDS_BASE_URL; // ccapi-stg o ccapi
const OTHER_URL  = process.env.NUVEI_OTHER_BASE_URL; // noccapi-stg o noccapi
const APP_CODE   = process.env.NUVEI_APP_CODE_SERVER;
const APP_KEY    = process.env.NUVEI_APP_KEY_SERVER;
const LTP_CODE   = process.env.NUVEI_LTP_CODE_SERVER;
const LTP_KEY    = process.env.NUVEI_LTP_KEY_SERVER;

// ── Helper interno ──────────────────────────────────────────────────────────

async function nuveiPost(baseUrl, path, body, appCode, appKey) {
  const token = buildAuthToken(appCode, appKey);

  const res = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Auth-Token': token,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok || data.error) {
    const msg = data.error?.description || data.error?.type || 'Error Nuvei';
    throw new Error(msg);
  }

  return data;
}

async function nuveiGet(baseUrl, path, appCode, appKey) {
  const token = buildAuthToken(appCode, appKey);

  const res = await fetch(`${baseUrl}${path}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Auth-Token': token,
    },
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error?.description || 'Error Nuvei');
  }

  return data;
}

// ── CHECKOUT — Init Reference ───────────────────────────────────────────────
// Llamar antes de abrir el modal de pago.
// Devuelve el transaction.id que el frontend pasa a paymentCheckout.open()

async function initReference({ userId, userEmail, amount, vat = 0, devReference, description }) {
  return nuveiPost(
    CARDS_URL,
    '/v2/transaction/init/',
    {
      user: {
        id: String(userId),
        email: userEmail,
      },
      order: {
        amount: parseFloat(amount.toFixed(2)),
        vat: parseFloat(vat.toFixed(2)),
        dev_reference: String(devReference),
        description,
      },
    },
    APP_CODE,
    APP_KEY
  );
}

// ── ADD CARD — Débito con token ─────────────────────────────────────────────
// Cobrar a una tarjeta previamente tokenizada (flujo recurrente / tarjeta guardada)

async function debitWithToken({ cardToken, userId, userEmail, amount, vat = 0, devReference, description }) {
  return nuveiPost(
    CARDS_URL,
    '/v2/transaction/debit/',
    {
      card: { token: cardToken },
      user: {
        id: String(userId),
        email: userEmail,
      },
      order: {
        amount: parseFloat(amount.toFixed(2)),
        vat: parseFloat(vat.toFixed(2)),
        dev_reference: String(devReference),
        description,
      },
    },
    APP_CODE,
    APP_KEY
  );
}

// ── REFUND ──────────────────────────────────────────────────────────────────
// Obligatorio bancario. Usar antes del cierre de lote.
// amount es opcional → si se omite hace refund total.

async function refundTransaction({ transactionId, amount = null }) {
  const body = { transaction: { id: transactionId } };
  if (amount !== null) {
    body.order = { amount: parseFloat(amount.toFixed(2)) };
  }
  return nuveiPost(CARDS_URL, '/v2/transaction/refund/', body, APP_CODE, APP_KEY);
}

// ── LISTAR TARJETAS del usuario ─────────────────────────────────────────────

async function getUserCards(userId) {
  return nuveiGet(CARDS_URL, `/v2/card/?uid=${encodeURIComponent(userId)}`, APP_CODE, APP_KEY);
}

// ── TRANSACTION INFO ────────────────────────────────────────────────────────
// Consultar estado de una transacción (útil si el webhook tarda)

async function getTransactionInfo(transactionId) {
  return nuveiGet(CARDS_URL, `/v2/transaction/${transactionId}/`, APP_CODE, APP_KEY);
}

// ── LINK TO PAY ─────────────────────────────────────────────────────────────
// Genera una URL de pago para enviar por email/WhatsApp

async function createLinkToPay({ userId, userEmail, amount, vat = 0, devReference, description, expirationDays = 2 }) {
  return nuveiPost(
    OTHER_URL,
    '/v2/link/',
    {
      user: {
        id: String(userId),
        email: userEmail,
      },
      order: {
        amount: parseFloat(amount.toFixed(2)),
        vat: parseFloat(vat.toFixed(2)),
        dev_reference: String(devReference),
        description,
        expiration_days: expirationDays,
      },
    },
    LTP_CODE,
    LTP_KEY
  );
}

module.exports = {
  initReference,
  debitWithToken,
  refundTransaction,
  getUserCards,
  getTransactionInfo,
  createLinkToPay,
};
