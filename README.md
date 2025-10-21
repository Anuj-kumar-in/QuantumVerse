# QuantumVerse

A decentralized marketplace for trading physics properties, quantum assets, and carbon credits as NFTs on the Hedera Hashgraph network. Experience the future of digital ownership where scientific concepts meet blockchain technology.

## 🌟 Features

- **Physics NFT Marketplace**: Trade NFTs representing fundamental physics forces (Gravity, Time, Weather, Matter, Energy, Space, Quantum Field)
- **Quantum Assets**: Unique digital assets with quantum properties and rarity levels
- **Carbon Credit System**: Tokenized carbon credits for environmental impact tracking
- **Hedera Integration**: Built on Hedera Hashgraph for fast, secure, and low-cost transactions
- **AI-Powered Features**: Multi-provider AI integration (OpenAI, Groq, Ollama) with autonomous AI entities
- **Wallet Connectivity**: HashConnect integration for seamless wallet interactions
- **IPFS Storage**: Decentralized metadata storage using Pinata IPFS service

## 🛠 Tech Stack

### Frontend
- **React 19** - Modern React with hooks and concurrent features
- **Vite** - Fast build tool and development server
- **TailwindCSS** - Utility-first CSS framework
- **Framer Motion** - Animation library for smooth interactions
- **Redux Toolkit** - State management
- **Styled Components** - CSS-in-JS styling

### Blockchain
- **Hedera SDK** - Official JavaScript SDK for Hedera Hashgraph
- **HashConnect** - Wallet connection protocol
- **Ethers.js** - Ethereum-compatible interactions

### AI & Storage
- **Multi-Provider AI** - OpenAI, Groq, and Ollama integration for AI entities
- **Hedera Agent Kit** - LangChain integration for autonomous AI agents
- **Pinata IPFS** - Decentralized file storage
- **Axios** - HTTP client for API interactions

### Development Tools
- **ESLint** - Code linting
- **Vite Plugin React** - React integration for Vite

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** - Package manager
- **Git** - Version control

### Hedera Account Setup
1. Create a Hedera testnet account at [portal.hedera.com](https://portal.hedera.com/)
2. Get your Account ID, Public Key, and Private Key

### Recommended Wallet
- **HashPack Wallet**: Install the [HashPack browser extension](https://www.hashpack.app/) for seamless Hedera wallet connectivity

### API Keys Required
- **AI Provider API Keys** (choose one or more):
  - **OpenAI API Key** - Get from [OpenAI Platform](https://platform.openai.com/api-keys)
  - **Groq API Key** - Get from [Groq Console](https://console.groq.com/keys)
  - **Ollama** - Install locally from [ollama.com](https://ollama.com/) (free)
- **Pinata JWT** - Create account at [pinata.cloud](https://pinata.cloud/)
- **WalletConnect Project ID** - Get from [walletconnect.com](https://walletconnect.com/)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Anuj-kumar-in/QuantumVerse
cd QuantumVerse
```

### 2. Install Dependencies
```bash
cd frontend
npm install
```

### 3. Deploy Smart Contracts

Deploy the smart contracts on Hedera testnet to generate contract IDs and keys:

```bash
node frontend/src/scripts/deploy.js
```

This will create the necessary tokens (Physics NFT, Quantum NFT, Carbon Token) and generate contract IDs and keys in `.env.contracts`.

### 4. Environment Configuration

#### Copy Environment Template
```bash
cp .env.example .env
```

#### Configure Environment Variables
Edit the `.env` file with your credentials. Some values (contract IDs and keys) will be copied from the generated `.env.contracts` file:

```env
# Hedera Testnet Configuration
ACCOUNT_ID=your_hedera_account_id
PUBLIC_KEY=your_public_key
PRIVATE_KEY=your_private_key

# WalletConnect
WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# AI Integration (choose your preferred provider)
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_GROQ_API_KEY=your_groq_api_key
VITE_OLLAMA_BASE_URL=http://localhost:11434

# IPFS Storage (Pinata)
VITE_PINATA_API_KEY=your_pinata_api_key
VITE_PINATA_SECRET_KEY=your_pinata_secret_key
VITE_PINATA_JWT=your_pinata_jwt

# Contract IDs (From .env.contracts after deployment)
VITE_QUANTUM_TOKEN_ID=0.0.xxxxxxx
VITE_PHYSICS_TOKEN_ID=0.0.xxxxxxx
VITE_CARBON_TOKEN_ID=0.0.xxxxxxx

# Supply and Treasury Keys (From .env.contracts after deployment)
VITE_SUPPLY_PRIVATE_KEY=your_supply_private_key
VITE_SUPPLY_PUBLIC_KEY=your_supply_public_key
VITE_SUPPLY_ID=0.0.xxxxxxx
VITE_TREASURY_PRIVATE_KEY=your_treasury_private_key
VITE_TREASURY_PUBLIC_KEY=your_treasury_public_key
VITE_TREASURY_ID=0.0.xxxxxxx
```

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📜 Available Scripts

### Frontend Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Deployment Script
- `node src/scripts/deploy.js` - Deploy contracts to Hedera testnet

## 🎮 Usage

### Connecting Wallet
1. Click "Connect Wallet" on the top navigation
2. Choose your preferred wallet (HashPack, Blade, etc.)
3. Approve the connection

### Browsing Marketplace
- View available Physics NFTs with their properties
- Filter by physics type, rarity, price range
- Sort by various criteria

### Minting NFTs
1. Navigate to "Mint NFT" section
2. Fill in NFT details (name, description, physics type, rarity)
3. Customize physics properties (optional)
4. Pay 10 HBAR minting fee
5. Confirm transaction

### Trading NFTs
1. Browse available NFTs for sale
2. Click "Buy" on desired NFT
3. Confirm payment transaction
4. NFT transfers to your wallet

### Additional Pages
- **Identity**: Manage your quantum-secured digital identity with post-quantum cryptography
- **Entanglement**: Create quantum correlations between Hedera NFTs across realities
- **Carbon**: Earn tokens for environmental actions with AI verification and blockchain rewards
- **AI Entities**: Create and manage autonomous AI agents with chat functionality

## 🏗 Project Structure

```
QuantumVerse/
├── frontend/
│   ├── public/                 # Static assets
│   │   └── image/              # Image assets
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── navbar.jsx      # Navigation component
│   │   │   └── sidebar.jsx     # Sidebar component
│   │   ├── hooks/              # Custom React hooks
│   │   │   ├── useHedera.js    # Hedera blockchain hook
│   │   │   └── useWallet.js    # Wallet connection hook
│   │   ├── pages/              # Page components
│   │   │   ├── AIEntities.jsx    # AI entities management with chat
│   │   │   ├── Carbon.jsx        # Carbon credits page
│   │   │   ├── Dashboard.jsx     # Main dashboard
│   │   │   ├── Identity.jsx      # Identity management page
│   │   │   ├── Marketplace.jsx   # Main marketplace page
│   │   │   └── Entanglement.jsx  # Quantum entanglement page
│   │   ├── scripts/            # Deployment and utility scripts
│   │   │   └── deploy.js       # Smart contract deployment
│   │   ├── App.jsx             # Main app component
│   │   ├── main.jsx            # App entry point
│   │   ├── App.css             # App-specific styles
│   │   └── index.css           # Global styles
│   ├── .env.example            # Environment template
│   ├── .env.contracts          # Generated contract configurations
│   ├── package.json            # Dependencies and scripts
│   ├── vite.config.js          # Vite configuration
│   └── eslint.config.js        # ESLint configuration
├── .gitignore
├── .gitattributes
└── README.md
```

## 🔧 Configuration

### Hedera Network
The project is configured for Hedera testnet by default. To use mainnet, update the client configuration in relevant files:

```javascript
const client = Client.forMainnet(); // Instead of Client.forTestnet()
```

### Physics NFT Properties
NFTs have the following customizable properties:
- **Magnitude**: Power level (10-1000+)
- **Duration**: Effect duration in seconds
- **Range**: Effect range in meters
- **Cooldown**: Time between uses in seconds
- **Energy Cost**: HBAR required to activate

### Rarity System
- **Common**: Basic properties
- **Uncommon**: Enhanced properties
- **Rare**: Superior properties
- **Epic**: Advanced properties
- **Legendary**: Elite properties
- **Mythic**: Ultimate properties

### AI Entities
The AI Entities feature allows users to create and manage autonomous AI agents with different personalities and capabilities:

- **Entity Types**: Companion, Guardian, Trader, Explorer, Creator, Scientist
- **AI Providers**: OpenAI, Groq, Ollama (local)
- **Autonomous Mode**: Entities can perform tasks automatically at set intervals
- **Chat Interface**: Direct interaction with AI entities
- **Hedera Consensus Service**: Activity logging on HCS topics
- **Leveling System**: Entities gain experience and level up through interactions

### Quantum Identity
Secure your digital presence with post-quantum cryptography and multi-reality verification:

- **Post-Quantum Security**: Cryptography resistant to quantum computer attacks
- **Quantum DNA**: Unique genetic sequence for identity verification
- **Multi-Reality Anchoring**: Identity synchronization across virtual, augmented, and physical realities
- **NFT-Based Identity**: Hedera NFT tokens representing quantum identities
- **Backup & Recovery**: Secure recovery phrases and quantum backups

### Quantum Entanglement
Link Hedera NFTs across realities using quantum correlation technology:

- **NFT Entanglement**: Create synchronized correlations between digital assets
- **Cross-Reality Sync**: Asset states synchronized across different realities
- **Strength Metrics**: Entanglement strength based on metadata and reality types
- **Hedera Topics**: Secure messaging and state synchronization via HCS
- **Partner Entanglements**: Link NFTs between different users

### Carbon Rewards
Earn tokens for real-world environmental actions with AI-powered verification:

- **AI Verification**: Gemini AI analyzes photos for environmental action validation
- **Action Types**: Recycling, public transit, energy saving, cleanup, planting, donations
- **Blockchain Rewards**: Verified actions recorded on Hedera network
- **Carbon Tracking**: Real-time CO₂ offset calculations and global impact metrics
- **Challenge System**: Community challenges with reward incentives

**Built with ❤️ for the decentralized future**