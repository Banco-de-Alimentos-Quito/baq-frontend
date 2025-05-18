import FormData from "form-data";
import Mailgun from "mailgun.js";
import fs from 'fs';
import path from 'path';

// Mailgun configuration
const API_KEY = process.env.API_KEY;
const DOMAIN = process.env.DOMAIN;

// Ensure required environment variables are set
if (!API_KEY) {
  throw new Error('Missing Mailgun API_KEY environment variable');
}
if (!DOMAIN) {
  throw new Error('Missing Mailgun DOMAIN environment variable');
}

interface EmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

// Load and process email template
export function loadEmailTemplate(templateName: string, data: Record<string, string> = {}): string {
  try {
    // Define the templates directory path
    const templatesDir = path.join(__dirname, '../templates');
    const templatePath = path.join(templatesDir, `${templateName}.html`);
    
    // Read the template file
    let templateContent = fs.readFileSync(templatePath, 'utf8');
    
    // Replace variables in the template
    Object.entries(data).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      templateContent = templateContent.replace(regex, value);
    });
    
    return templateContent;
  } catch (error) {
    console.error(`Error loading template ${templateName}:`, error);
    return '';
  }
}

// Send email using Mailgun
export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    const { to, subject, html, text } = params;
    
    // Initialize Mailgun client
    const mailgun = new Mailgun(FormData);
    const mg = mailgun.client({
      username: "api",
      key: API_KEY as string
    });
    
    // Format recipients
    const recipients = Array.isArray(to) 
      ? to.map(email => `<${email}>`)
      : [`<${to}>`];
    
    // Send email
    const data = await mg.messages.create(DOMAIN as string, {
      from: `Notification <postmaster@${DOMAIN}>`,
      to: recipients,
      subject: subject,
      html: html,
      text: text || html.replace(/<[^>]*>/g, '') // Strip HTML tags for text version if not provided
    });
    
    console.log('Email sent successfully:', data);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
} 