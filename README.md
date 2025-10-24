# QuantumVerse - Hedera Integration Track

## Hedera Integration Summary

### Hedera Token Service (HTS)
We chose HTS for creating and managing both fungible tokens (Carbon credits) and non-fungible tokens (Physics and Quantum assets) because its programmable token features enable complex marketplace mechanics with built-in security and compliance, essential for a decentralized trading platform. HTS provides native support for NFT metadata, supply management, and transfer capabilities without requiring custom smart contracts, reducing development complexity while maintaining high security standards.

**Transaction Types:**
- TokenCreateTransaction (executed for Carbon fungible token, Physics NFT collection, and Quantum NFT collection)
- TokenMintTransaction (for minting new NFTs)
- TokenTransferTransaction (for trading and marketplace transactions)
- TokenAssociateTransaction (for wallet connections to tokens)

**Economic Justification:**
Hedera's low, predictable fees ($0.001 per HTS transaction) and high throughput (10,000 TPS) directly support financial sustainability in Africa by enabling micro-transactions for carbon credits and NFT trading without prohibitive costs. ABFT finality ensures instant transaction confirmation, building user trust and adoption in regions with limited banking infrastructure, where stable operational costs are critical for low-margin environmental and scientific marketplaces.

### Hedera Account Service
We chose Hedera Account Service for creating automated treasury and supply accounts because it provides secure, programmable account management with multi-signature capabilities, ensuring that token operations remain decentralized and resistant to single points of failure. This service enables the creation of dedicated accounts for token administration without manual intervention, streamlining the deployment process.

**Transaction Types:**
- AccountCreateTransaction (executed for supply account and treasury account during deployment)

**Economic Justification:**
With fees as low as $0.05 per account creation, Hedera's Account Service enables cost-effective setup of multi-account architectures in Africa, where infrastructure costs must be minimized. The service's ABFT consensus provides immediate account availability, supporting rapid onboarding of users and entities in emerging markets with unreliable connectivity, fostering economic inclusion through accessible decentralized finance tools.

### Hedera Consensus Service (HCS)
We chose HCS for immutable logging of AI entity activities, quantum entanglement events, and carbon verification records because its timestamped, tamper-proof consensus mechanism guarantees the integrity of off-chain data and events, which is crucial for verifiable environmental actions and AI interactions in a trust-minimized system. HCS topics serve as decentralized event logs for marketplace activities and identity verifications.

**Transaction Types:**
- TopicCreateTransaction (for creating consensus topics)
- TopicMessageSubmitTransaction (for logging events and messages)

**Economic Justification:**
HCS's $0.0001 per message fee and unlimited throughput make it economically viable for high-frequency logging in African contexts, where tracking environmental actions and AI interactions requires scalable, low-cost data persistence. ABFT finality ensures real-time event verification, enabling transparent carbon credit systems and identity management that can operate independently of traditional financial systems, promoting sustainable development and digital sovereignty.

## Deployment & Setup Instructions

- **Clone the Repository:**
  ```bash
  git clone https://github.com/Anuj-kumar-in/QuantumVerse
  cd QuantumVerse
  ```

- **Install Dependencies:**
  ```bash
  cd frontend
  npm install
  ```

- **Hedera Account Setup:**
  1. Create a Hedera testnet account at [portal.hedera.com](https://portal.hedera.com/)
  2. Obtain your Account ID, Public Key, and Private Key
  3. Install HashPack wallet extension for wallet connectivity

- **API Keys Setup:**
  - Obtain OpenAI, Groq, or Ollama API keys as needed
  - Create Pinata account for IPFS storage
  - Get WalletConnect Project ID

- **Deploy Smart Contracts:**
  Run the deployment script to create tokens and accounts on Hedera testnet:
  ```bash
  node frontend/src/scripts/deploy.js
  ```
  This generates contract IDs and keys in `.env.contracts`.

- **Environment Configuration:**
  Copy `.env.example` to `.env` and fill in your credentials, copying generated values from `.env.contracts`:
  ```env
  ACCOUNT_ID=your_hedera_account_id
  PUBLIC_KEY=your_public_key
  PRIVATE_KEY=your_private_key
  WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
  VITE_OPENAI_API_KEY=your_openai_api_key
  VITE_GROQ_API_KEY=your_groq_api_key
  VITE_PINATA_JWT=your_pinata_jwt
  VITE_QUANTUM_TOKEN_ID=0.0.xxxxxxx
  VITE_PHYSICS_TOKEN_ID=0.0.xxxxxxx
  VITE_CARBON_TOKEN_ID=0.0.xxxxxxx
  VITE_SUPPLY_PRIVATE_KEY=your_supply_private_key
  VITE_SUPPLY_PUBLIC_KEY=your_supply_public_key
  VITE_SUPPLY_ID=0.0.xxxxxxx
  VITE_TREASURY_PRIVATE_KEY=your_treasury_private_key
  VITE_TREASURY_PUBLIC_KEY=your_treasury_public_key
  VITE_TREASURY_ID=0.0.xxxxxxx
  ```

- **Start the Application:**
  ```bash
  npm run dev
  ```

**Running Environment:**
The React frontend runs on `http://localhost:5173` with Vite development server. Backend operations (smart contract interactions) execute directly on Hedera testnet via SDK calls. No separate backend server is required as all blockchain operations are handled client-side.

## Architecture Diagram

```
┌─────────────────┐       ┌──────────────────────┐       ┌─────────────────────┐
│   Frontend      │       │  Smart Contracts/    │       │  Hedera Network/    │
│   (React App)   │◄─────►│  Token Operations    │◄─────►│  Mirror Nodes       │
│                 │       │  (HTS, Account)      │       │                     │
│ - Wallet Connect│       │                      │       │ - Transaction       │
│ - NFT Minting   │       │ Data Flow:           │       │   Processing        │
│ - Marketplace   │       │ • Mint NFTs ───────►│       │ - Consensus         │
│ - AI Entities   │       │ • Transfer Tokens ──►│       │   Service (HCS)     │
│ - Carbon Credits│       │ • Query Balances ───►│       │ - Token Queries     │
└─────────────────┘       │ • Log Events ───────►│       └─────────────────────┘
                          └──────────────────────┘
```

Data flows from Frontend to Smart Contracts for transaction execution (minting, trading), then to Hedera Network for consensus and finality. Mirror Nodes provide read access for balances, transaction history, and metadata queries. HCS topics receive event logs for AI activities and carbon verifications.

## Deployed Hedera IDs

- **HTS Token IDs:**
  - Quantum NFT Token ID: 0.0.xxxxxxx (generated during deployment)
  - Physics NFT Token ID: 0.0.xxxxxxx (generated during deployment)
  - Carbon Fungible Token ID: 0.0.xxxxxxx (generated during deployment)

- **Hedera Account IDs:**
  - Supply Account ID: 0.0.xxxxxxx (generated during deployment)
  - Treasury Account ID: 0.0.xxxxxxx (generated during deployment)
  - Admin Account ID: [Your Hedera Account ID]

- **HCS Topic IDs:**
  - AI Entity Activity Topic: [To be created programmatically]
  - Carbon Verification Topic: [To be created programmatically]
  - Quantum Entanglement Topic: [To be created programmatically]

**Note:** Specific IDs are generated during the deployment script execution. The `.env.contracts` file contains the exact values after running `deploy.js`.