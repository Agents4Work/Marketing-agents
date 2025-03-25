/**
 * Script para ejecutar pruebas del Sistema de Identificación de Agentes con Control de Versiones
 * 
 * Este script ejecuta todas las pruebas unitarias y de integración para verificar
 * el correcto funcionamiento del sistema de control de versiones.
 */

import { runAllVersionControlTests } from './version-control-unit-tests';
import { runAllIntegrationTests } from './version-control-integration-tests';

async function runAllTests() {
  console.log('🔍 PRUEBAS DEL SISTEMA DE IDENTIFICACIÓN DE AGENTES CON CONTROL DE VERSIONES');
  console.log('==================================================================');
  
  console.log('\n\n📌 PRUEBAS UNITARIAS');
  console.log('------------------');
  runAllVersionControlTests();
  
  console.log('\n\n📌 PRUEBAS DE INTEGRACIÓN');
  console.log('----------------------');
  await runAllIntegrationTests();
  
  console.log('\n\n✨ TODAS LAS PRUEBAS COMPLETADAS');
}

// Ejecutar pruebas
runAllTests().catch(error => {
  console.error('❌ Error al ejecutar las pruebas:', error);
  process.exit(1);
});