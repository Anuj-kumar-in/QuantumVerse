import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx'
import { HederaProvider } from './contexts/HederaContext'
import { PhysicsProvider } from './contexts/PhysicsContext'
import { QuantumProvider } from './contexts/QuantumContext'
import { initializeHederaClient } from './services/hedera/client.ts'
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

