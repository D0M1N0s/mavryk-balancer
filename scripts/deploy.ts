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
        code: fs.readFileSync("../build/fa12_swapper.tz", "utf-8").toString(),
        //значение хранилища
        storage: new MichelsonMap(),
        balance : '0.3' // initial contract balance
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