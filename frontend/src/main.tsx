import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx'
import { HederaProvider } from './contexts/Ethereum/HederaContext.tsx'
import { PhysicsProvider } from './contexts/Ethereum/PhysicsContext.tsx'
import { QuantumProvider } from './contexts/Ethereum/QuantumContext.tsx'
import { initializeHederaClient } from './services/ethereum/client.ts'
console.log(initializeHederaClient(),"hii");
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HederaProvider>
      <PhysicsProvider>
        <QuantumProvider>
       <BrowserRouter>
      <App />
    </BrowserRouter>
        </QuantumProvider>
      </PhysicsProvider>
    </HederaProvider>
  </StrictMode>,
)

