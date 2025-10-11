import React, { useState, useRef, useEffect } from 'react';

interface GestorDonacionSelectorProps {
    label: string;
    name: string;
    value: string;
    required?: boolean;
    error?: string;
    touched?: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
}

// Lista de gestores de donación
const GESTORES_DONACION = [
    'BAQ',
    'DonaYa',
    'Redes Sociales',
];

export function GestorDonacionSelector({
    label,
    name,
    value,
    required = false,
    error,
    touched,
    onChange,
    onBlur
}: GestorDonacionSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredGestores, setFilteredGestores] = useState(GESTORES_DONACION);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Filtrar gestores basado en el término de búsqueda
    useEffect(() => {
        if (searchTerm) {
            const filtered = GESTORES_DONACION.filter(gestor =>
                gestor.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredGestores(filtered);
        } else {
            setFilteredGestores(GESTORES_DONACION);
        }
    }, [searchTerm]);

    // Cerrar dropdown al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setSearchTerm(newValue);
        setIsOpen(true);

        // Crear un evento sintético para el onChange del padre
        const syntheticEvent = {
            ...e,
            target: {
                ...e.target,
                name,
                value: newValue
            }
        } as React.ChangeEvent<HTMLInputElement>;

        onChange(syntheticEvent);
    };

    const handleGestorSelect = (gestor: string) => {
        setSearchTerm('');
        setIsOpen(false);

        // Crear un evento sintético para el onChange del padre
        const syntheticEvent = {
            target: {
                name,
                value: gestor
            }
        } as React.ChangeEvent<HTMLInputElement>;

        onChange(syntheticEvent);
    };

    const handleInputFocus = () => {
        setIsOpen(true);
    };

    const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        // Delay para permitir que el click en la lista se procese
        setTimeout(() => {
            setIsOpen(false);
            setSearchTerm('');
            onBlur(e);
        }, 150);
    };

    return (
        <div style={{ width: '100%', marginBottom: 8 }}>
            <label className="form-label" style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: '#2F3388' }}>
                {label}
            </label>

            <div style={{ position: 'relative' }} ref={dropdownRef}>
                <input
                    ref={inputRef}
                    type="text"
                    name={name}
                    required={required}
                    value={value}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    className="grey-placeholder"
                    style={{
                        width: '100%',
                        padding: 12,
                        borderRadius: 8,
                        border: '1px solid #ddd',
                        fontSize: 16,
                        color: '#222',
                        background: '#fff'
                    }}
                    placeholder="Buscar gestor de donación..."
                    autoComplete="off"
                />

                {/* Icono de búsqueda */}
                <div style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#666',
                    pointerEvents: 'none'
                }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="M21 21l-4.35-4.35"></path>
                    </svg>
                </div>

                {/* Dropdown de gestores de donación */}
                {isOpen && (
                    <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        backgroundColor: '#fff',
                        border: '1px solid #ddd',
                        borderTop: 'none',
                        borderRadius: '0 0 8px 8px',
                        maxHeight: 200,
                        overflowY: 'auto',
                        zIndex: 1000,
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}>
                        {filteredGestores.length > 0 ? (
                            filteredGestores.map((gestor, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleGestorSelect(gestor)}
                                    style={{
                                        padding: '12px',
                                        cursor: 'pointer',
                                        borderBottom: index < filteredGestores.length - 1 ? '1px solid #f0f0f0' : 'none',
                                        backgroundColor: gestor === value ? '#f0f8ff' : 'transparent',
                                        color: gestor === value ? '#2F3388' : '#333',
                                        fontWeight: gestor === value ? '600' : 'normal'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (gestor !== value) {
                                            e.currentTarget.style.backgroundColor = '#f8f9fa';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (gestor !== value) {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                        }
                                    }}
                                >
                                    {gestor}
                                </div>
                            ))
                        ) : (
                            <div style={{
                                padding: '12px',
                                color: '#666',
                                textAlign: 'center',
                                fontStyle: 'italic'
                            }}>
                                No se encontraron gestores de donación
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div style={{ marginTop: 2, minHeight: 14 }}>
                {touched && !value && required && (
                    <span style={{ color: '#e53e3e', fontSize: 11 }}>
                        Falta completar este campo
                    </span>
                )}
                {error && (
                    <span style={{ color: '#e53e3e', fontSize: 11 }}>
                        {error}
                    </span>
                )}
            </div>
        </div>
    );
}