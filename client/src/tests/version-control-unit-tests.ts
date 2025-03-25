/**
 * Pruebas Unitarias para el Sistema de Identificación de Agentes con Control de Versiones
 * 
 * Este archivo contiene pruebas unitarias para validar la funcionalidad del sistema
 * de control de versiones de agentes, incluyendo validación de formato de versiones,
 * comparación, compatibilidad y otras funcionalidades clave.
 */

import { 
  isValidVersion, 
  compareVersions, 
  bumpVersion, 
  getCompatibleVersion 
} from '../types/agent-version';

/**
 * Función de ayuda para ejecutar pruebas
 */
function runTest(testName: string, testFn: () => boolean): void {
  try {
    const result = testFn();
    if (result) {
      console.log(`✅ ${testName}: Prueba exitosa`);
    } else {
      console.error(`❌ ${testName}: Prueba fallida`);
    }
  } catch (error) {
    console.error(`❌ ${testName}: Error - ${(error as Error).message}`);
  }
}

/**
 * Pruebas para validación de formato de versión
 */
function testVersionFormatValidation() {
  runTest('Formato Válido - Estándar', () => {
    return isValidVersion('1.0.0') === true;
  });

  runTest('Formato Válido - Pre-release', () => {
    return isValidVersion('1.0.0-beta.1') === true;
  });

  runTest('Formato Inválido - Solo números', () => {
    return isValidVersion('100') === false;
  });

  runTest('Formato Inválido - Letras mezcladas', () => {
    return isValidVersion('1.a.0') === false;
  });

  runTest('Formato Inválido - Vacío', () => {
    return isValidVersion('') === false;
  });
}

/**
 * Pruebas para comparación de versiones
 */
function testVersionComparison() {
  runTest('Comparación - Mayor', () => {
    return compareVersions('2.0.0', '1.0.0') > 0;
  });

  runTest('Comparación - Menor', () => {
    return compareVersions('1.0.0', '1.1.0') < 0;
  });

  runTest('Comparación - Igual', () => {
    return compareVersions('1.0.0', '1.0.0') === 0;
  });

  runTest('Comparación - Minor mayor', () => {
    return compareVersions('1.2.0', '1.1.9') > 0;
  });

  runTest('Comparación - Patch mayor', () => {
    return compareVersions('1.0.2', '1.0.1') > 0;
  });

  runTest('Comparación - Pre-release', () => {
    return compareVersions('1.0.0', '1.0.0-beta.1') > 0;
  });

  runTest('Comparación - Pre-release ordenadas', () => {
    return compareVersions('1.0.0-beta.2', '1.0.0-beta.1') > 0;
  });
}

/**
 * Pruebas para incrementar versión
 */
function testVersionBumping() {
  runTest('Increment - Patch', () => {
    return bumpVersion('1.0.0', 'patch') === '1.0.1';
  });

  runTest('Increment - Minor', () => {
    return bumpVersion('1.0.0', 'minor') === '1.1.0';
  });

  runTest('Increment - Major', () => {
    return bumpVersion('1.0.0', 'major') === '2.0.0';
  });

  runTest('Increment - Minor resetea Patch', () => {
    return bumpVersion('1.0.5', 'minor') === '1.1.0';
  });

  runTest('Increment - Major resetea Minor y Patch', () => {
    return bumpVersion('1.2.3', 'major') === '2.0.0';
  });

  runTest('Increment - Pre-release a Release', () => {
    return bumpVersion('1.0.0-beta.1', 'release') === '1.0.0';
  });
}

/**
 * Pruebas para determinar versión compatible
 */
function testCompatibleVersion() {
  runTest('Compatible - Versión exacta disponible', () => {
    const requestedVersion = '1.0.0';
    const availableVersions = ['1.0.0', '1.1.0', '2.0.0'];
    const compatibilityMap = {};
    
    return getCompatibleVersion(
      requestedVersion, 
      availableVersions, 
      compatibilityMap
    ) === '1.0.0';
  });

  runTest('Compatible - Versión compatible vía mapa', () => {
    const requestedVersion = '1.0.0';
    const availableVersions = ['1.1.0', '2.0.0'];
    const compatibilityMap = {
      '1.1.0': ['1.0.0']
    };
    
    return getCompatibleVersion(
      requestedVersion, 
      availableVersions, 
      compatibilityMap
    ) === '1.1.0';
  });

  runTest('Compatible - Versión más reciente compatible', () => {
    const requestedVersion = '1.0.0';
    const availableVersions = ['1.1.0', '1.2.0', '2.0.0'];
    const compatibilityMap = {
      '1.1.0': ['1.0.0'],
      '1.2.0': ['1.0.0', '1.1.0']
    };
    
    return getCompatibleVersion(
      requestedVersion, 
      availableVersions, 
      compatibilityMap
    ) === '1.2.0';
  });

  runTest('Compatible - Sin versión compatible', () => {
    const requestedVersion = '1.0.0';
    const availableVersions = ['2.0.0', '3.0.0'];
    const compatibilityMap = {};
    
    return getCompatibleVersion(
      requestedVersion, 
      availableVersions, 
      compatibilityMap
    ) === null;
  });
}

/**
 * Función principal para ejecutar todas las pruebas
 */
export function runAllVersionControlTests() {
  console.log('🧪 Iniciando pruebas de control de versiones');
  
  console.log('\n📋 Pruebas de validación de formato de versión:');
  testVersionFormatValidation();
  
  console.log('\n📋 Pruebas de comparación de versiones:');
  testVersionComparison();
  
  console.log('\n📋 Pruebas de incremento de versión:');
  testVersionBumping();
  
  console.log('\n📋 Pruebas de compatibilidad de versiones:');
  testCompatibleVersion();
  
  console.log('\n🏁 Pruebas de control de versiones completadas\n');
}

// Si este archivo se ejecuta directamente, ejecutar las pruebas
if (typeof require !== 'undefined' && require.main === module) {
  runAllVersionControlTests();
}