import { MichelsonMap, TezosToolkit } from '@taquito/taquito'
import { InMemorySigner } from '@taquito/signer'


const acc = require('../hangzhounet.json')  // issuer's accaunt needed

export class FA12_Caller {
  private tezos: TezosToolkit
  rpcUrl: string

  constructor(rpcUrl: string) {
    this.tezos = new TezosToolkit(rpcUrl)
    this.rpcUrl = rpcUrl

    //объявляем параметры с помощью метода fromFundraiser: почту, пароль и мнемоническую фразу, из которой можно получить приватный ключ
    this.tezos.setSignerProvider(InMemorySigner.fromFundraiser(acc.email, acc.password, acc.mnemonic.join(' ')))
  }

  public send_tokens(contract: string, reciever : string) {
    this.tezos.contract
    .at(contract)
    .then((c) => {
      let methods = c.parameterSchema.ExtractSignatures();
      console.log(JSON.stringify(methods, null, 2));
      return c.methods.sendTokens(reciever).send();
    })
    .catch((error) => console.log(`Error: ${error}`));
  }
  public async transfer_tokens(standart_contract: string, sender: string, receiver: string, amount: number) {
    this.tezos.contract
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
  public async open_sale(json_map : string, contract : string) {
    this.tezos.contract
    .at(contract)
    .then((c) => {
      let methods = c.parameterSchema.ExtractSignatures();
      // console.log(JSON.stringify(methods, null, 2));
      console.log("Opening sale");
      const {total_token_amount, total_tezos_amount, close_date, token_weight} = JSON.parse(json_map);
      
      return c.methods.openSale(total_token_amount, total_tezos_amount, close_date, token_weight, 100 - token_weight).send();  
    })
    .then((op) => {
      console.log(`Awaiting for ${op.hash} to be confirmed...`)
      return op.confirmation(1).then(() => op.hash) //ждем одно подтверждение сети
    })
    .then((hash) => console.log(`Hash: https://hangzhou2net.tzkt.io/${hash}`)) //получаем хеш операции
    .catch((error) => console.log(`Error 1: ${JSON.stringify(error, null, 2)}`))
  }
}