#!/bin/bash

# Colores para los mensajes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}==================================${NC}"
echo -e "${BLUE}   Iniciando Agents4Marketing${NC}"
echo -e "${BLUE}==================================${NC}"
echo

# Verificar si node_modules existe
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Instalando dependencias...${NC}"
    npm install
fi

# Verificar si dist existe
if [ ! -d "dist" ]; then
    echo -e "${YELLOW}Construyendo el proyecto...${NC}"
    npm run build
fi

# Iniciar el servidor
echo -e "${GREEN}Iniciando el servidor...${NC}"
npm run dev:simple 