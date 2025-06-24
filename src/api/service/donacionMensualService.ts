import { Request, Response } from 'express';
import mondaySdk from 'monday-sdk-js';
import fs from 'fs';
import path from 'path';
import type { 
  DonacionMensualFormData,
  DonacionMensualItemData, 
  DonacionMensualCreateItemResponse
} from '../types/donacionMensual';
import { DONACION_MENSUAL_CONFIG } from '../types/donacionMensual';

// Monday.com configuration
const MONDAY_TOKEN = process.env.MONDAY_API_TOKEN;

if (!MONDAY_TOKEN) {
  throw new Error('Missing MONDAY_API_TOKEN environment variable');
}

// Initialize Monday SDK
const monday = mondaySdk();
monday.setToken(MONDAY_TOKEN);

// Map form data to Monday columns
export function mapDonacionMensualToMondayData(formData: DonacionMensualFormData): DonacionMensualItemData {
  console.log('📦 Datos recibidos del formulario:', formData);

  // Build column values
  const columnValues: Record<string, string | number | { email: string; text: string }> = {};
  
  // Mapear todos los campos del formulario
  columnValues['text_mkryzaya'] = formData.cedula;           // Cédula/RUC
  columnValues['text_mkrykcyf'] = formData.nombres;          // Nombres Completos
  columnValues['text_mks6a5we'] = formData.genero;           // Género
  columnValues['text_mkryg7b1'] = formData.direccion;        // Dirección
  columnValues['text_mkrys5rv'] = formData.cuenta;           // Número de cuenta
  columnValues['text_mkrye04e'] = formData.tipoCuenta;       // Tipo de cuenta
  columnValues['numeric_mkrz6a5'] = formData.monto;          // Monto
  
  // Email (formato especial para columna email)
  columnValues['email_mkryzdsz'] = {
    email: formData.correo,
    text: formData.correo
  };
  
  // Banco (si es "Otra", usar el campo otroBanco)
  const bancoFinal = formData.banco === 'Otra' ? formData.otroBanco || 'Otra' : formData.banco;
  columnValues['text_mkryjz6f'] = bancoFinal;               // Banco/Cooperativa
  
  console.log('✅ Columnas mapeadas para Monday:', columnValues);

  return {
    boardId: DONACION_MENSUAL_CONFIG.BOARD_ID!,
    groupId: DONACION_MENSUAL_CONFIG.GROUP_ID!,
    itemName: `donacion-mensual-${formData.cedula}`,
    columnValues: columnValues as Record<string, string | number | { email: string; text: string }>
  };
}

// Create item in Monday.com
export async function createDonacionMensualItem(itemData: DonacionMensualItemData): Promise<string | null> {
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

    console.log('📤 Enviando a Monday (Donación Mensual):', {
      boardId: itemData.boardId,
      groupId: itemData.groupId,
      itemName: itemData.itemName,
      columnValues: itemData.columnValues
    });

    console.log('🚀 Llamando a Monday API...');
    const response = await monday.api(query, { variables }) as DonacionMensualCreateItemResponse;
    console.log('📥 Respuesta de Monday:', response);

    if (response.errors && response.errors.length > 0) {
      console.error('❌ Error en Monday API:', response.errors);
      return null;
    }

    if (response.data?.create_item?.id) {
      const itemId = response.data.create_item.id;
      console.log(`✅ Donación mensual creada exitosamente en Monday con ID: ${itemId}`);
      return itemId;
    }

    console.error('No se pudo crear la donación mensual en Monday - respuesta inesperada:', response);
    return null;
  } catch (error) {
    console.error('Error al crear donación mensual en Monday:', error);
    return null;
  }
}

// Main function to process form data and create Monday item
export async function processDonacionMensualToMonday(formData: DonacionMensualFormData): Promise<string | null> {
  try {
    // Map form data to Monday format
    const mondayData = mapDonacionMensualToMondayData(formData);
    
    // Create item in Monday
    const itemId = await createDonacionMensualItem(mondayData);
    
    return itemId;
  } catch (error) {
    console.error('Error processing donación mensual to Monday:', error);
    return null;
  }
}

// Service handlers
export const donacionMensualService = {
  handleDonacionMensual: async (req: Request, res: Response) => {
    try {
      // Recibir los datos del formulario
      const formData = req.body as DonacionMensualFormData;
      
      // Loguear los datos recibidos para depuración
      console.log('📝 Donación mensual recibida:', JSON.stringify(formData, null, 2));
      
      // Validar datos requeridos
      if (!formData.cedula || !formData.nombres || !formData.correo || !formData.monto) {
        return res.status(400).json({ 
          status: 'error', 
          message: 'Faltan datos requeridos' 
        });
      }

      // Guardar los datos en response.json para auditoría
      const responsePath = path.join(__dirname, '../responses/response.json');
      
      let existingData = [];
      try {
        const fileContent = fs.readFileSync(responsePath, 'utf8');
        existingData = JSON.parse(fileContent);
      } catch {
        console.log('El archivo response.json no existe o está vacío, se creará uno nuevo');
      }
      
      // Añadir la nueva donación mensual con timestamp
      existingData.push({
        timestamp: new Date().toISOString(),
        type: 'donacion-mensual',
        data: formData
      });
      
      // Escribir los datos actualizados al archivo
      fs.writeFileSync(responsePath, JSON.stringify(existingData, null, 2), 'utf8');
      console.log('✅ Donación mensual guardada en response.json');
      
      // Enviar datos a Monday.com
      try {
        const mondayItemId = await processDonacionMensualToMonday(formData);
        if (mondayItemId) {
          console.log(`✅ Donación mensual enviada a Monday exitosamente. Item ID: ${mondayItemId}`);
          res.status(200).json({ 
            status: 'success', 
            message: 'Donación mensual procesada exitosamente',
            mondayItemId: mondayItemId
          });
        } else {
          console.error('❌ Error al crear donación mensual en Monday');
          res.status(500).json({ 
            status: 'error', 
            message: 'Error al procesar donación mensual en Monday' 
          });
        }
      } catch (mondayError) {
        console.error('❌ Error procesando donación mensual en Monday:', mondayError);
        res.status(500).json({ 
          status: 'error', 
          message: 'Error interno al procesar donación mensual' 
        });
      }
    } catch (error) {
      console.error('❌ Error procesando donación mensual:', error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Error interno del servidor' 
      });
    }
  }
}; 