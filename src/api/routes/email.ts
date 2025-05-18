import { NextResponse } from 'next/server';
import { sendEmail, loadEmailTemplate } from '../service/emailService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, subject, template, data } = body;

    if (!to || !subject || !template) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Cargar el template y reemplazar las variables
    const htmlContent = loadEmailTemplate(template, data);

    // Enviar el correo
    const success = await sendEmail({
      to,
      subject,
      html: htmlContent,
    });

    if (!success) {
      return NextResponse.json(
        { error: 'Error al enviar el correo' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Correo enviado exitosamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en el endpoint de email:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 