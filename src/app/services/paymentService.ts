import { useFormStore } from "../store/formStore";
import { getOrCreateUserId } from "../utils/utils";

interface PaymentConfirmRequest {
  id: number;
  clientTransactionId: string;
  userId: string;
  direccion?: string;
  city?: string;
  gestorDonacion?: string;
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
    id: number,
    clientTransactionId: string,
    userId: string,
    address: string,
    city?: string,
    gestorDonacion?: string
  ): Promise<PaymentConfirmResponse> {
    try {
      const emailResponse = await fetch(`${this.baseUrl}/payphone/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ id, clientTxId: clientTransactionId }),
      });

      const emailData = await emailResponse.json();

      if (emailData?.email) {
        // Usar directamente el store sin destructuring
        useFormStore.getState().setEmail(emailData.email);
        console.log("📧 Email obtenido del backend:", emailData.email);
      }

      const response = await fetch(`${this.baseUrl}/payphone/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          id,
          clientTransactionId,
          userId,
          direccion: address,
          city,
          gestor_donacion: gestorDonacion,
        } as PaymentConfirmRequest),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error HTTP ${response.status}: ${errorText}`);
      }

      //TODO: Aqui colocar un verficicador porque da un error
      
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
    idTransaction: any,
    userPhone: string,
    direccion?: string,
    ciudad?: string,
    gestorDonacion?: string
  ): Promise<PaymentConfirmResponse> {
    try {
      // Obtener dirección del sessionStorage si no se proporcionó
      const formState = useFormStore.getState();
      const userId = formState.userId;
      const direccionToUse = direccion || formState.direccion;
      const cityToSend = ciudad || formState.ciudad;

      // Extraer y estructurar los datos que quieres enviar al backend
      const gestorToSend = gestorDonacion || formState.gestorDonacion;

      const dataToSend = {
        id_transaction: idTransaction,
        user_id: userId,
        email: email,
        phone: userPhone,
        direccion: direccionToUse,
        ciudad: cityToSend,
        gestor_donacion: gestorToSend,
      };

      await fetch(`${this.baseUrl}/pagoplux/transaccion-pendiente`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

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
        message: "Transaccion confirmada",
      };
    } catch (error) {
      console.error("❌ Error confirmando transacción PagoPlux:", error);
      throw error;
    }
  }
}
