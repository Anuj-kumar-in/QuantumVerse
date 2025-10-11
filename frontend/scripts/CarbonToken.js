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

export const CarbonToken = async (client, AdminKey, TreasuryId, SupplyKey) => {
    const CarbonTokenTxn = await new TokenCreateTransaction()
        .setTokenName("CARBON")
        .setTokenSymbol("CX")
        .setTokenType(TokenType.FungibleCommon)
        .setAdminKey(AdminKey.publicKey)
        .setDecimals(4)
        .setInitialSupply(100000000000)
        .setSupplyType(TokenSupplyType.Infinite)
        .setTreasuryAccountId(TreasuryId)
        .setSupplyKey(SupplyKey.publicKey)
        .freezeWith(client)

    const CarbonTokenSign = await (await CarbonTokenTxn.sign(AdminKey)).sign(TreasuryId)
    const CarbonTokenRes = await CarbonTokenSign.execute(client)
    const CarbonTokenRec = await CarbonTokenRes.getReceipt(client)
    
    return CarbonTokenRec.tokenId
}

export const mintCarbonToken = async (tokenId,client,amount,supplyKey) =>{
    const mintCarbonTxn = await new TokenMintTransaction()
    .setAmount(amount)
    .setTokenId(tokenId)
    .freezeWith(client)

    const mintCarbonSign = await mintCarbonTxn.sign(supplyKey)
    const mintCarbonRes = await mintCarbonSign.execute(client)
    const mintCarbonRec = await mintCarbonRes.getReceipt(client)

    return mintCarbonRec
}  

export const burnCarbonToken = async (tokenId,client,amount,supplyKey)=> {
    const burnCarbonTxn = await new TokenBurnTransaction
    .setAmount(amount)
    .setTokenId(tokenId)
    .freezeWith(client)

    const burnCarbonSign = await burnCarbonTxn.sign(supplyKey)
    const burnCarbonRes = await burnCarbonSign.execute(client)
    const burnCarbonRec = await burnCarbonRes.getReceipt(client)

    return burnCarbonRec
}

export const transferCarbonToken = async (tokenId,client,amount,from,to,privateKeyFrom) => {
    const transferCarbonTokenTxn = await new TransferTransaction()
    .addTokenTransfer(tokenId,from,-amount)
    .addTokenTransfer(tokenId,to,amount)
    .freezeWith(client)

    const transferCarbonTokenSign = await transferCarbonTokenTxn.sign(privateKeyFrom)
    const transferCarbonTokenRes = await transferCarbonTokenSign.execute(client)
    const transferCarbonTokenRec = await transferCarbonTokenRes.getReceipt(client)

    return transferCarbonTokenRec
}
