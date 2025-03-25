import React from 'react';
import LocalChatTest from '@/components/LocalChatTest';

export default function ChatTestPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Test de Conversaciones (LocalStorage)</h1>
      <p className="text-gray-600 mb-6">
        Esta versión utiliza localStorage para persistir las conversaciones mientras resolvemos los problemas con la integración de Firestore.
        Las conversaciones se guardarán en tu navegador y podrás acceder a ellas en futuras sesiones.
      </p>
      <LocalChatTest />
    </div>
  );
}