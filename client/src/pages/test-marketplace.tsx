import React from 'react';
import AgentMarketplace from './AgentMarketplace';

export default function TestMarketplacePage() {
  return (
    <div className="h-screen w-full">
      <h1 className="text-3xl font-bold p-4 text-center bg-blue-100">Test Marketplace Page</h1>
      <div className="h-full w-full">
        <AgentMarketplace />
      </div>
    </div>
  );
}