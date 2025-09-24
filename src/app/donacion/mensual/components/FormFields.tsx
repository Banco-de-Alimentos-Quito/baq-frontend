import React from 'react';

interface ValidatedInputProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  placeholder?: string;
  required?: boolean;
  readOnly?: boolean;
  validation?: boolean | null;
  error?: string;
  touched?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
}

export function ValidatedInput({
  label,
  name,
  type = 'text',
  value,
  placeholder,
  required = false,
  readOnly = false,
  validation,
  error,
  touched,
  onChange,
  onBlur
}: ValidatedInputProps) {
  // Campos que deben tener placeholder más gris
  const greyPlaceholderFields = ['cedula', 'nombres', 'numero', 'correo', 'direccion', 'ciudad', 'cuenta'];
  const shouldHaveGreyPlaceholder = greyPlaceholderFields.includes(name);

  // Campos que no deben admitir espacios
  const noSpaceFields = ['numero', 'cedula', 'cuenta'];
  const shouldRestrictSpaces = noSpaceFields.includes(name);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;
    
    // Restringir espacios en campos específicos
    if (shouldRestrictSpaces) {
      inputValue = inputValue.replace(/\s/g, '');
    } else {
      // Para otros campos, limitar espacios consecutivos muy largos
      inputValue = inputValue.replace(/\s{4,}/g, '   '); // Máximo 3 espacios consecutivos
    }

    // Validación mejorada para correo
    if (name === 'correo') {
      // Prevenir múltiples @ consecutivos
      inputValue = inputValue.replace(/@@+/g, '@');
      // Limitar caracteres especiales después del dominio
      const parts = inputValue.split('@');
      if (parts.length > 2) {
        // Si hay más de un @, mantener solo los primeros dos
        inputValue = parts[0] + '@' + parts.slice(1).join('');
      }
    }

    // Modificar directamente el valor del target
    e.target.value = inputValue;
    
    // Llamar al onChange original
    onChange(e);
  };

  return (
    <div style={{ width: '100%', marginBottom: 8 }}>
      <label className="form-label" style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: '#2F3388' }}>
        {label}
      </label>
      <div style={{ position: 'relative', width: '100%' }}>
        <input
          type={type}
          name={name}
          required={required}
          readOnly={readOnly}
          value={value}
          onChange={handleInputChange}
          onBlur={onBlur}
          className={shouldHaveGreyPlaceholder ? 'grey-placeholder' : ''}
          style={{
            width: '100%',
            padding: 12,
            borderRadius: 8,
            border: '1px solid #ddd',
            fontSize: 16,
            color: '#222',
            paddingRight: validation !== null ? 50 : 12,
            background: readOnly ? '#f3f3f3' : '#fff',
            fontWeight: readOnly ? 700 : 'normal'
          }}
          placeholder={placeholder}
        />
        {validation === true && (
          <ValidationIcon type="success" />
        )}
        {validation === false && (
          <ValidationIcon type="error" />
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

interface ValidatedSelectProps {
  label: string;
  name: string;
  value: string;
  required?: boolean;
  options: { value: string; label: string }[];
  placeholder?: string;
  error?: string;
  touched?: boolean;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLSelectElement>) => void;
}

export function ValidatedSelect({
  label,
  name,
  value,
  required = false,
  options,
  placeholder = 'Selecciona una opción',
  error,
  touched,
  onChange,
  onBlur
}: ValidatedSelectProps) {
  return (
    <div style={{ width: '100%', marginBottom: 8 }}>
      <label className="form-label" style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: '#2F3388' }}>
        {label}
      </label>
      <select
        name={name}
        required={required}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        style={{
          width: '100%',
          padding: 12,
          borderRadius: 8,
          border: '1px solid #ddd',
          fontSize: 16,
          background: '#fff',
          color: value ? '#222' : '#bbb',
          fontWeight: value ? '600' : 'normal'
        }}
      >
        <option value="" style={{ color: '#bbb' }}>
          {placeholder}
        </option>
        {options.map(option => (
          <option key={option.value} value={option.value} style={{ color: '#222', fontWeight: '600' }}>
            {option.label}
          </option>
        ))}
      </select>
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

function ValidationIcon({ type }: { type: 'success' | 'error' }) {
  return (
    <div style={{
      position: 'absolute',
      right: 12,
      top: '50%',
      transform: 'translateY(-50%)',
      width: 24,
      height: 24,
      borderRadius: '50%',
      backgroundColor: type === 'success' ? '#22c55e' : '#ef4444',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: 14,
      fontWeight: 'bold'
    }}>
      {type === 'success' ? '✓' : '✕'}
    </div>
  );
}
