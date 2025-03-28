# Guía de Exportación a GitHub desde Replit

## Configuración Inicial

1. Abre el proyecto en Replit
2. En el panel izquierdo, haz clic en el icono de "Tools"
3. Selecciona "Git"
4. Conecta tu cuenta de GitHub si aún no lo has hecho

## Método 1: Usando el Script de Sincronización

1. Abre la terminal en Replit
2. Ejecuta el script de sincronización:
   ```bash
   bash sincronizar-con-github.sh
   ```
3. El script automáticamente:
   - Guardará tus cambios locales
   - Obtendrá cambios remotos
   - Subirá tus cambios a GitHub

## Método 2: Usando la Interfaz de Git de Replit

1. Haz clic en el icono de Git en la barra lateral
2. Verás los archivos modificados
3. Escribe un mensaje de commit
4. Haz clic en "Commit & Push"

## Método 3: Usando Comandos Git Manualmente

1. Abre la terminal
2. Añade tus cambios:
   ```bash
   git add .
   ```
3. Crea un commit:
   ```bash
   git commit -m "Descripción de tus cambios"
   ```
4. Sube los cambios:
   ```bash
   git push origin main
   ```

## Solución de Problemas

Si encuentras errores:

1. **Error de Autenticación**:
   - Verifica tu conexión con GitHub en Replit
   - Reconecta tu cuenta si es necesario

2. **Conflictos de Merge**:
   - Usa el script de sincronización que maneja esto automáticamente
   - O resuelve manualmente:
     ```bash
     git pull origin main
     # Resuelve conflictos
     git add .
     git commit -m "Resuelve conflictos"
     git push origin main
     ```

3. **Cambios no Guardados**:
   - Asegúrate de guardar todos los archivos antes de sincronizar
   - Usa Ctrl+S o Cmd+S para guardar

## Notas Importantes

- Siempre haz commit de tus cambios antes de cerrar Replit
- Sincroniza regularmente para evitar conflictos grandes
- Si tienes dudas, usa el script de sincronización automática
- Mantén una copia de seguridad de tus cambios importantes