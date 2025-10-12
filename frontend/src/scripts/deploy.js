import {
    PrivateKey,
    Client
} from "@hashgraph/sdk"
import { 
Token ,
burnToken,
mintToken,
transferToken
} from "./FungibleToken.js";
import { NFToken } from "./NFT.js";
import { AccountCreate } from "./keys.js";
import  "dotenv/config"


export const initClient =async()=>{
const client = Client.forTestnet();
const privateKey = PrivateKey.fromStringECDSA(process.env.PRIVATE_KEY)
client.setOperator(process.env.ACCOUNT_ID,privateKey)


return [client,privateKey]

}







client.close()






