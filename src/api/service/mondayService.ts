import mondaySdk from 'monday-sdk-js';
import type { PayPalWebhookData } from '../types/paypal';
import type { 
  MondayItemData, 
  MondayColumnValues,
  MondayCreateItemResponse,
  MondayUpdateItemResponse
} from '../types/monday';
import { MONDAY_CONFIG } from '../types/monday';

// Monday.com configuration
const MONDAY_TOKEN = process.env.MONDAY_API_TOKEN;

if (!MONDAY_TOKEN) {
  throw new Error('Missing MONDAY_API_TOKEN environment variable');
}

// Initialize Monday SDK
const monday = mondaySdk();
monday.setToken(MONDAY_TOKEN);



// Extract PayPal data and map to Monday columns
export function mapPayPalToMondayData(webhookData: PayPalWebhookData): MondayItemData {
  // Extract payment information
  const paymentId = webhookData.resource?.id || 'Unknown';
  let paymentAmount = 0;
  let payerName = 'Unknown';

  // Extract amount and currency
  if (webhookData.resource?.amount) {
    paymentAmount = parseFloat(webhookData.resource.amount.value);
  } else if (webhookData.resource?.purchase_units?.[0]?.amount) {
    paymentAmount = parseFloat(webhookData.resource.purchase_units[0].amount.value);
  } else if (webhookData.summary) {
    const summaryMatch = webhookData.summary.match(/\$\s*([\d.]+)\s*([A-Z]{3})/);
    if (summaryMatch) {
      paymentAmount = parseFloat(summaryMatch[1]);
    }
  }

  // Extract payer information including address data
  let payerCountry = '';
  let payerCity = '';
  let payerEmail = '';
  
  try {
    const data = JSON.parse(JSON.stringify(webhookData));
    console.log('📦 Datos recibidos de PayPal:', {
      resource: data.resource,
      eventType: data.event_type,
      summary: data.summary
    });
    
    if (data.resource?.payer) {
      const payer = data.resource.payer;
      console.log('👤 Datos del pagador:', payer);
      
      // Name
      if (payer.name) {
        payerName = `${payer.name.given_name || ''} ${payer.name.surname || ''}`.trim();
      }
      
      // Email (now works as simple string)
      if (payer.email_address) {
        payerEmail = payer.email_address;
      }

      // Country and City from payer address
      if (payer.address) {
        payerCountry = payer.address.country_code || '';
      }
    }

    // Try to get city from shipping address
    if (data.resource?.purchase_units?.[0]?.shipping?.address) {
      const shipping = data.resource.purchase_units[0].shipping.address;
      payerCity = shipping.admin_area_2 || shipping.admin_area_1 || '';
      if (!payerCountry) payerCountry = shipping.country_code || '';
    }
    
    console.log('📍 Dirección extraída:', { payerCountry, payerCity });
  } catch {
    console.log('Error extracting payer info, using defaults');
  }

  // Ensure we have minimum required data before proceeding
  if (payerName === 'Unknown' || paymentAmount === 0) {
    console.log('⚠️ Datos insuficientes del pagador, saltando envío a Monday');
    throw new Error('Insufficient payer data for Monday integration');
  }

  // Build column values with working columns
  const columnValues: Record<string, string | number | { email: string; text: string }> = {};
  
  // Working columns
  columnValues['text_mkrxarv5'] = payerName;
  columnValues['numeric_mkrxs38c'] = paymentAmount;
  
  // Date in ISO format (YYYY-MM-DD)
  const now = new Date();
  const currentDate = now.toISOString().split('T')[0];
  columnValues['date'] = currentDate;
  
  // City (works)
  if (payerCity) {
    columnValues['text_mkrx4w4m'] = payerCity;
  }
  
  // Country code (direct string)
  if (payerCountry) {
    columnValues['text_mkrx27e5'] = payerCountry;
    console.log(`🌍 País: ${payerCountry}`);
  }
  
  // Email (email column format)
  if (payerEmail) {
    columnValues['email_mkrxg5ct'] = {
      email: payerEmail,
      text: payerEmail
    };
    console.log(`📧 Email: ${payerEmail}`);
  }
  
  console.log('✅ Enviando todas las columnas:', columnValues);

  return {
    boardId: MONDAY_CONFIG.BOARD_ID!,
    groupId: MONDAY_CONFIG.GROUP_ID!,
    itemName: `pago-cliente-${paymentId}`,
    columnValues: columnValues as Record<string, string | number | { email: string; text: string }>
  };
}

// Create item in Monday.com
export async function createMondayItem(itemData: MondayItemData): Promise<string | null> {
  try {
    console.log('🔍 Token de Monday:', MONDAY_TOKEN ? 'Configurado' : 'NO CONFIGURADO');
    
    const query = `
      mutation ($boardId: ID!, $groupId: String!, $itemName: String!, $columnValues: JSON!) {
        create_item (
          board_id: $boardId,
          group_id: $groupId,
          item_name: $itemName,
          column_values: $columnValues
        ) {
          id
          name
        }
      }
    `;

    const variables = {
      boardId: itemData.boardId,
      groupId: itemData.groupId,
      itemName: itemData.itemName,
      columnValues: JSON.stringify(itemData.columnValues)
    };

    console.log('📤 Enviando a Monday:', {
      query,
      variables,
      token: MONDAY_TOKEN?.substring(0, 5) + '...',
      boardId: itemData.boardId,
      groupId: itemData.groupId
    });

    console.log('Creando item en Monday con datos:', {
      boardId: itemData.boardId,
      groupId: itemData.groupId,
      itemName: itemData.itemName,
      columnValues: itemData.columnValues
    });

    console.log('🚀 Llamando a Monday API...');
    const response = await monday.api(query, { variables }) as MondayCreateItemResponse;
    console.log('📥 Respuesta de Monday:', response);

    if (response.errors && response.errors.length > 0) {
      console.error('❌ Error en Monday API:', response.errors);
      return null;
    }

    if (response.data?.create_item?.id) {
      const itemId = response.data.create_item.id;
      console.log(`✅ Item creado exitosamente en Monday con ID: ${itemId}`);
      return itemId;
    }

    console.error('No se pudo crear el item en Monday - respuesta inesperada:', response);
    return null;
  } catch (error) {
    console.error('Error al crear item en Monday:', error);
    return null;
  }
}

// Update item columns in Monday.com (for future phone and birth date updates)
export async function updateMondayItem(
  itemId: string, 
  updates: {
    phone?: string;      // Formato: +593987654321
    birthDate?: string;  // Formato: YYYY-MM-DD
  }
): Promise<boolean> {
  const columnValues: Partial<MondayColumnValues> = {};
  
  if (updates.phone) {
    columnValues.phone_mkrxxch9 = {
      phone: updates.phone,
      countryShortName: 'EC'
    };
  }
  
  if (updates.birthDate) {
    columnValues.date_mkrxxa9b = updates.birthDate; // Formato: YYYY-MM-DD
  }
  try {
    const query = `
      mutation ($boardId: ID!, $itemId: ID!, $columnValues: JSON!) {
        change_multiple_column_values (
          board_id: $boardId,
          item_id: $itemId,
          column_values: $columnValues
        ) {
          id
        }
      }
    `;

    const variables = {
      boardId: MONDAY_CONFIG.BOARD_ID,
      itemId: itemId,
      columnValues: JSON.stringify(columnValues)
    };

    console.log('Actualizando item en Monday:', {
      itemId,
      columnValues
    });

    const response = await monday.api(query, { variables }) as MondayUpdateItemResponse;

    if (response.errors && response.errors.length > 0) {
      console.error('Error actualizando Monday API:', response.errors);
      return false;
    }

    if (response.data?.change_multiple_column_values?.id) {
      console.log(`Item ${itemId} actualizado exitosamente en Monday`);
      return true;
    }

    console.error('No se pudo actualizar el item en Monday - respuesta inesperada:', response);
    return false;
  } catch (error) {
    console.error('Error al actualizar item en Monday:', error);
    return false;
  }
}

// Main function to process PayPal webhook and create Monday item
export async function processPayPalToMonday(webhookData: PayPalWebhookData): Promise<string | null> {
  try {
    // Map PayPal data to Monday format
    const mondayData = mapPayPalToMondayData(webhookData);
    
    // Create item in Monday
    const itemId = await createMondayItem(mondayData);
    
    return itemId;
  } catch (error) {
    console.error('Error processing PayPal to Monday:', error);
    return null;
  }
} 