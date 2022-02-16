import { TezosToolkit } from '@taquito/taquito'
import { importKey } from '@taquito/signer'
import { MichelsonMap } from '@taquito/taquito';


const fs = require("fs");
const provider = 'https://rpc.tzkt.io/hangzhou2net/'
const { email, password, mnemonic, activation_code } = JSON.parse(fs.readFileSync('../hangzhounet.json').toString())


async function deploy() {
  const tezos = new TezosToolkit(provider)
  await importKey(
    tezos,
    email, 
    password, 
    mnemonic.join(' '),
    activation_code //приватный ключ
  )

  try {
    const op = await tezos.contract.originate({
        //код смарт-контракта
        code: fs.readFileSync("../build/amm.tz", "utf-8").toString(),
        //значение хранилища
        storage: {
            "trader":{
               "user_wallet":MichelsonMap.fromLiteral({
                  "ETH":710000000000,
                  "TEZ":930000000000
               }),
               "user_address":12
            },
            "input_token":"ETH",
            "output_token":"TEZ",
            "inp_token_amount":200000000000,
            "reserve": MichelsonMap.fromLiteral({
               "TEZ":0,
               "ETH":0
            }),
            "weight":MichelsonMap.fromLiteral({
               "TEZ":5000000000,
               "ETH":5000000000
            }),
            "swaps": MichelsonMap.fromLiteral({
            }),
            "swps_size":0
         }
        //JSON.parse(fs.readFileSync("./build/storage.json", "utf-8")), // here problem
    })

    //начало развертывания
    console.log('Awaiting confirmation...')
    const contract = await op.contract()
    //отчет о развертывании: количество использованного газа, значение хранилища
    console.log('Gas Used', op.consumedGas)
    console.log('Storage', await contract.storage())
    //хеш операции, по которому можно найти контракт в блокчейн-обозревателе
    console.log('Operation hash:', op.hash)
    console.log("Search originated contract on https://hangzhou2net.tzkt.io")
  } catch (ex) {
    console.error(ex)
  }
}

deploy()