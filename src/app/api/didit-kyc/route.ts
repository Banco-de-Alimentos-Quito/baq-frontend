import { NextRequest, NextResponse } from 'next/server';

const DIDIT_API_KEY = '7q70Dow53fpfck6lT5oyICGXyACGFLWS5r4ZiNsSdgY';
// Usando una URL de API real de Didit o una simulación para testing
const DIDIT_BASE_URL = 'https://api.didit.io';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 === INICIANDO INTEGRACIÓN DIDIT KYC ===');
    console.log('📅 Timestamp:', new Date().toISOString());
    console.log('🔑 API Key:', DIDIT_API_KEY);

    const body = await request.json();
    console.log('📋 Datos recibidos:', body);

    // Validar datos requeridos
    const { firstName, lastName, email, documentType, documentNumber, country } = body;

    if (!firstName || !lastName || !email || !documentType || !documentNumber || !country) {
      console.log('❌ ERROR: Faltan datos requeridos');
      return NextResponse.json(
        { 
          error: 'Faltan datos requeridos',
          required: ['firstName', 'lastName', 'email', 'documentType', 'documentNumber', 'country']
        },
        { status: 400 }
      );
    }

    // Preparar payload para Didit
    const diditPayload = {
      firstName,
      lastName,
      email,
      documentType,
      documentNumber,
      country,
      // Campos adicionales que podrían ser necesarios
      phone: body.phone || '',
      dateOfBirth: body.dateOfBirth || '',
      callbackUrl: body.callbackUrl || 'https://baq.ec/api/didit-callback',
      redirectUrl: body.redirectUrl || 'https://baq.ec/kyc-success'
    };

    console.log('📦 === PAYLOAD PARA DIDIT ===');
    console.log('📋 Payload completo:', JSON.stringify(diditPayload, null, 2));
    console.log('🔗 URL de destino:', `${DIDIT_BASE_URL}/v1/kyc/start`);
    console.log('📋 Headers a enviar:', {
      'Authorization': `Bearer ${DIDIT_API_KEY}`,
      'Content-Type': 'application/json'
    });

    console.log('🖥️ === COMANDO CURL PARA DIDIT ===');
    const curlCommand = `curl -X 'POST' '${DIDIT_BASE_URL}/v1/kyc/start' -H 'Authorization: Bearer ${DIDIT_API_KEY}' -H 'Content-Type: application/json' -d '${JSON.stringify(diditPayload)}'`;
    console.log(curlCommand);
    console.log('=====================================');

    // Realizar petición a Didit
    console.log('🌐 === ENVIANDO PETICIÓN A DIDIT ===');
    console.log('⏱️ Iniciando fetch...');

    let response;
    try {
      response = await fetch(`${DIDIT_BASE_URL}/v1/kyc/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DIDIT_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(diditPayload)
      });
    } catch (fetchError) {
      console.log('❌ ERROR DE CONEXIÓN:', fetchError.message);
      
      // Para testing, devolver una respuesta simulada
      if (fetchError.message.includes('ENOTFOUND') || fetchError.message.includes('fetch failed')) {
        console.log('🔄 === MODO SIMULACIÓN PARA TESTING ===');
        
        const simulatedResponse = {
          success: true,
          message: 'KYC iniciado exitosamente (simulado)',
          data: {
            kycId: `kyc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            status: 'PENDING',
            redirectUrl: 'https://baq.ec/kyc-success',
            verificationUrl: 'https://baq.ec/kyc-verification',
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
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
    console.log('- Redirect URL:', result.redirectUrl || 'No disponible');
    console.log('- Otros campos:', Object.keys(result).filter(key => !['kycId', 'id', 'status', 'redirectUrl'].includes(key)));
    console.log('========================================');

    return NextResponse.json({
      success: true,
      message: 'KYC iniciado exitosamente',
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.log('💥 === ERROR EN LA INTEGRACIÓN DIDIT ===');
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
    message: 'Endpoint para integración con Didit KYC',
    usage: {
      method: 'POST',
      endpoint: '/api/didit-kyc',
      requiredFields: ['firstName', 'lastName', 'email', 'documentType', 'documentNumber', 'country'],
      optionalFields: ['phone', 'dateOfBirth', 'callbackUrl', 'redirectUrl'],
      example: {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan.perez@email.com',
        documentType: 'CC',
        documentNumber: '12345678',
        country: 'CO',
        phone: '+573001234567',
        dateOfBirth: '1990-01-01'
      }
    }
  });
}
