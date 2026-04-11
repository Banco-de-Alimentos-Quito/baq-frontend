Documentación Técnica API – Nuvei Ecuador
Nota: Los establecimientos que no cuentan con certificación PCI, deberán utilizar para la
integración de Nuvei Ecuador los siguientes links:
Método Checkout:
https://developers.paymentez.com/docs/payments/#checkout
https://developers.paymentez.com/api/#payment-methods-cards-init-a-reference – Referencia
https://developers.paymentez.com/api/#webhook – Callback
https://developers.paymentez.com/api/#payment-methods-cards-refund – Refund
Método Addcard (Añadido de tarjeta de manera tokenizada):
https://developers.paymentez.com/docs/payments/#client – Agregar tarjeta
https://developers.paymentez.com/api/#payment-methods-cards-get-all-cards – Listar tarjeta
https://developers.paymentez.com/api/#payment-methods-cards-delete-a-card – Borrar tarjeta
https://developers.paymentez.com/api/#payment-methods-cards-debit-with-token – Debito con token
https://developers.paymentez.com/api/#payment-methods-cards-refund – Refund
https://developers.paymentez.com/api/#webhook – Callback
https://developers.paymentez.com/api/#payment-methods-cards-verify – Verify método obligatorio en el caso
de procesar tarjetas del grupo Diners
Link to Pay:
https://developers.paymentez.com/api/#payment-methods-linktopay
https://developers.paymentez.com/api/#webhook – Callback
https://developers.paymentez.com/api/#payment-methods-cards-refund – Refund
SDK:
https://github.com/paymentez/paymentez.js
https://github.com/PaymentezEc/sdk-android/releases/tag/v1.3.7
NOTA:
• Es un requisito bancario obligatorio que el establecimiento implemente el método refund
para realizar los reembolsos de las transacciones, previo al cierre de lote.
• Otro requisito bancario obligatorio es el enviar un correo de confirmación después de cada
transacción al cliente, notificándose el detalle de la compra, transaction_id (df o md) y
authorization_code (número de autorización).
• La validación de una transacción Aprobada se realiza con el “status”: ”success”
y “status_detail”: ”3”
• Todos los comercios deberán implementar el proceso de validación mediante callback.
Para ello, el comercio deberá proporcionar una URL específica donde recibirá las
notificaciones en formato JSON de las órdenes generadas desde Nuvei, como parte del
canal de validación de transacciones(https://developers.paymentez.com/api/#webhook).
Si los datos descritos no se encuentran implementados, el comercio no podrá avanzar en su
integración.
CREDENCIALES DE DESARROLLO:
(Checkout / Add Card)
App code: NUVEISTG-EC-CLIENT
App key: rvpKAv2tc49x6YL38fvtv5jJxRRiPs
App code: NUVEISTG-EC-SERVER
App key: Kn9v6ICvoRXQozQG2rK92WtjG6l08a
CREDENCIALES DE DESARROLLO
(Link to Pay)
App code: LINKTOPAY01-EC-CLIENT
App key: METbb1aqKdsN4gFrQELBTicscckHgg
App code: LINKTOPAY01-EC-SERVER
App key: G8vwvaASAZHQgoVuF2eKZyZF5hJmvx
TARJETAS DE PRUEBA:
https://developers.paymentez.com/api/#test-cards
Tarjeta para prueba exitosa: 4111111111111111
Tarjeta para prueba fallida: 4242424242424242
Fecha de caducidad: 01/28
CVV: 634
CONDICIONES 3DS 2.2.
API Compatible
3DS
No Compatible
3DS Comentarios Adicionales
Checkout ✔ Método recomendado para pagos únicos
API Link To Pay ✔
Soporta creación de enlaces de pago; requiere configurar
una URL para recibir notificaciones vía callback.
Add Card
Genera un token el cual debe ser guardado junto el ID del
usuario y el correo (3DS aplica únicamente en el débito
con token)
Débito con Token Web ✔
Se consume el token previamente creado al consumir el
Add Card (Web).
Débito con Token App ✔
Se consume el token previamente creado al consumir el
Add Card (APP-Aplicación Móvil IOS/Android).
Recurrencia (Add Card +
Débito con Token) ✔ En cobros en una fecha determinada.
SDK ✔
Ninguno de los SDK (Android, iOS, JavaScript, Flutter)
soporta protocolo 3DS actualmente.
