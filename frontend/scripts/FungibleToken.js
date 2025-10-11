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

export const Token = async (name,symbol,client, AdminKey, TreasuryId,Treasurypvk, SupplyKey) => {
    const TokenTxn = await new TokenCreateTransaction()
        .setTokenName(name)
        .setTokenSymbol(symbol)
        .setTokenType(TokenType.FungibleCommon)
        .setAdminKey(AdminKey.publicKey)
        .setDecimals(4)
        .setInitialSupply(100000000000)
        .setSupplyType(TokenSupplyType.Infinite)
        .setTreasuryAccountId(TreasuryId)
        .setSupplyKey(SupplyKey.publicKey)
        .freezeWith(client)

    const TokenSign = await (await TokenTxn.sign(AdminKey)).sign(Treasurypvk)
    const TokenRes = await TokenSign.execute(client)
    const TokenRec = await TokenRes.getReceipt(client)
    
    return TokenRec.tokenId
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
