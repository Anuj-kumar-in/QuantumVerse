import { 
    TokenCreateTransaction,
    TransferTransaction,
    TokenMintTransaction,
    TokenBurnTransaction
 } from "@hashgraph/sdk"



export const mintNFT = async (tokenId,client,metadata,supplyKey) =>{
    const mintTxn = await new TokenMintTransaction()
    .setMetadata([metadata])
    .setTokenId(tokenId)
    .freezeWith(client)

    const mintSign = await mintTxn.sign(supplyKey)
    const mintRes = await mintSign.execute(client)
    const mintRec = await mintRes.getReceipt(client)

    return mintRec
}  

export const burnNFT = async (tokenId,client,supplyKey)=> {
    const burnTxn = await new TokenBurnTransaction()
    .setSerials([1])
    .setTokenId(tokenId)
    .freezeWith(client)

    const burnSign = await burnTxn.sign(supplyKey)
    const burnRes = await burnSign.execute(client)
    const burnRec = await burnRes.getReceipt(client)

    return burnRec
}

export const transferNFT = async (tokenId,client,from,to,privateKeyFrom) => {
    const transferTokenTxn = await new TransferTransaction()
    .addNftTransfer(tokenId,from,to)
    .freezeWith(client)

    const transferTokenSign = await transferTokenTxn.sign(privateKeyFrom)
    const transferTokenRes = await transferTokenSign.execute(client)
    const transferTokenRec = await transferTokenRes.getReceipt(client)

    return transferTokenRec
}
export const mintToken = async (tokenId,client,amount,supplyKey) =>{
    const mintTxn = await new TokenMintTransaction()
    .setAmount(amount)
    .setTokenId(tokenId)
    .freezeWith(client)

    const mintSign = await mintTxn.sign(supplyKey)
    const mintRes = await mintSign.execute(client)
    const mintRec = await mintRes.getReceipt(client)

    return mintRec
}  

export const burnToken = async (tokenId,client,amount,supplyKey)=> {
    const burnTxn = await new TokenBurnTransaction()
    .setAmount(amount)
    .setTokenId(tokenId)
    .freezeWith(client)

    const burnSign = await burnTxn.sign(supplyKey)
    const burnRes = await burnSign.execute(client)
    const burnRec = await burnRes.getReceipt(client)

    return burnRec
}

export const transferToken = async (tokenId,client,amount,from,to,privateKeyFrom) => {
    const transferTokenTxn = await new TransferTransaction()
    .addTokenTransfer(tokenId,from,-amount)
    .addTokenTransfer(tokenId,to,amount)
    .freezeWith(client)

    const transferTokenSign = await transferTokenTxn.sign(privateKeyFrom)
    const transferTokenRes = await transferTokenSign.execute(client)
    const transferTokenRec = await transferTokenRes.getReceipt(client)

    return transferTokenRec
}