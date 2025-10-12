import { 
    AccountCreateTransaction,
    PrivateKey,
    Hbar
} from "@hashgraph/sdk";


export const AccountCreate =async (client)=>{
const Pvk = PrivateKey.generateECDSA();
const puk = Pvk.publicKey;

const AccTxn = await new AccountCreateTransaction()
    .setKey(puk)
    .setInitialBalance(new Hbar(15))
    .execute(client);

const Id = (await AccTxn.getReceipt(client)).accountId;

return [Pvk,puk,Id]

}