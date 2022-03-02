import { TezosToolkit } from '@taquito/taquito'
import { importKey } from '@taquito/signer'
import { MichelsonMap } from '@taquito/taquito';

const fs = require("fs");
const provider = 'https://rpc.tzkt.io/hangzhou2net/'
const { email, password, mnemonic, activation_code } = JSON.parse(fs.readFileSync('../hangzhounet.json').toString())
const FA2_compiled_code = "../build/fa2_swapper.tz"
const FA12_compiled_code = "../build/fa12_swapper.tz"

async function deploy(path : string) {
    const tezos = new TezosToolkit(provider)
    await importKey(
        tezos,
        email, 
        password, 
        mnemonic.join(' '),
        activation_code
    )

    try {
        const op = await tezos.contract.originate({
            code: fs.readFileSync(path, "utf-8").toString(),
            storage: new MichelsonMap(),
            balance : '0.3' // initial contract balance
        })
        
        console.log('Awaiting confirmation...')
        const contract = await op.contract()
        const detail = {
            address: contract.address
        }
        console.log('Gas Used', op.consumedGas)
        console.log('Storage', await contract.storage())
        console.log('Operation hash:', op.hash)
        fs.writeFileSync('../deployed/fa12-latest.json', JSON.stringify(detail))
        fs.writeFileSync(`../deployed/${contract.address}.json`, JSON.stringify(detail))
        console.log('Deployed at:', contract.address)
    } catch (ex) {
        console.error(ex)
    }
}

deploy(FA12_compiled_code)