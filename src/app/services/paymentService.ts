import CryptoJS from 'crypto-js';

interface PaymentConfirmRequest {
  id: string;
  clientTransactionId: string;
}

interface PaymentConfirmResponse {
  success: boolean;
  message?: string;
  transactionId?: string;
  amount?: number;
  status?: string;
  data?: any;
}

export class PaymentService {
  private static baseUrl = process.env.NEXT_PUBLIC_API_URL;
  /**
   * Confirma una transacción de PayPhone enviando los datos al backend
   */
  static async confirmPayPhoneTransaction(
    id: string,
    clientTransactionId: string
  ): Promise<PaymentConfirmResponse> {
    try {
      const response = await fetch(`${this.baseUrl}payphone/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          id,
          clientTransactionId,
        } as PaymentConfirmRequest),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error HTTP ${response.status}: ${errorText}`);
      }

      //TODO: Aqui colocar un verficicador porque da un error
      //Error: Failed to execute 'json' on 'Response': Unexpected end of JSON input
      //try
      const data = await response.json();

      return data;
    } catch (error) {
      console.error("❌ Error confirmando transacción:", error);
      throw error;
    }
  }

  /**
   * Confirma una transacción de PagoPlux enviando los datos al backend
   * @param response - Respuesta completa de PagoPlux
   */
  static async confirmPagoPluxTransaction(
    email: any,
    phone: any
  ): Promise<PaymentConfirmResponse> {
    try {
      console.log("📤 Procesando respuesta PagoPlux:", response);

      // Extraer y estructurar los datos que quieres enviar al backend

      const dataToSend = {
        email: email,
        phone: phone,
      };

      // const encryptedData = CryptoJS.AES.encrypt(
      //   JSON.stringify(dataToSend),
      //   this.encryptionKey
      // ).toString();

      // const reponse = await fetch(
      //   `${this.baseUrl}pagoplux/verification`,
      //   {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //       Accept: "application/json",
      //     },
      //     body: JSON.stringify(dataToSend),
      //   }
      // );

      // if (!reponse.ok) {
      //   const errorText = await reponse.text();
      //   throw new Error(`Error HTTP ${reponse.status}: ${errorText}`);
      // }

      // // Verificador para el error de JSON
      // const contentType = reponse.headers.get("content-type");
      // if (contentType && contentType.includes("application/json")) {
      //   const data = await reponse.json();
      //   return data;
      // } 
      return {
        success: true,
        message: "Transaccion confirmada"
      }

    } catch (error) {
      console.error("❌ Error confirmando transacción PagoPlux:", error);
      throw error;
    }
  }
}
