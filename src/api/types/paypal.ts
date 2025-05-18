export interface PayPalWebhookData {
  id: string;
  event_type?: string;
  event_name?: string;
  create_time?: string;
  resource_type?: string;
  summary?: string;
  resource?: {
    id: string;
    status?: string;
    amount?: {
      currency_code: string;
      value: string;
    };
    payer?: {
      email_address?: string;
      payer_id?: string;
      name?: {
        given_name?: string;
        surname?: string;
      };
    };
    purchase_units?: Array<{
      reference_id?: string;
      amount?: {
        currency_code: string;
        value: string;
      };
    }>;
    [key: string]: unknown;
  };
  links?: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
  [key: string]: unknown;
} 