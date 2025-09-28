# QuantumVerse Smart Contracts

## 🌌 Complete Hedera Smart Contract Suite

This package contains all smart contracts for the QuantumVerse quantum-secured multi-reality gaming ecosystem.

## 📦 Contents

### 🪙 Token Contracts
- `QuantumToken.sol` - Primary utility token (QUANTUM)
- `PhysicsToken.sol` - Physics governance token (PHYSICS)
- `CarbonToken.sol` - Environmental rewards token (CARBON)  
- `RealityToken.sol` - Multi-reality bridging token (REALITY)

### 🎨 NFT Contracts
- `PhysicsNFTCollection.sol` - Physics property NFTs collection

### 🔧 Core Contracts
- `QuantumEntanglementContract.sol` - Cross-reality asset synchronization
- `AIEntityContract.sol` - Autonomous AI entity management
- `CarbonRewardsContract.sol` - Environmental action verification

### 📚 Dependencies
- `HederaTokenService.sol` - Hedera Token Service interface
- `HederaResponseCodes.sol` - Response code constants
- `Bits.sol` - Bit manipulation library

## 🚀 Deployment

### Prerequisites
1. Hedera CLI installed
2. Testnet account with HBAR
3. Environment variables set:
   ```bash
   export HEDERA_NETWORK=testnet
   export HEDERA_OPERATOR_ID=0.0.YOUR_ACCOUNT_ID
   export HEDERA_OPERATOR_KEY=YOUR_PRIVATE_KEY
   ```

### Deploy All Contracts
```bash
chmod +x deploy.sh
./deploy.sh
```

### Manual Deployment
```bash
# Deploy tokens first
hedera contract deploy contracts/tokens/QuantumToken.sol --gas 3000000
hedera contract deploy contracts/tokens/PhysicsToken.sol --gas 3000000
hedera contract deploy contracts/tokens/CarbonToken.sol --gas 3000000
hedera contract deploy contracts/tokens/RealityToken.sol --gas 3000000

# Deploy NFT collection
hedera contract deploy contracts/nft/PhysicsNFTCollection.sol --gas 4000000

# Deploy core contracts with constructor parameters
hedera contract deploy contracts/core/QuantumEntanglementContract.sol --constructor-params "QUANTUM_TOKEN_ADDRESS" --gas 4000000
hedera contract deploy contracts/ai/AIEntityContract.sol --constructor-params "QUANTUM_TOKEN_ADDRESS,PHYSICS_TOKEN_ADDRESS" --gas 4000000
hedera contract deploy contracts/rewards/CarbonRewardsContract.sol --constructor-params "CARBON_TOKEN_ADDRESS,QUANTUM_TOKEN_ADDRESS" --gas 4000000
```

## 🔧 Configuration

After deployment, update your React app's `.env` file:

```env
# Token IDs (HTS addresses)
VITE_QUANTUM_TOKEN_ID=0.0.______
VITE_PHYSICS_TOKEN_ID=0.0.______
VITE_CARBON_TOKEN_ID=0.0.______
VITE_REALITY_TOKEN_ID=0.0.______
VITE_PHYSICS_NFT_COLLECTION_ID=0.0.______

# Contract addresses
VITE_QUANTUM_ENTANGLEMENT_CONTRACT=0.0.______
VITE_AI_ENTITY_CONTRACT=0.0.______
VITE_CARBON_REWARDS_CONTRACT=0.0.______
```

## 🧪 Testing

### Unit Tests
```bash
# Run contract tests
npx hardhat test

# Test specific contract
npx hardhat test test/QuantumToken.test.js
```

### Integration Tests
```bash
# Test full deployment flow
npm run test:integration
```

## 📊 Gas Estimates

| Contract | Deployment Gas | Function Gas Range |
|----------|----------------|-------------------|
| QuantumToken | 2.8M | 50K - 300K |
| PhysicsToken | 2.9M | 60K - 350K |
| CarbonToken | 2.7M | 45K - 280K |
| RealityToken | 3.1M | 70K - 400K |
| PhysicsNFTCollection | 3.8M | 80K - 500K |
| QuantumEntanglement | 3.6M | 100K - 600K |
| AIEntityContract | 4.2M | 120K - 800K |
| CarbonRewards | 3.9M | 90K - 650K |

## 🔒 Security

### Audit Checklist
- [x] Reentrancy protection
- [x] Integer overflow/underflow protection
- [x] Access control implementation
- [x] Input validation
- [x] State consistency checks
- [x] Emergency pause mechanisms

### Security Features
- Multi-signature requirements for critical functions
- Role-based access control
- Time-based restrictions
- Economic incentives for honest behavior
- Slashing conditions for malicious actions

## 📜 License

MIT License - See LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Write comprehensive tests
4. Submit pull request with detailed description

## 📞 Support

- Discord: [Join QuantumVerse Community]
- Documentation: [docs.quantumverse.game]
- Issues: [GitHub Issues]

---

**Built for the future of quantum gaming on Hedera Hashgraph** 🌌
