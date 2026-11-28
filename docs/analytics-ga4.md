# Embudos de donación en GA4

La etiqueta usa `NEXT_PUBLIC_GA_MEASUREMENT_ID` y, si no está definida, `G-XJNTP3SK76` en `src/app/layout.tsx`. La propiedad 495692350 utiliza ese mismo flujo según la confirmación del propietario. Mantener la medición mejorada de vistas de página en cambios de historial de Next.js; no añadir otro `page_view` manual sin desactivarla.

## Por qué la exploración actual muestra 100 % de abandono

La exploración «BAQ| Embudo de conversión | Mensual» de la captura tiene rango **28–30 de septiembre de 2026** y pasos `first_visit` → `session_start` → `page_view` → `purchase`. Ese período es anterior a la instrumentación nueva. Además, `first_visit`, `session_start` y `page_view` describen tráfico general, no avances de una donación mensual. El embudo está abierto: por eso un paso posterior puede mostrar más usuarios que el primero. El último paso exige un `purchase`, aunque guardar una suscripción o una solicitud bancaria no equivale a confirmar un cargo.

Las correcciones del código solo generarán datos tras desplegarse y recibir interacciones nuevas. No cambian los eventos históricos de septiembre.

## Configuración en la interfaz de GA4

En **Explorar → BAQ| Embudo de conversión | Mensual**, cambiar el rango desde la fecha del despliegue hasta hoy y editar **Pasos** con el lápiz. Elegir «seguido indirectamente por» entre pasos; otros eventos pueden intercalarse. Activar **Abrir el embudo** solo si se desea incluir usuarios que entran directamente a un paso posterior. Para medir el recorrido completo desde la entrada a donación, usar embudo cerrado.

### Embudo solicitado: donación pagada y página final

Crear una exploración de **pagos confirmados** con estos pasos:

1. `view_donation` — visita a la sección de donación.
2. `select_payment_method` — elección del botón de pago.
3. `purchase` — cobro aprobado y con ID de transacción.
4. `donation_confirmation_viewed` — llegada a `/thank-you` después de ese cobro.

La página de agradecimiento solo emite el último evento si existe una confirmación aprobada de la sesión, que se consume una sola vez. Esto evita contar visitas directas o recargas como conversiones nuevas. Este embudo cubre Nuvei de pago único, DeUna y Payphone confirmado por backend; PayPal entra si el backend devuelve una captura `COMPLETED`. PagoPlux todavía no cuenta como cobro confirmado: su endpoint actual registra una transacción pendiente, sin devolver verificación del pago. Los formularios de débito, transferencia, efectivo y tarjeta recurrente tampoco prueban un cargo inmediato. Para incluirlos como donaciones pagadas se necesita una confirmación de cobro del backend o un webhook y un identificador único.

### Tarjeta mensual Nuvei: activaciones

1. `view_donation` — entrada a la página de donación.
2. `begin_checkout` con `donation_frequency = mensual` — el usuario inicia el proceso.
3. `select_payment_method` con `payment_type = nuvei_recurrente` — elige la tarjeta mensual.
4. `subscription_activated` — el backend respondió correctamente a `save-subscription`.

Marcar `subscription_activated` como **evento clave** si una activación confirmada es la conversión de la campaña. Este evento no informa ingresos cobrados. El importe previsto se envía como `monthly_amount`.

### Débito bancario mensual: solicitudes

1. `view_donation`.
2. `begin_checkout` con `donation_frequency = mensual`.
3. `donation_request_submitted` con `payment_type = debito_bancario` — el backend aceptó el registro.

Se puede marcar `donation_request_submitted` como evento clave para medir solicitudes aceptadas, pero no como donación cobrada. Si una campaña combina tarjeta y débito, usar dos exploraciones o un último paso con condición OR para esos eventos y llamarlo «registro mensual», dejando clara la diferencia entre solicitud y activación.

### Donación única: cobros

`view_donation` → `begin_checkout` con `donation_frequency = unica` → `select_payment_method` → `purchase` → `donation_confirmation_viewed`. `purchase` se envía tras pago aprobado de Nuvei o DeUna, de Payphone tras confirmación del backend y de PayPal si la captura del backend es `COMPLETED`. La página `/thank-you` no genera `purchase` por sí sola. PagoPlux todavía necesita una confirmación verificable del proveedor o backend para medir su cobro. GA4 marca `purchase` como evento clave automáticamente.

## Parámetros y comprobación

Registrar `donation_frequency`, `payment_type` y `donation_path` como dimensiones personalizadas de alcance evento para los desgloses. `monthly_amount` puede registrarse como métrica personalizada si se necesita analizar montos previstos. Los eventos de comercio electrónico usan `currency=USD`, `value` e `items`; `purchase` también usa `transaction_id`. No enviar nombres, correos, teléfonos, cédulas ni cuentas bancarias a GA4.

Tras el despliegue, usar **DebugView** o **Tag Assistant** y recorrer las rutas de tarjeta mensual, débito y pago único. Comprobar el orden de eventos y que un rechazo no genere `subscription_activated` ni `purchase`. Repetir una consulta de pago aprobado no debe crear un segundo `purchase` en la misma sesión. La exploración necesita datos nuevos y puede tardar en reflejarlos; el informe en tiempo real sirve para la primera comprobación.
