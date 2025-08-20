import { useEffect, useRef } from "react";
import { iniciarDatos } from "../configuration/ppx.index";

interface PpxButtonProps {
  data: any;
  onMount?: () => void;
  autoTrigger?: boolean;
}

const PpxButton = ({ data, onMount, autoTrigger = false }: PpxButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isInitialized = useRef(false);

  const estiloBoton = {
    display: "inline-block",
    backgroundColor: "#FAFAFA",
    backgroundImage: "url(https://sandbox-paybox.pagoplux.com/img/pagar.png?v1)",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    height: "96px",
    width: "215px",
    border: "none",
    cursor: "pointer",
    backgroundSize: "contain",
    outline: "0",
    boxShadow: "0px 4px 8px rgba(0,0,0,0.1)",
    borderRadius: "12px",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  };

  const estiloBotonHover = {
    transform: "scale(1.05)",
    boxShadow: "0px 6px 12px rgba(0,0,0,0.15)",
  };

  useEffect(() => {
    if (data && !isInitialized.current) {
      // Generar y almacenar user_id si no existe
      if (typeof window !== 'undefined') {
        let userId = localStorage.getItem('user_id');
        if (!userId) {
          userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem('user_id', userId);
        }
      }

      iniciarDatos(data);
      isInitialized.current = true;

      // Si onMount está definido, ejecutarlo después de inicializar
      if (onMount) {
        setTimeout(() => {
          onMount();
        }, 100);
      }

      // Si autoTrigger está activado, hacer click automáticamente
      if (autoTrigger && buttonRef.current) {
        setTimeout(() => {
          buttonRef.current?.click();
        }, 500);
      }
    }
  }, [data, onMount, autoTrigger]);

  const handleClick = () => {
    console.log("Botón PagoPlux clickeado");
    // El click activará la integración de PagoPlux configurada en iniciarDatos
  };

  return (
    <div className="flex flex-col items-center">
      <div id="modalPaybox"></div>
      <button 
        ref={buttonRef}
        style={estiloBoton}
        id="pay" 
        type="submit"
        onClick={handleClick}
        onMouseEnter={(e) => {
          Object.assign(e.currentTarget.style, estiloBotonHover);
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0px 4px 8px rgba(0,0,0,0.1)";
        }}
        data-ppx-button
        title="Pagar con PagoPlux"
        className="hover:animate-pulse"
      />
      <p className="text-xs text-gray-500 mt-2 text-center">
        Botón seguro de PagoPlux
      </p>
    </div>
  );
};

export default PpxButton;