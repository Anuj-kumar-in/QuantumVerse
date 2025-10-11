import {
    PrivateKey,
    Client
} from "@hashgraph/sdk"
import { 
CarbonToken ,
burnCarbonToken,
mintCarbonToken,
transferCarbonToken
} from "./CarbonToken.js";
import { AccountCreate } from "./keys.js";
import  "dotenv/config"


const client = Client.forTestnet();
const privateKey = PrivateKey.fromStringECDSA(process.env.PRIVATE_KEY)
client.setOperator(process.env.ACCOUNT_ID,privateKey)

const [treasuryPvk,treasuryPuk,treasuryId] = await AccountCreate(client)
const [supplyPvk,supplyPuk,supplyId] = await AccountCreate(client)




client.close()






