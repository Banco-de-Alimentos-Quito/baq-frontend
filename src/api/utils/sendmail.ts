import FormData from "form-data"; // form-data v4.0.1
import Mailgun from "mailgun.js"; // mailgun.js v11.1.0
import type { PayPalWebhookData } from '../types/paypal';
import fs from 'fs';
import path from 'path';

// Mailgun configuration
// The Mailgun API key should look like: key-1234567890abcdefghijklmn
const API_KEY = 'c7bc4752bdf54d0225508a6a2b1222ec-e71583bb-e677a194';
const DOMAIN = 'sandbox84b630233b6741bb99e3d14a72bd78a5.mailgun.org';
const RECIPIENT_EMAIL = 'alekseinavalforever@gmail.com';

// Define voucher data type
interface VoucherData {
  transactionId: string;
  amount: string;
  currency: string;
  date: string;
  timestamp: string;
  recipient: string;
}

// Save voucher info to a file even if email fails
const saveVoucherToFile = (voucherData: VoucherData): boolean => {
  try {
    const vouchersPath = path.join(__dirname, '../vouchers');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(vouchersPath)) {
      fs.mkdirSync(vouchersPath, { recursive: true });
    }
    
    const voucherFile = path.join(vouchersPath, `voucher-${new Date().getTime()}.json`);
    fs.writeFileSync(voucherFile, JSON.stringify(voucherData, null, 2), 'utf8');
    console.log(`Voucher guardado en: ${voucherFile}`);
    return true;
  } catch (error) {
    console.error('Error guardando el voucher:', error);
    return false;
  }
};

export const sendPaymentVoucher = async (webhookData: PayPalWebhookData): Promise<boolean> => {
  try {
    // Extract relevant payment details from webhook data
    const paymentId = webhookData.resource?.id || 'Unknown';
    // Check for amount in different possible locations in the PayPal data structure
    let paymentAmount = 'Unknown';
    let paymentCurrency = 'USD';
    
    if (webhookData.resource?.amount) {
      paymentAmount = webhookData.resource.amount.value;
      paymentCurrency = webhookData.resource.amount.currency_code;
    } else if (webhookData.resource?.purchase_units?.[0]?.amount) {
      paymentAmount = webhookData.resource.purchase_units[0].amount.value;
      paymentCurrency = webhookData.resource.purchase_units[0].amount.currency_code;
    } else if (webhookData.summary) {
      // Try to extract from summary (e.g., "Payment completed for $ 47.0 USD")
      const summaryMatch = webhookData.summary.match(/\$\s*([\d.]+)\s*([A-Z]{3})/);
      if (summaryMatch) {
        paymentAmount = summaryMatch[1];
        paymentCurrency = summaryMatch[2];
      }
    }
    
    const paymentDate = new Date().toLocaleString();
    
    // Create voucher data
    const voucherData: VoucherData = {
      transactionId: paymentId,
      amount: paymentAmount,
      currency: paymentCurrency,
      date: paymentDate,
      timestamp: new Date().toISOString(),
      recipient: RECIPIENT_EMAIL
    };
    
    // Save voucher to file regardless of email success
    saveVoucherToFile(voucherData);
    
    console.log('Attempting to send email for payment:', {
      paymentId,
      paymentAmount,
      paymentCurrency
    });
    
    const mailgun = new Mailgun(FormData);
    const mg = mailgun.client({
      username: "api",
      key: API_KEY
    });
    
    // Create email HTML content
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0;">
        <h2 style="color: #003087; text-align: center;">Payment Confirmation</h2>
        <p>Thank you for your purchase. Your payment has been successfully processed.</p>
        <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Transaction ID:</strong> ${paymentId}</p>
          <p><strong>Amount:</strong> ${paymentCurrency} ${paymentAmount}</p>
          <p><strong>Date:</strong> ${paymentDate}</p>
        </div>
        <p style="font-size: 14px; color: #666;">This is an automated message, please do not reply.</p>
      </div>
    `;
    
    // Create plain text content as fallback
    const textContent = `
      Payment Confirmation
      
      Thank you for your purchase. Your payment has been successfully processed.
      
      Transaction ID: ${paymentId}
      Amount: ${paymentCurrency} ${paymentAmount}
      Date: ${paymentDate}
      
      This is an automated message, please do not reply.
    `;
    
    const data = await mg.messages.create(DOMAIN, {
      from: `PayPal Payment <postmaster@${DOMAIN}>`,
      to: [`Payment Recipient <${RECIPIENT_EMAIL}>`],
      subject: "Payment Confirmation - Thank You for Your Purchase",
      text: textContent,
      html: htmlContent
    });
    
    console.log('Email sent successfully:', data);
    return true;
  } catch (error) {
    console.log('Error sending email:', error);
    
    // Check for sandbox limitation error
    if (error && typeof error === 'object' && 'details' in error) {
      const details = (error as {details?: string}).details;
      if (details && details.includes('authorized recipients')) {
        console.error('SANDBOX LIMITATION: You need to authorize recipients in Mailgun');
        console.error('For Mailgun sandbox accounts, you must verify recipient emails:');
        console.error(`1. Go to https://app.mailgun.com/app/sending/domains/${DOMAIN}/authorized`);
        console.error(`2. Add "${RECIPIENT_EMAIL}" as an authorized recipient`);
        console.error('3. Check your email and click the verification link from Mailgun');
      }
    }
    
    return false;
  }
};
