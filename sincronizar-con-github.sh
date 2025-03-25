#!/bin/bash
# Script para sincronizar el proyecto con GitHub
# Uso: bash sincronizar-con-github.sh [mensaje-commit]

# Colores para la salida
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # Sin color

# Banner
echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}   Sincronización con GitHub - Agents4Marketing${NC}"
echo -e "${BLUE}================================================${NC}"
echo

# Verificar si hay cambios pendientes
echo -e "${GREEN}Verificando cambios pendientes...${NC}"
git status -s

# Si se proporcionó un mensaje de commit, asumimos que queremos hacer commit
if [ ! -z "$1" ]; then
    echo -e "${GREEN}Preparando cambios para commit...${NC}"
    git add .
    
    echo -e "${GREEN}Creando commit con mensaje: ${YELLOW}$1${NC}"
    git commit -m "$1"
    
    echo -e "${GREEN}Intentando subir cambios a GitHub...${NC}"
    # Intentar sincronizar con GitHub - si falla, mostrar instrucciones
    if git push origin main; then
        echo -e "${GREEN}¡Sincronización exitosa!${NC}"
    else
        echo -e "${RED}No se pudieron subir los cambios automáticamente.${NC}"
        echo -e "${YELLOW}Posibles razones:${NC}"
        echo -e "1. Problemas de autenticación con GitHub"
        echo -e "2. Conflictos con cambios remotos"
        echo
        echo -e "${YELLOW}Recomendaciones:${NC}"
        echo -e "- Usa la interfaz de Replit para sincronizar (botón Git en la barra lateral)"
        echo -e "- O exporta tu proyecto como ZIP y súbelo manualmente a GitHub"
        echo -e "- Consulta el archivo exportar-a-github.md para más opciones"
    fi
else
    echo -e "${YELLOW}No se proporcionó mensaje de commit.${NC}"
    echo -e "Para hacer commit y sincronizar, ejecuta el script con un mensaje:"
    echo -e "${BLUE}bash sincronizar-con-github.sh \"Mensaje de commit\"${NC}"
fi

echo
echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}            Proceso completado${NC}"
echo -e "${BLUE}================================================${NC}"