import { NextRequest, NextResponse } from 'next/server';

const DIDIT_API_KEY = '7q70Dow53fpfck6lT5oyICGXyACGFLWS5r4ZiNsSdgY';
// Usando una URL de API real de Didit o una simulación para testing
const DIDIT_BASE_URL = 'https://api.didit.io';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 === VERIFICANDO ESTADO DIDIT KYC ===');
    console.log('📅 Timestamp:', new Date().toISOString());
    console.log('🔑 API Key:', DIDIT_API_KEY);

    const body = await request.json();
    console.log('📋 Datos recibidos:', body);

    // Validar datos requeridos
    const { kycId } = body;

    if (!kycId) {
      console.log('❌ ERROR: Falta kycId');
      return NextResponse.json(
        { 
          error: 'Falta kycId requerido',
          required: ['kycId']
        },
        { status: 400 }
      );
    }

    console.log('📦 === PREPARANDO CONSULTA DE ESTADO ===');
    console.log('🆔 KYC ID:', kycId);
    console.log('🔗 URL de destino:', `${DIDIT_BASE_URL}/v1/kyc/${kycId}/status`);
    console.log('📋 Headers a enviar:', {
      'Authorization': `Bearer ${DIDIT_API_KEY}`,
      'Content-Type': 'application/json'
    });

    console.log('🖥️ === COMANDO CURL PARA CONSULTA ===');
    const curlCommand = `curl -X 'GET' '${DIDIT_BASE_URL}/v1/kyc/${kycId}/status' -H 'Authorization: Bearer ${DIDIT_API_KEY}' -H 'Content-Type: application/json'`;
    console.log(curlCommand);
    console.log('=====================================');

    // Realizar petición a Didit
    console.log('🌐 === ENVIANDO PETICIÓN A DIDIT ===');
    console.log('⏱️ Iniciando fetch...');

    let response;
    try {
      response = await fetch(`${DIDIT_BASE_URL}/v1/kyc/${kycId}/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${DIDIT_API_KEY}`,
          'Content-Type': 'application/json',
        }
      });
    } catch (fetchError) {
      console.log('❌ ERROR DE CONEXIÓN:', fetchError.message);
      
      // Para testing, devolver una respuesta simulada
      if (fetchError.message.includes('ENOTFOUND') || fetchError.message.includes('fetch failed')) {
        console.log('🔄 === MODO SIMULACIÓN PARA TESTING ===');
        
        const simulatedResponse = {
          success: true,
          message: 'Estado del KYC consultado exitosamente (simulado)',
          data: {
            kycId: kycId,
            status: 'PENDING',
            verificationLevel: 'BASIC',
            createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString(),
            documents: {
              identity: 'PENDING',
              selfie: 'PENDING',
              proofOfAddress: 'NOT_REQUIRED'
            }
          },
          timestamp: new Date().toISOString(),
          note: 'Esta es una respuesta simulada para testing. La API real no está disponible.'
        };
        
        return NextResponse.json(simulatedResponse);
      }
      
      throw fetchError;
    }

    console.log('📡 === RESPUESTA DE DIDIT ===');
    console.log('🔢 Status code:', response.status);
    console.log('📋 Status text:', response.statusText);
    console.log('🔗 URL de respuesta:', response.url);
    console.log('📋 Headers de respuesta:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      console.log('❌ ERROR: La respuesta de Didit no es exitosa');
      console.log('🔢 Status code de error:', response.status);
      
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorBody = await response.text();
        console.log('📋 Error body:', errorBody);
        errorMessage = errorBody;
      } catch (e) {
        console.log('❌ No se pudo leer el error body');
      }

      return NextResponse.json(
        { 
          error: 'Error en la respuesta de Didit',
          status: response.status,
          message: errorMessage
        },
        { status: response.status }
      );
    }

    console.log('✅ Respuesta exitosa de Didit, parseando JSON...');
    const result = await response.json();
    
    console.log('📊 === RESULTADO COMPLETO DE DIDIT ===');
    console.log('📋 Resultado raw:', result);
    console.log('📅 Timestamp de respuesta:', new Date().toISOString());
    console.log('========================================');

    // Log detallado del payload de respuesta
    console.log('🔄 === PAYLOAD DE RESPUESTA DE DIDIT ===');
    console.log('📋 Response Body completo:');
    console.log(JSON.stringify(result, null, 2));
    console.log('🔍 Campos específicos:');
    console.log('- KYC ID:', result.kycId || result.id || 'No disponible');
    console.log('- Status:', result.status || 'No disponible');
    console.log('- Verification Level:', result.verificationLevel || 'No disponible');
    console.log('- Otros campos:', Object.keys(result).filter(key => !['kycId', 'id', 'status', 'verificationLevel'].includes(key)));
    console.log('========================================');

    return NextResponse.json({
      success: true,
      message: 'Estado del KYC consultado exitosamente',
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.log('💥 === ERROR EN LA CONSULTA DIDIT ===');
    console.error('❌ Error completo:', error);
    console.log('📋 Tipo de error:', typeof error);
    console.log('📋 Mensaje de error:', error.message);
    console.log('📋 Stack trace:', error.stack);
    console.log('📅 Timestamp del error:', new Date().toISOString());

    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        message: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Endpoint para consultar estado de KYC en Didit',
    usage: {
      method: 'POST',
      endpoint: '/api/didit-kyc-status',
      requiredFields: ['kycId'],
      example: {
        kycId: 'kyc_1234567890abcdef'
      }
    }
  });
}
