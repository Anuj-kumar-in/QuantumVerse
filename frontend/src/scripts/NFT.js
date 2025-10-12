import {
    TokenCreateTransaction,
    TokenType,
    TokenSupplyType,
    TokenMintTransaction,
    Hbar,
    TokenBurnTransaction,
    TransferTransaction
} from "@hashgraph/sdk"
import "dotenv/config"

export const NFToken = async (name,symbol,client, AdminKey, TreasuryId,Treasurypvk, SupplyKey) => {
    const TokenTxn = await new TokenCreateTransaction()
        .setTokenName(name)
        .setTokenSymbol(symbol)
        .setTokenType(TokenType.NonFungibleUnique)
        .setAdminKey(AdminKey.publicKey)
        .setDecimals(0)
        .setInitialSupply(0)
        .setTreasuryAccountId(TreasuryId)
        .setSupplyKey(SupplyKey.publicKey)
        .freezeWith(client)

    const TokenSign = await (await TokenTxn.sign(AdminKey)).sign(Treasurypvk)
    const TokenRes = await TokenSign.execute(client)
    const TokenRec = await TokenRes.getReceipt(client)
    
    return TokenRec.tokenId
}

export const mintNFToken = async (tokenId,client,metadata,supplyKey) =>{
    const mintTxn = await new TokenMintTransaction()
    .setMetadata([metadata])
    .setTokenId(tokenId)
    .freezeWith(client)

    const mintSign = await mintTxn.sign(supplyKey)
    const mintRes = await mintSign.execute(client)
    const mintRec = await mintRes.getReceipt(client)

    return mintRec
}  

export const burnToken = async (tokenId,client,supplyKey)=> {
    const burnTxn = await new TokenBurnTransaction()
    .setSerials([1])
    .setTokenId(tokenId)
    .freezeWith(client)

    const burnSign = await burnTxn.sign(supplyKey)
    const burnRes = await burnSign.execute(client)
    const burnRec = await burnRes.getReceipt(client)

    return burnRec
}

export const transferToken = async (tokenId,client,from,to,privateKeyFrom) => {
    const transferTokenTxn = await new TransferTransaction()
    .addNftTransfer(tokenId,from,to)
    .freezeWith(client)

    const transferTokenSign = await transferTokenTxn.sign(privateKeyFrom)
    const transferTokenRes = await transferTokenSign.execute(client)
    const transferTokenRec = await transferTokenRes.getReceipt(client)

    return transferTokenRec
}



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

