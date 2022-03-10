import { TezosToolkit, MichelsonMap } from '@taquito/taquito'
import { importKey } from '@taquito/signer'

import fs  from "fs";

const provider = 'https://rpc.tzkt.io/hangzhou2net/'
const { pkh, email, password, mnemonic, activation_code } = JSON.parse(fs.readFileSync('../hangzhounet.json').toString())
const FA2_compiled_code = "../build/fa2_swapper.tz"
const FA12_compiled_code = "../build/fa12_swapper.tz"

const deploy_tokensale = async (path, standart) => {
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
            storage: {
                token_list : new MichelsonMap(),
                admin : pkh
            },
            balance : '0.3'
        })
        console.log('Awaiting confirmation...')
        const contract = await op.contract()
        const detail = {
            address: contract.address
        }
        console.log('Gas Used', op.consumedGas)
        console.log('Storage', await contract.storage())
        console.log('Operation hash:', op.hash)
        fs.writeFileSync(`../deployed/${standart}-latest.json`, JSON.stringify(detail))
        console.log(`Deployed ${standart}-tokensale at:`, contract.address)
    } catch (ex) {
        console.error(ex)
    }
}
const deploy = async () => {
    await deploy_tokensale(FA12_compiled_code, 'fa12'); 
    await deploy_tokensale(FA2_compiled_code, 'fa2');
}

deploy()