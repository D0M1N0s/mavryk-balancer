import { MichelsonMap, TezosToolkit } from '@taquito/taquito'
import { InMemorySigner } from '@taquito/signer'


const acc = require('../hangzhounet.json')  // issuer's accaunt needed
const c_PRECISION = 10000000000;
function to_float(value : number) {
    return value * c_PRECISION;
}
function to_number(value : number) {
    return value / c_PRECISION;
}
export class FA12_Caller {
    private tezos: TezosToolkit
    rpcUrl: string

    constructor(rpcUrl: string) {
        this.tezos = new TezosToolkit(rpcUrl)
        this.rpcUrl = rpcUrl
        //объявляем параметры с помощью метода fromFundraiser: почту, пароль и мнемоническую фразу, из которой можно получить приватный ключ
        this.tezos.setSignerProvider(InMemorySigner.fromFundraiser(acc.email, acc.password, acc.mnemonic.join(' ')))
    }
    public change_account(account : any) {
        this.tezos.setSignerProvider(InMemorySigner.fromFundraiser(account.email, account.password, account.mnemonic.join(' ')))
    }
    public  buy_token(json_map : string, contract: string) {
        this.tezos.contract
        .at(contract)
        .then((contract) => {
            let methods = contract.parameterSchema.ExtractSignatures();
            const {tezos_amount, token_address} = JSON.parse(json_map)
            console.log(`User buyes some tokens ${token_address} with ${tezos_amount} ꜩ`)
            return contract.methods.buyToken(to_float(tezos_amount), token_address)
                .send({amount : tezos_amount});
        })
        .then((op) => {
            console.log(`Awaiting for ${op.hash} to be confirmed...`)
            return op.confirmation(1).then(() => op.hash) 
        })
        .then((hash) => console.log(`Hash: https://hangzhou2net.tzkt.io/${hash}`)) 
        .catch((error) => console.log(`Error: ${JSON.stringify(error, null, 2)}`))
    }

  // moved transfering tokens in smart contract => need to delete this func
    public transfer_tokens(standart_contract: string, sender: string, receiver: string, amount: number) {
        return this.tezos.contract
        .at(standart_contract) //обращаемся к контракту по адресу
        .then((contract) => {
            console.log(`Sending ${amount} from ${sender} to ${receiver}...`)
            //обращаемся к точке входа transfer, передаем ей адреса отправителя и получателя, а также количество токенов для отправки.
            return contract.methods.transfer(sender, receiver, amount).send()
        })
        .then((op) => {
            console.log(`Awaiting for ${op.hash} to be confirmed...`)
            return op.confirmation(1).then(() => op.hash) //ждем одно подтверждение сети
        })
        .then((hash) => console.log(`Hash: https://hangzhou2net.tzkt.io/${hash}`)) //получаем хеш операции
        .catch((error) => console.log(`Error: ${JSON.stringify(error, null, 2)}`))
    }

    private open_sale_entrypoint(json_map : string, contract : string) {
        return this.tezos.contract
        .at(contract)
        .then((c) => {
            let methods = c.parameterSchema.ExtractSignatures();
            
            const {total_tezos_amount, total_token_amount, token_address, close_date, token_weight} = JSON.parse(json_map);
            console.log(`Opening sale with ${total_tezos_amount} ꜩ and ${total_token_amount}`);
            return c.methods.openSale(token_address, to_float(total_token_amount), to_float(total_tezos_amount), 
                                close_date, to_float(token_weight), to_float(1) - to_float(token_weight))
            .send({amount : total_tezos_amount});  // here need to put the amnt of tez to put on contract
        })
        .then((op) => {
            console.log(`Awaiting for ${op.hash} to be confirmed...`)
            return op.confirmation(1).then(() => op.hash) 
        })
        .then((hash) => console.log(`Hash: https://hangzhou2net.tzkt.io/${hash}`))
        // .catch((error) => console.log(`Error 1: ${JSON.stringify(error, null, 2)}`))
    }

    private approve_token_transfer(standart_contract: string, sender: string, receiver: string, amount: number) {
        return this.tezos.contract
        .at(standart_contract) 
        .then((contract) => {
            console.log(`Approving ${amount} for ${receiver} to spend...`)
            return contract.methods.approve(receiver, amount).send()
        })
        .then((op) => {
            console.log(`Awaiting for ${op.hash} to be confirmed...`)
            return op.confirmation(1).then(() => op.hash) 
        })
        .then((hash) => console.log(`Hash: https://hangzhou2net.tzkt.io/${hash}`)) 
        .catch((error) => console.log(`Error: ${JSON.stringify(error, null, 2)}`))
    }

    public open_sale(json_map : string, tokensale_contract : string) {
        const {sender, token_address, total_token_amount} = JSON.parse(json_map);
        return this.approve_token_transfer(token_address,  sender, tokensale_contract, total_token_amount)
            .then(() => {
                return this.open_sale_entrypoint(json_map, tokensale_contract);
            }).catch((error) => {
                console.log(`Error: ${JSON.stringify(error, null, 2)}`);
                return this.approve_token_transfer(token_address,  sender, tokensale_contract, 0);
            });
    }
    public close_sale(tokensale_contract : string, token_contract : string) {
        return this.tezos.contract
        .at(tokensale_contract) 
        .then((contract) => {
            console.log(`Closing tokensale for token ${token_contract} to spend...`)
            return contract.methods.closeSale(token_contract).send()
        })
        .then((op) => {
            console.log(`Awaiting for ${op.hash} to be confirmed...`)
            return op.confirmation(1).then(() => op.hash) 
        })
        .then((hash) => console.log(`Hash: https://hangzhou2net.tzkt.io/${hash}`)) 
        .catch((error) => console.log(`Error: ${JSON.stringify(error, null, 2)}`))
    }
}