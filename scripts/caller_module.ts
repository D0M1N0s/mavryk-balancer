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
  public open_sale(json_map : string, contract : string) {
    this.tezos.contract
    .at(contract)
    .then((c) => {
      let methods = c.parameterSchema.ExtractSignatures();
      
      const {total_token_amount, total_tezos_amount, close_date, token_weight} = JSON.parse(json_map);
      // console.log(JSON.stringify(methods, null, 2));
      return c.methods.openSale(total_token_amount, total_tezos_amount, close_date, token_weight, 100 - token_weight).send();
      //c.methods.openSale(total_token_amount, total_tezos_amount, close_date, 12, 23).send();
    })
    .catch((error) => console.log(`Error: ${error}`));
  }
}