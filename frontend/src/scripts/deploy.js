import {
    PrivateKey,
    Client,
    TokenCreateTransaction,
    TokenType,
    TokenSupplyType,
    AccountCreateTransaction,
    Hbar
} from "@hashgraph/sdk"
import  "dotenv/config"
import fs from'fs'

const client = Client.forTestnet();
const adminPvk = PrivateKey.fromStringECDSA(process.env.PRIVATE_KEY)
client.setOperator(process.env.ACCOUNT_ID,adminPvk)


const Token = async (name,symbol,client, AdminKey, TreasuryId,Treasurypvk, SupplyPuk) => {
    const TokenTxn = await new TokenCreateTransaction()
        .setTokenName(name)
        .setTokenSymbol(symbol)
        .setTokenType(TokenType.FungibleCommon)
        .setAdminKey(AdminKey.publicKey)
        .setDecimals(4)
        .setInitialSupply(100000000000)
        .setSupplyType(TokenSupplyType.Infinite)
        .setTreasuryAccountId(TreasuryId)
        .setSupplyKey(SupplyPuk) 
        .freezeWith(client)

    const TokenSign = await (await TokenTxn.sign(AdminKey)).sign(Treasurypvk)
    const TokenRes = await TokenSign.execute(client)
    const TokenRec = await TokenRes.getReceipt(client)
    
    return TokenRec.tokenId
}

const NFToken = async (name,symbol,client, AdminKey, TreasuryId,Treasurypvk, SupplyPuk) => {
    const TokenTxn = await new TokenCreateTransaction()
        .setTokenName(name)
        .setTokenSymbol(symbol)
        .setTokenType(TokenType.NonFungibleUnique)
        .setAdminKey(AdminKey.publicKey)
        .setDecimals(0)
        .setInitialSupply(0)
        .setTreasuryAccountId(TreasuryId)
        .setSupplyKey(SupplyPuk)
        .freezeWith(client)

    const TokenSign = await (await TokenTxn.sign(AdminKey)).sign(Treasurypvk)
    const TokenRes = await TokenSign.execute(client)
    const TokenRec = await TokenRes.getReceipt(client)
    
    return TokenRec.tokenId
}

const AccountCreate =async (client)=>{
const Pvk = PrivateKey.generateECDSA();
const puk = Pvk.publicKey;

const AccTxn = await new AccountCreateTransaction()
    .setKey(puk)
    .setInitialBalance(new Hbar(15))
    .execute(client);

const Id = (await AccTxn.getReceipt(client)).accountId;

return [Pvk,puk,Id]

}



const [supplyPvk,supplyPuk,supplyId] = await AccountCreate(client)
const [Treasurypvk,Treasurypuk,TreasuryId] = await AccountCreate(client)

const physicsTokenId = await NFToken("PHYSICS","PX",client,adminPvk,TreasuryId,Treasurypvk,supplyPuk)
console.log("physcis Token deployed Id : ",physicsTokenId.toString())

const quantumTokenId = await NFToken("QUANTUM","QT",client,adminPvk,TreasuryId,Treasurypvk,supplyPuk)
console.log("Quantum Token deployed Id : ",quantumTokenId.toString())

const carbonTokenId = await Token("CARBON","CX",client,adminPvk,TreasuryId,Treasurypvk,supplyPuk)
console.log("Carbon Token deployed Id : ",carbonTokenId.toString())




    // Create environment variables file
    const envVars = `# QuantumVerse Contract ID's
QUANTUM_TOKEN_ID=${quantumTokenId}
PHYSICS_TOKEN_ID=${physicsTokenId}
CARBON_TOKEN_ID=${carbonTokenId}
#QuantumVerse Id's and Keys 
SUPPLY_PRIVATE_KEY=${supplyPvk}
SUPPLY_PUBLIC_KEY=${supplyPuk}
SUPPLY_ID=${supplyId}
TREASURY_PRIVATE_KEY=${Treasurypvk}
TREASURY_PUBLIC_KEY=${Treasurypuk}
TREASURY_ID=${TreasuryId}`;

    fs.writeFileSync('.env.contracts', envVars);



// VITE_PHYSICS_NFT_COLLECTION_ADDRESS=${deployedContracts.physicsNFTCollection}
// VITE_QUANTUM_ENTANGLEMENT_CONTRACT=${deployedContracts.quantumEntanglementContract}
// VITE_AI_ENTITY_CONTRACT=${deployedContracts.aiEntityContract}
// VITE_CARBON_REWARDS_CONTRACT=${deployedContracts.carbonRewardsContract}
//REALITY_TOKEN_ID=${realityTokenId}


//client.close()








// 1. Create comprehensive metadata JSON
// const metadata = {
//     name: "My Gaming NFT",
//     description: "Epic character from QuantumVerse",
//     image: "ipfs://bafkreiabc...preview-image",
//     type: "image/png",
//     creator: "QuantumVerse Team",
//     attributes: [
//         { trait_type: "Power", value: "85" },
//         { trait_type: "Rarity", value: "Legendary" },
//         { trait_type: "Element", value: "Fire" }
//     ],
//     properties: {
//         external_url: "https://quantumverse.com/nft/001",
//         game_stats: {
//             health: 100,
//             speed: 75
//         }
//     },
//     files: [
//         {
//             uri: "ipfs://bafkreixyz...high-res-image",
//             type: "image/png",
//             is_default_file: true
//         },
//         {
//             uri: "ipfs://bafkreiabc...3d-model.glb",
//             type: "model/gltf-binary"
//         }
//     ]
// }

// // 2. Upload JSON to IPFS - get CID
// const cid = "ipfs://bafkreidcsqzr5...metadata-cid"

// // 3. Mint with single metadata URI
// const mintTx = await new TokenMintTransaction()
//     .setTokenId(tokenId)
//     .setMetadata([Buffer.from(cid)])  // Single CID contains ALL data
//     .freezeWith(client)