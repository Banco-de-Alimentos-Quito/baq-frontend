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
      console.log("📤 Enviando confirmación al backend:", {
        id,
        clientTransactionId,
      });

      const response = await fetch(`${this.baseUrl}/api/baq/payphone/confirm`, {
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
      console.log("✅ Respuesta del backend:", data);

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
    response: any
  ): Promise<PaymentConfirmResponse> {
    try {
      console.log("📤 Procesando respuesta PagoPlux:", response);

      // Extraer y estructurar los datos que quieres enviar al backend
      const dataToSend = {
        transactionId: response.detail.id_transaccion,
        amount: response.detail?.amount || 0,
        clientId: response.detail?.clientID || "",
        clientName: response.detail?.clientName || "",
        clientPhone: response.detail?.clientPhone || "",
        state: response.detail?.state || "unknown",
        fecha: response.detail?.fecha || new Date().toISOString(),
        descripcion: response.detail?.description || "",
      };

      console.log("📤 Enviando datos estructurados al backend:", dataToSend);

      const backendResponse = await fetch(
        `${this.baseUrl}/api/baq/pagoplux/confirm`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(dataToSend),
        }
      );

      if (!backendResponse.ok) {
        const errorText = await backendResponse.text();
        throw new Error(`Error HTTP ${backendResponse.status}: ${errorText}`);
      }

      // Verificador para el error de JSON
      const contentType = backendResponse.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await backendResponse.json();
        console.log("✅ Respuesta del backend PagoPlux:", data);
        return data;
      } else {
        // Si no es JSON, crear respuesta por defecto
        return {
          success: true,
          message: "Transacción PagoPlux confirmada exitosamente",
          transactionId: dataToSend.transactionId,
          amount: dataToSend.amount,
        };
      }
    } catch (error) {
      console.error("❌ Error confirmando transacción PagoPlux:", error);
      throw error;
    }
  }
}
