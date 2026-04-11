// nuvei/auth.js
// Genera el Auth-Token que va en cada request al API de Nuvei.
// El token expira en 15 segundos — se crea fresco en cada llamada.

const crypto = require('crypto');

/**
 * Construye el Auth-Token requerido por Nuvei.
 *
 * Algoritmo:
 *   1. timestamp = unix en SEGUNDOS (no milisegundos)
 *   2. hash     = sha256(appKey + timestamp) → hex
 *   3. raw      = appCode + ";" + timestamp + ";" + hash
 *   4. token    = base64(raw)
 *
 * @param {string} appCode  - APP_CODE_SERVER de tu .env
 * @param {string} appKey   - APP_KEY_SERVER de tu .env
 * @returns {string}        - El valor completo del header Auth-Token
 */
function buildAuthToken(appCode, appKey) {
  const timestamp = Math.floor(Date.now() / 1000); // segundos, no ms
  const hash = crypto
    .createHash('sha256')
    .update(appKey + timestamp)
    .digest('hex');
  const raw = `${appCode};${timestamp};${hash}`;
  return Buffer.from(raw).toString('base64');
}

module.exports = { buildAuthToken };
