import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Globe } from "lucide-react";
import { getCurrentLanguage, changeLanguage, translate, Language } from "../lib/language";

// Nueva implementación del selector de idioma que usa el sistema simple
export default function LanguageSelector() {
  // Estado local para el idioma actual (solo para UI)
  const [currentLang, setCurrentLang] = useState<Language>('en');
  // Estado para controlar visibilidad del menú
  const [isOpen, setIsOpen] = useState(false);
  
  // Cargar el idioma actual al montar el componente
  useEffect(() => {
    // Al inicializar, asegurarse de que tenemos el idioma correcto
    const lang = getCurrentLanguage();
    setCurrentLang(lang);
    document.documentElement.lang = lang;
  }, []);
  
  // Control de apertura/cierre del menú
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  // Manejador de cambio de idioma
  const handleLanguageChange = (lang: Language) => {
    if (lang !== currentLang) {
      console.log("Cambiando idioma a:", lang);
      changeLanguage(lang); // Esto recargará la página
    }
    setIsOpen(false);
  };
  
  // Cerrar menú cuando se hace clic fuera
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      const dropdown = document.getElementById("language-menu");
      if (dropdown && !dropdown.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" id="language-menu">
      <Button variant="ghost" size="icon" className="relative" onClick={toggleMenu}>
        <Globe className="h-5 w-5" />
        <span className="absolute -bottom-1 -right-1 w-4 h-4 flex items-center justify-center text-[10px] font-bold bg-primary text-white rounded-full">
          {currentLang === 'en' ? '🇺🇸' : '🇲🇽'}
        </span>
      </Button>
      
      {isOpen && (
        <div 
          className="absolute right-0 top-full mt-1 bg-white shadow-md rounded-md overflow-hidden z-50 border border-gray-200"
        >
          <button 
            onClick={() => handleLanguageChange('en')}
            className={`w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center ${currentLang === 'en' ? 'bg-secondary font-bold' : ''}`}
          >
            <span>🇺🇸</span> <span className="ml-2">{translate('english')}</span>
          </button>
          <button 
            onClick={() => handleLanguageChange('es')}
            className={`w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center ${currentLang === 'es' ? 'bg-secondary font-bold' : ''}`}
          >
            <span>🇲🇽</span> <span className="ml-2">{translate('spanish')}</span>
          </button>
        </div>
      )}
    </div>
  );
}