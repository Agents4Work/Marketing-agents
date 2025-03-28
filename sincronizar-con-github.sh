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

echo -e "${YELLOW}Sincronizando con GitHub...${NC}"

# Verificar si git está instalado
if ! command -v git &> /dev/null; then
    echo -e "${RED}Git no está instalado. Instalando...${NC}"
    pkg install git
fi

# Configurar git si no está configurado
if [ -z "$(git config --global user.email)" ]; then
    echo -e "${YELLOW}Configurando git...${NC}"
    git config --global user.email "replit@agents4work.com"
    git config --global user.name "Replit Agent"
fi

# Guardar cambios actuales
echo -e "${YELLOW}Guardando cambios locales...${NC}"
git add .
git commit -m "Cambios desde Replit: $(date +%Y%m%d-%H%M%S)"

# Obtener cambios remotos
echo -e "${YELLOW}Obteniendo cambios remotos...${NC}"
git pull origin main --no-edit

# Subir cambios
echo -e "${YELLOW}Subiendo cambios a GitHub...${NC}"
git push origin main

echo -e "${GREEN}¡Sincronización completada!${NC}"

echo
echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}            Proceso completado${NC}"
echo -e "${BLUE}================================================${NC}"