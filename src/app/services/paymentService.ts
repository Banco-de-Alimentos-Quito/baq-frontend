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
      console.log('📤 Enviando confirmación al backend:', { id, clientTransactionId });

      const response = await fetch(`${this.baseUrl}/api/baq/payphone/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          id,
          clientTransactionId
        } as PaymentConfirmRequest)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error HTTP ${response.status}: ${errorText}`);
      }

      //TODO: Aqui colocar un verficicador porque da un error 
      //Error: Failed to execute 'json' on 'Response': Unexpected end of JSON input
      //try
      const data = await response.json();
      console.log('✅ Respuesta del backend:', data);
      
      return data;
    } catch (error) {
      console.error('❌ Error confirmando transacción:', error);
      throw error;
    }
  }

  static async confirmPagoPluxTransaction(){
    


  }

}