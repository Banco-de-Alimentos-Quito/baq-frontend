import React, { useState, useRef, useEffect } from 'react';

interface BankSelectorProps {
    label: string;
    name: string;
    value: string;
    required?: boolean;
    error?: string;
    touched?: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
}

// Lista de bancos y cooperativas de Ecuador
const ECUADORIAN_BANKS = [
    'Banco Pichincha',
    'Banco Guayaquil',
    'Banco del Pacífico',
    'Produbanco',
    'Banco Internacional',
    'Banco Bolivariano',
    'Banco de Loja',
    'Banco General Rumiñahui',
    'Banco Amazonas',
    'Banco Solidario',
    'Banco Machala',
    'Banco ProCredit',
    'Cooperativa JEP',
    'Cooperativa Policía Nacional',
    'Cooperativa 29 de Octubre',
    'Cooperativa Alianza del Valle',
    'Cooperativa Andalucía',
    'Cooperativa Oscus',
    'Cooperativa Cooprogreso'
];

export function BankSelector({
    label,
    name,
    value,
    required = false,
    error,
    touched,
    onChange,
    onBlur
}: BankSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredBanks, setFilteredBanks] = useState(ECUADORIAN_BANKS);
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [customBank, setCustomBank] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Filtrar bancos basado en el término de búsqueda
    useEffect(() => {
        if (searchTerm) {
            const filtered = ECUADORIAN_BANKS.filter(bank =>
                bank.toLowerCase().includes(searchTerm.toLowerCase())
            );
            // Siempre incluir "Otra" al final
            setFilteredBanks([...filtered, 'Otra']);
        } else {
            // Siempre incluir "Otra" al final
            setFilteredBanks([...ECUADORIAN_BANKS, 'Otra']);
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

    const handleBankSelect = (bank: string) => {
        setSearchTerm('');
        setIsOpen(false);

        if (bank === 'Otra') {
            setShowCustomInput(true);
            setCustomBank('');
        } else {
            setShowCustomInput(false);
            setCustomBank('');

            // Crear un evento sintético para el onChange del padre
            const syntheticEvent = {
                target: {
                    name,
                    value: bank
                }
            } as React.ChangeEvent<HTMLInputElement>;

            onChange(syntheticEvent);
        }
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

    const handleCustomBankChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setCustomBank(newValue);

        // Crear un evento sintético para el onChange del padre
        const syntheticEvent = {
            target: {
                name,
                value: newValue
            }
        } as React.ChangeEvent<HTMLInputElement>;

        onChange(syntheticEvent);
    };

    const handleCustomBankBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        onBlur(e);
    };

    return (
        <div style={{ width: '100%', marginBottom: 8 }}>
            <label className="form-label" style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: '#2F3388' }}>
                {label}
            </label>

            {showCustomInput ? (
                <div>
                    <input
                        type="text"
                        name={name}
                        required={required}
                        value={customBank}
                        onChange={handleCustomBankChange}
                        onBlur={handleCustomBankBlur}
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
                        placeholder="Escribe tu banco o cooperativa..."
                        autoComplete="off"
                    />
                    <button
                        type="button"
                        onClick={() => {
                            setShowCustomInput(false);
                            setCustomBank('');
                            // Reset to Banco Pichincha
                            const syntheticEvent = {
                                target: {
                                    name,
                                    value: 'Banco Pichincha'
                                }
                            } as React.ChangeEvent<HTMLInputElement>;
                            onChange(syntheticEvent);
                        }}
                        style={{
                            marginTop: 8,
                            padding: '6px 12px',
                            fontSize: 12,
                            color: '#666',
                            background: 'transparent',
                            border: '1px solid #ddd',
                            borderRadius: 4,
                            cursor: 'pointer'
                        }}
                    >
                        ← Volver a la lista
                    </button>
                </div>
            ) : (
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
                        placeholder="Buscar banco o cooperativa..."
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

                    {/* Dropdown de bancos */}
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
                            {filteredBanks.length > 0 ? (
                                filteredBanks.map((bank, index) => (
                                    <div
                                        key={index}
                                        onClick={() => handleBankSelect(bank)}
                                        style={{
                                            padding: '12px',
                                            cursor: 'pointer',
                                            borderBottom: index < filteredBanks.length - 1 ? '1px solid #f0f0f0' : 'none',
                                            backgroundColor: bank === value ? '#f0f8ff' : 'transparent',
                                            color: bank === value ? '#2F3388' : '#333',
                                            fontWeight: bank === value ? '600' : 'normal'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (bank !== value) {
                                                e.currentTarget.style.backgroundColor = '#f8f9fa';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (bank !== value) {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                            }
                                        }}
                                    >
                                        {bank}
                                    </div>
                                ))
                            ) : (
                                <div style={{
                                    padding: '12px',
                                    color: '#666',
                                    textAlign: 'center',
                                    fontStyle: 'italic'
                                }}>
                                    No se encontraron bancos
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

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
