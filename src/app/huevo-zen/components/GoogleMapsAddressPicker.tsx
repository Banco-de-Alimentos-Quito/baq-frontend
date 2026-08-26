"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  MapPin,
  Navigation,
  Search,
  Check,
  AlertCircle,
  ExternalLink,
  Loader2,
  X,
} from "lucide-react";

interface GoogleMapsAddressPickerProps {
  direccion: string;
  onDireccionChange: (direccion: string) => void;
  onGoogleMapsUrlChange: (url: string) => void;
  error?: string;
}

// Coordenadas centrales por defecto (Quito, Ecuador)
const DEFAULT_LAT = -0.180653;
const DEFAULT_LNG = -78.467838;

// Límites geográficos estrictos del Distrito Metropolitano de Quito (DMQ)
// Incluye: Centro, Norte (Calderón, San Antonio), Sur (Guamaní, Quitumbe) y Valles (Cumbayá, Tumbaco, Los Chillos)
const QUITO_BOUNDS_SW: [number, number] = [-0.4500, -78.6200]; // Suroeste
const QUITO_BOUNDS_NE: [number, number] = [0.0800, -78.2800];  // Noreste

// Función para verificar si un punto está dentro de Quito
const isInsideQuito = (lat: number, lng: number): boolean => {
  return (
    lat >= QUITO_BOUNDS_SW[0] &&
    lat <= QUITO_BOUNDS_NE[0] &&
    lng >= QUITO_BOUNDS_SW[1] &&
    lng <= QUITO_BOUNDS_NE[1]
  );
};

interface Suggestion {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
}

export function GoogleMapsAddressPicker({
  direccion,
  onDireccionChange,
  onGoogleMapsUrlChange,
  error,
}: GoogleMapsAddressPickerProps) {
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: DEFAULT_LAT,
    lng: DEFAULT_LNG,
  });
  const [isLocating, setIsLocating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string>(
    "Ubicación en Quito"
  );
  const [coverageWarning, setCoverageWarning] = useState<string | null>(null);

  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const leafletMarkerRef = useRef<any>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generar URL oficial de Google Maps
  const updateMapsUrl = useCallback(
    (lat: number, lng: number) => {
      const mapsUrl = `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
      onGoogleMapsUrlChange(mapsUrl);
    },
    [onGoogleMapsUrlChange]
  );

  // Geocodificación inversa para obtener nombre de calle en Quito
  const reverseGeocode = async (
    lat: number,
    lng: number,
    forceUpdate = false
  ) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.display_name) {
          setLocationStatus(`Ubicación: ${data.display_name.slice(0, 50)}...`);
          if (forceUpdate || !direccion) {
            onDireccionChange(data.display_name);
            setSearchQuery(data.display_name);
          }
        }
      }
    } catch (e) {
      console.warn("Geocoding reverse info:", e);
    }
  };

  // Cargar geolocalización actual del navegador (verificando que esté dentro de Quito)
  const getCurrentLocation = useCallback(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocationStatus("Tu navegador no soporta geolocalización automática.");
      return;
    }

    setIsLocating(true);
    setLocationStatus("Detectando tu ubicación actual en Quito...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;

        if (!isInsideQuito(userLat, userLng)) {
          setCoverageWarning(
            "Tu ubicación actual está fuera de Quito. Selecciona un punto dentro del mapa de cobertura."
          );
          setCoords({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
          setIsLocating(false);
          setLocationStatus("Cobertura: Distrito Metropolitano de Quito");
          updateMapsUrl(DEFAULT_LAT, DEFAULT_LNG);
          return;
        }

        setCoverageWarning(null);
        setCoords({ lat: userLat, lng: userLng });
        setIsLocating(false);
        setLocationStatus("Ubicación actual detectada en Quito.");
        updateMapsUrl(userLat, userLng);

        if (leafletMapRef.current && leafletMarkerRef.current) {
          leafletMapRef.current.setView([userLat, userLng], 16);
          leafletMarkerRef.current.setLatLng([userLat, userLng]);
        }

        reverseGeocode(userLat, userLng, false);
      },
      (err) => {
        console.warn("Geolocation warning:", err.message);
        setIsLocating(false);
        setLocationStatus(
          "Puedes mover el pin en el mapa de Quito o buscar tu dirección."
        );
        updateMapsUrl(DEFAULT_LAT, DEFAULT_LNG);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [updateMapsUrl]);

  // Ejecutar solo una vez al montar
  useEffect(() => {
    getCurrentLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Inicializar Leaflet map delimitado estrictamente a Quito
  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      if (typeof window === "undefined" || !mapRef.current) return;

      // Cargar script de Leaflet si no está presente
      const loadLeaflet = async (): Promise<any> => {
        if ((window as any).L) return (window as any).L;

        return new Promise((resolve) => {
          const script = document.createElement("script");
          script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
          script.async = true;
          script.onload = () => resolve((window as any).L);
          document.body.appendChild(script);
        });
      };

      const L = await loadLeaflet();

      if (!L || !isMounted || !mapRef.current) return;

      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
      }

      // Icono clásico azul de Leaflet
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const classicBluePin = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      // Crear mapa restringido a los límites de Quito
      const quitoBounds = L.latLngBounds(QUITO_BOUNDS_SW, QUITO_BOUNDS_NE);

      const map = L.map(mapRef.current, {
        center: [coords.lat, coords.lng],
        zoom: 14,
        minZoom: 11, // Impide alejarse fuera de la región de Quito
        maxZoom: 19,
        maxBounds: quitoBounds, // Bloquea el mapa a los límites de Quito
        maxBoundsViscosity: 1.0, // Rebote inmediato si se intenta arrastrar fuera
        zoomControl: true,
      });
      leafletMapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Marcador interactivo arrastrable
      const marker = L.marker([coords.lat, coords.lng], {
        icon: classicBluePin,
        draggable: true,
        autoPan: true,
      }).addTo(map);
      leafletMarkerRef.current = marker;

      // Al terminar de arrastrar el pin (con validación de límites)
      marker.on("dragend", (e: any) => {
        const position = e.target.getLatLng();
        let newLat = position.lat;
        let newLng = position.lng;

        if (!isInsideQuito(newLat, newLng)) {
          // Revertir a la última posición válida dentro de Quito
          setCoverageWarning("El punto debe estar dentro del Distrito Metropolitano de Quito.");
          marker.setLatLng([coords.lat, coords.lng]);
          return;
        }

        setCoverageWarning(null);
        setCoords({ lat: newLat, lng: newLng });
        updateMapsUrl(newLat, newLng);
        setLocationStatus(
          `Pin fijado en: ${newLat.toFixed(5)}, ${newLng.toFixed(5)}`
        );
        reverseGeocode(newLat, newLng, true);
      });

      // Al hacer clic en cualquier punto del mapa (con validación de límites)
      map.on("click", (e: any) => {
        const clickLat = e.latlng.lat;
        const clickLng = e.latlng.lng;

        if (!isInsideQuito(clickLat, clickLng)) {
          setCoverageWarning("Por favor selecciona una ubicación dentro de Quito.");
          return;
        }

        setCoverageWarning(null);
        marker.setLatLng([clickLat, clickLng]);
        setCoords({ lat: clickLat, lng: clickLng });
        updateMapsUrl(clickLat, clickLng);
        setLocationStatus(
          `Pin fijado en: ${clickLat.toFixed(5)}, ${clickLng.toFixed(5)}`
        );
        reverseGeocode(clickLat, clickLng, true);
      });
    };

    initMap();

    return () => {
      isMounted = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Autocompletado en tiempo real restringido estrictamente al territorio de Quito
  const handleInputChange = (value: string) => {
    setSearchQuery(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!value || value.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        // Restricción geográfica con viewbox bounded a Quito
        const query = encodeURIComponent(`${value.trim()}, Quito, Ecuador`);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${query}&viewbox=${QUITO_BOUNDS_SW[1]},${QUITO_BOUNDS_NE[0]},${QUITO_BOUNDS_NE[1]},${QUITO_BOUNDS_SW[0]}&bounded=1&countrycodes=ec&limit=6&addressdetails=1`
        );
        if (res.ok) {
          const data: Suggestion[] = await res.json();
          // Filtrar resultados que estén estrictamente dentro del polígono de Quito
          const filtered = (data || []).filter((item) =>
            isInsideQuito(parseFloat(item.lat), parseFloat(item.lon))
          );
          setSuggestions(filtered);
          setShowSuggestions(filtered.length > 0);
        }
      } catch (err) {
        console.error("Error buscando sugerencias:", err);
      } finally {
        setIsSearching(false);
      }
    }, 350);
  };

  // Al seleccionar una sugerencia del autocompletar
  const handleSelectSuggestion = (suggestion: Suggestion) => {
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);

    if (!isInsideQuito(lat, lng)) {
      setCoverageWarning("La ubicación seleccionada está fuera de Quito.");
      return;
    }

    setCoverageWarning(null);
    setCoords({ lat, lng });
    updateMapsUrl(lat, lng);
    setSearchQuery(suggestion.display_name);
    onDireccionChange(suggestion.display_name);
    setShowSuggestions(false);
    setLocationStatus(`Ubicación: ${suggestion.display_name.slice(0, 50)}...`);

    if (leafletMapRef.current && leafletMarkerRef.current) {
      leafletMapRef.current.flyTo([lat, lng], 16, { duration: 1.2 });
      leafletMarkerRef.current.setLatLng([lat, lng]);
    }
  };

  const currentGoogleMapsUrl = `https://www.google.com/maps?q=${coords.lat.toFixed(6)},${coords.lng.toFixed(6)}`;

  return (
    <div className="space-y-3" ref={containerRef}>
      {/* Estilos embebidos para Leaflet garantizados */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <style jsx global>{`
        .leaflet-pane {
          z-index: 10 !important;
        }
        .leaflet-top,
        .leaflet-bottom {
          z-index: 20 !important;
        }
        .leaflet-marker-icon {
          cursor: grab !important;
        }
        .leaflet-marker-icon:active {
          cursor: grabbing !important;
        }
      `}</style>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <div className="flex items-center gap-2">
          <label className="block text-sm font-semibold text-gray-800">
            3. Ubicación y Dirección de Entrega
          </label>
          <span className="text-[11px] font-semibold bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
            Solo Quito y Valles
          </span>
        </div>
        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={isLocating}
          className="text-xs font-semibold text-[#ED6F1D] hover:text-orange-700 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Navigation
            className={`w-3.5 h-3.5 ${isLocating ? "animate-spin" : ""}`}
          />
          {isLocating ? "Detectando ubicación..." : "Usar mi ubicación actual"}
        </button>
      </div>

      {/* Buscador de dirección con Autocompletado en Quito */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            placeholder="Buscar calle o barrio en Quito (Ej: Av. Amazonas y Naciones Unidas)..."
            className="w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ED6F1D] focus:border-transparent text-gray-800 shadow-sm"
          />
          <div className="absolute right-3 flex items-center gap-1">
            {isSearching && (
              <Loader2 className="w-4 h-4 text-[#ED6F1D] animate-spin" />
            )}
            {searchQuery && !isSearching && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSuggestions([]);
                  setShowSuggestions(false);
                }}
                className="text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Dropdown de Recomendaciones / Autocomplete */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-2xl border border-gray-200 z-[600] overflow-hidden divide-y divide-gray-100 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150">
            {suggestions.map((item) => (
              <button
                key={item.place_id}
                type="button"
                onClick={() => handleSelectSuggestion(item)}
                className="w-full px-4 py-2.5 text-left text-xs sm:text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-900 transition-colors flex items-start gap-2.5 cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-[#ED6F1D] shrink-0 mt-0.5" />
                <span className="line-clamp-2 leading-relaxed">
                  {item.display_name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Alerta si el usuario intenta salir de Quito */}
      {coverageWarning && (
        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>{coverageWarning}</span>
        </div>
      )}

      {/* Contenedor del Mapa Interactivo restringido */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-gray-200 shadow-sm bg-gray-100 h-64 sm:h-72 z-0">
        <div ref={mapRef} className="w-full h-full" />

        {/* Indicador de ayuda sobre el mapa */}
        <div className="absolute top-2 left-2 z-[30] bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[11px] font-semibold text-gray-700 shadow-sm border border-gray-200 flex items-center gap-1.5 pointer-events-none">
          <MapPin className="w-3.5 h-3.5 text-[#ED6F1D]" />
          <span>Arrastra el pin dentro del mapa de Quito</span>
        </div>

        {/* Link directo de Google Maps */}
        <a
          href={currentGoogleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-2 right-2 z-[30] bg-white/95 hover:bg-white text-gray-800 text-[11px] font-semibold px-2.5 py-1 rounded-lg shadow-sm border border-gray-200 flex items-center gap-1 transition-all hover:text-[#ED6F1D]"
        >
          <span>Abrir en Google Maps</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Estado y coordenadas */}
      <div className="text-[11px] text-gray-500 flex items-center justify-between px-1">
        <span className="truncate">{locationStatus}</span>
        <span className="font-mono text-[10px] text-gray-400 shrink-0 ml-2">
          {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
        </span>
      </div>

      {/* Input de dirección textual */}
      <div>
        <label htmlFor="direccion" className="block text-xs font-medium text-gray-700 mb-1">
          Dirección Detallada y Referencias <span className="text-red-500">*</span>
        </label>
        <textarea
          id="direccion"
          name="street-address"
          autoComplete="street-address"
          rows={2}
          value={direccion}
          onChange={(e) => onDireccionChange(e.target.value)}
          placeholder="Ej: Av. Brasil N34-12 y Granda Centeno, Casa blanca portón negro, Timbre Depto 3B."
          className={`w-full p-2.5 text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ED6F1D] focus:border-transparent text-gray-800 resize-none ${
            error ? "border-red-500 ring-1 ring-red-500" : "border-gray-300"
          }`}
        />
        {error && (
          <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> {error}
          </p>
        )}
      </div>
    </div>
  );
}
