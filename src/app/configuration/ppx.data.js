import { PaymentService } from "../services/paymentService";

const generatePayboxData = (amount, userEmail, userPhone, direccion, ciudad) => {
  return {
    /* Requerido. Email de la cuenta PagoPlux del Establecimiento */
    PayboxRemail: "direccion@baq.ec",
    /* Requerido. Email del usuario que realiza el pago */
    //userEmail ||
    PayboxSendmail: userEmail,
    /* Requerido. Nombre del establecimiento en PagoPlux */
    PayboxRename: "BANCO DE ALIMENTOS QUITO",
    /* Requerido. Nombre del usuario que realiza el pago */
    //PayboxSendname: "Nombre Persona",
    /* Requerido. Monto total de productos o servicios que no aplican 
  impuestos, máximo 2 decimales. Ejemplo: 100.00, 10.00, 1.00 */
    PayboxBase0: amount,
    /* Requerido. Monto total de productos o servicios que aplican 
    impuestos, el valor debe incluir el impuesto, máximo 2 decimales. 
    Ejemplo: 100.00, 10.00, 1.00 posee el valor de los productos con su 
    impuesto incluido */
    PayboxBase12: "0.0",
    /* Requerido. Descripción del pago */
    PayboxDescription: "Realizacion donacion Banco de Alimentos Quito",
    /* Requerido Tipo de Ejecución 
    * Production: true (Modo Producción, Se procesarán cobros y se 
    cargarán al sistema, afectará a la tdc) 
    * Production: false (Modo Prueba, se realizarán cobros de prueba y no   
    se guardará ni afectará al sistema) 
    */
    PayboxProduction: false,
    /* Requerido Ambiente de ejecución 
    * prod: Modo Producción, Se procesarán cobros y se cargarán al sistema,   
    afectará a la tdc. 
    * sandbox: Modo Prueba, se realizarán cobros de prueba 
    */
    PayboxEnvironment: "sandbox",
    /* Requerido. Lenguaje del Paybox
     * Español: es | (string) (Paybox en español)
     */
    PayboxLanguage: "es",

    /* Requerido. Identifica el tipo de iframe de pagoplux por defecto true
     */
    PayboxPagoPlux: true,
    /*
     * Requerido. dirección del tarjetahabiente
     */
    PayboxDirection: "Av.Napoleon y Ofradia",
    /*
     * Requerido. Teléfono del tarjetahabiente
     */
    //userPhone
    PayBoxClientPhone: userPhone,
    /*
     * Requerido. Identificación del tarjetahabiente
     */
    PayBoxClientIdentification: "1791921429001",
    /* SOLO PARA PAGOS RECURRENTES 
  *  Solo aplica para comercios que tengan habilitado pagos 
  recurrentes 
  */
    /* Requerido 
  True -> en caso de realizar un pago recurrente 
  False -> si es pago normal 
  */
    PayboxRecurrent: false,
    /* Requerido 
  Id o nombre exacto del plan registrado en el comercio en la   
  plataforma de pagoplux 
*/
    PayboxIdPlan: "837",
    /** 
* true -> los cobros se realizan de manera automática según la 
frecuencia del plan asignado en PAGOPLUX 
* false -> los cobros se realizan mediante solicitud 
*/
    PayboxPermitirCalendarizar: true,
    /* Requerido 
6 
* true -> El débito se realiza en el momento del pago 
* false -> El débito se realizará en la fecha de corte según el plan 
contratado 
*/
    PayboxPagoInmediato: false,
    /* Requerido 
true -> si desea realizar un pago de prueba de 1$ y reverso del 
mismo de manera automática 
NOTA: PayboxPagoImediato debe ser igual false 
false -> no se realizará ningún cobro de prueba 
*/
    PayboxCobroPrueba: false,
    onAuthorize: (response) => {
      try {
        if (response.status === "succeeded") {
           PaymentService.confirmPagoPluxTransaction(
            userEmail,
            response.detail.id_transaccion,
            userPhone,
            direccion,
            ciudad
          );

          setTimeout(() => {
            window.location.href = `/thank-you`;
          }, 2000);

        }
      } catch (error) {
        alert(
          "Ocurrió un error al procesar el pago. Por favor, inténtelo de nuevo."
        );
      }
    },
  };
};

let data = generatePayboxData(1.0);

export { data, generatePayboxData };
