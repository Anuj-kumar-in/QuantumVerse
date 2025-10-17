# QuantumVerse

A decentralized marketplace for trading physics properties, quantum assets, and carbon credits as NFTs on the Hedera Hashgraph network. Experience the future of digital ownership where scientific concepts meet blockchain technology.

## 🌟 Features

- **Physics NFT Marketplace**: Trade NFTs representing fundamental physics forces (Gravity, Time, Weather, Matter, Energy, Space, Quantum Field)
- **Quantum Assets**: Unique digital assets with quantum properties and rarity levels
- **Carbon Credit System**: Tokenized carbon credits for environmental impact tracking
- **Hedera Integration**: Built on Hedera Hashgraph for fast, secure, and low-cost transactions
- **AI-Powered Features**: Gemini AI integration for enhanced user experiences
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
- **Google Generative AI** - AI-powered features
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
- **Gemini API Key** - Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
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

# AI Integration
VITE_GEMINI_API_KEY=your_gemini_api_key

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
- **Identity**: Manage your digital identity and profiles
- **Entanglement**: Explore quantum entanglement features
- **Carbon**: Trade and manage carbon credits

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
│   │   │   ├── Marketplace.jsx  # Main marketplace page
│   │   │   ├── Carbon.jsx       # Carbon credits page
│   │   │   ├── Identity.jsx     # Identity management page
│   │   │   └── Entanglement.jsx # Quantum entanglement page
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




**Built with ❤️ for the decentralized future**