# Nuvei Ecuador — Integración botón de pago

## Estructura del proyecto

```
nuvei-integration/
├── backend/
│   ├── .env.staging          ← credenciales staging (del PDF)
│   ├── package.json
│   ├── server.js             ← servidor Express con todos los endpoints
│   └── nuvei/
│       ├── auth.js           ← generador de Auth-Token
│       ├── client.js         ← wrapper para el API de Nuvei
│       └── email.js          ← email de confirmación (obligatorio bancario)
└── frontend/
    └── index.html            ← botón de pago + modal de Nuvei
```

---

## Cómo correr en local (staging)

### 1. Instalar dependencias

```bash
cd backend
npm install
```

### 2. Exponer el webhook con ngrok

El webhook necesita una URL pública — Nuvei no puede alcanzar tu localhost.

```bash
# En otra terminal:
ngrok http 3000
# Copia la URL https que aparece, ej: https://abc123.ngrok.io
```

Luego edita `backend/.env.staging`:
```
NUVEI_WEBHOOK_URL=https://abc123.ngrok.io/webhook/nuvei
```

### 3. Correr el backend

```bash
cd backend
npm run dev
# Servidor en http://localhost:3000
```

### 4. Abrir el frontend

Abre `frontend/index.html` en tu navegador.
O usa Live Server de VS Code (puerto 5500).

---

## Probar el flujo completo

1. Abre `frontend/index.html`
2. Haz clic en **"Pagar con tarjeta"**
3. Se abre el modal de Nuvei
4. Ingresa la tarjeta exitosa: **4111111111111111** | CVV: 634 | Exp: 01/28
5. El backend recibe el webhook y loguea la confirmación
6. El frontend hace polling y muestra "✓ Pago confirmado"

Para probar rechazo: usa la tarjeta **4242424242424242**

---

## Endpoints del backend

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/payments/init` | Genera referencia para abrir el modal |
| POST | `/webhook/nuvei` | Recibe notificaciones de Nuvei (fuente de verdad) |
| POST | `/api/payments/refund` | Devuelve un pago (obligatorio bancario) |
| GET  | `/api/payments/status/:ref` | Estado de una orden |
| POST | `/api/payments/link` | Genera Link to Pay |

---

## Pasar a producción

1. Cambiar en `server.js`:
   ```js
   require('dotenv').config({ path: '.env.production' });
   ```

2. En `.env.production` usar las credenciales del Excel cifrado de Nuvei:
   ```
   NUVEI_ENV=prod
   NUVEI_APP_CODE_CLIENT=BANCOALIMENTOS-EC-CLIENT
   NUVEI_APP_KEY_CLIENT=... (del Excel)
   NUVEI_APP_CODE_SERVER=BANCOALIMENTOS-EC-SERVER
   NUVEI_APP_KEY_SERVER=... (del Excel)
   NUVEI_CARDS_BASE_URL=https://ccapi.paymentez.com
   NUVEI_OTHER_BASE_URL=https://noccapi.paymentez.com
   ```

3. En `frontend/index.html` cambiar:
   ```js
   nuveiEnv:        'prod',
   nuveiClientCode: 'BANCOALIMENTOS-EC-CLIENT',
   ```

4. Confirmar con Nuvei la URL de webhook antes de activar.

---

## Notas importantes

- **El webhook es la fuente de verdad** — nunca marques una orden como pagada
  solo por el `onResponse` del frontend.
- **`dev_reference`** es tu puente entre Nuvei y tu sistema — ponlo en cada request.
- **Auth-Token expira en 15 segundos** — se genera automáticamente en cada llamada.
- **Email de confirmación es obligatorio bancario** — configura SMTP antes de producción.
- **Refund es obligatorio bancario** — debe estar implementado antes de ir a producción.
