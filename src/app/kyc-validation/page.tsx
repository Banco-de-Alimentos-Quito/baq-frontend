'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import { CheckCircle, Clock, CreditCard, AlertTriangle, Home, Search } from 'lucide-react';

export default function KYCValidationPage() {
    useEffect(() => {
        toast.success('KYC completado exitosamente', {
            description: 'Tu información está siendo procesada',
            duration: 4000,
        });
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl">
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-6">
                        <div className="flex items-center justify-center">
                            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mr-4">
                                <CheckCircle className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-2xl font-semibold text-white">
                                Verificación Completada
                            </h1>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                        {/* Main Message */}
                        <div className="text-center mb-8">
                            <h2 className="text-xl font-medium text-slate-900 mb-4">
                                Gracias por completar nuestro proceso de verificación
                            </h2>
                            <div className="max-w-2xl mx-auto">
                                <p className="text-slate-600 leading-relaxed">
                                    En estos momentos validaremos toda la información. En caso de ser exitosa,
                                    procederemos con el débito. Caso contrario, te notificaremos.
                                </p>
                            </div>
                        </div>

                        {/* Process Timeline */}
                        <div className="mb-8">
                            <h3 className="text-lg font-medium text-slate-900 mb-6">Proceso de validación</h3>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="relative">
                                    <div className="flex items-center mb-3">
                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                        </div>
                                        <span className="font-medium text-slate-900">Documentación recibida</span>
                                    </div>
                                    <p className="text-sm text-slate-500 ml-11">
                                        Todos los documentos han sido enviados correctamente
                                    </p>
                                </div>

                                <div className="relative">
                                    <div className="flex items-center mb-3">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                            <Clock className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <span className="font-medium text-slate-900">En revisión</span>
                                    </div>
                                    <p className="text-sm text-slate-500 ml-11">
                                        Tiempo estimado: 24-48 horas
                                    </p>
                                </div>

                                <div className="relative">
                                    <div className="flex items-center mb-3">
                                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center mr-3">
                                            <CreditCard className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <span className="font-medium text-slate-400">Procesamiento</span>
                                    </div>
                                    <p className="text-sm text-slate-400 ml-11">
                                        Débito automático si es aprobado
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Status Details */}
                        <div className="bg-slate-50 rounded-lg p-6 mb-8">
                            <h3 className="text-lg font-medium text-slate-900 mb-4">Estado de la verificación</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between py-2 border-b border-slate-200 last:border-b-0">
                                    <span className="text-slate-700">Documento de identidad</span>
                                    <span className="text-green-600 font-medium text-sm">Completado</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-slate-200 last:border-b-0">
                                    <span className="text-slate-700">Verificación biométrica</span>
                                    <span className="text-green-600 font-medium text-sm">Completado</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-slate-200 last:border-b-0">
                                    <span className="text-slate-700">Comprobante de domicilio</span>
                                    <span className="text-green-600 font-medium text-sm">Completado</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-slate-200 last:border-b-0">
                                    <span className="text-slate-700">Validación final</span>
                                    <span className="text-blue-600 font-medium text-sm">En proceso</span>
                                </div>
                            </div>
                        </div>

                        {/* Important Information */}
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
                            <div className="flex items-start">
                                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
                                <div>
                                    <h4 className="font-medium text-amber-900 mb-2">
                                        Información importante
                                    </h4>
                                    <ul className="text-sm text-amber-800 space-y-1">
                                        <li>• Recibirás una notificación por correo electrónico con el resultado</li>
                                        <li>• El débito se procesará automáticamente si la validación es exitosa</li>
                                        <li>• En caso de problemas, nuestro equipo te contactará directamente</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-center">
                            <button
                                onClick={() => window.location.href = '/'}
                                className="bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center"
                            >
                                <Home className="w-4 h-4 mr-2" />
                                Volver al inicio
                            </button>
                        </div>

                        {/* Footer */}
                        <div className="mt-8 pt-6 border-t border-slate-200 text-center">
                            <p className="text-sm text-slate-500">
                                ¿Necesitas ayuda? Contáctanos en{' '}
                                <a href="mailto:soporte@baq.ec" className="text-slate-900 hover:underline font-medium">
                                    soporte@baq.ec
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
