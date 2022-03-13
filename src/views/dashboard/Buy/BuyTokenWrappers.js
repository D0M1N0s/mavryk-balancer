import { TezosToolkit } from '@taquito/taquito';
import { InMemorySigner } from '@taquito/signer';

import adminAcc from '../../../json_files/hangzhounet.json';

const C_PRECISION = 10 ** 10;
const Tezos = new TezosToolkit('https://rpc.tzkt.io/hangzhou2net/');

function ToFloat(value) {
    return Math.floor(value * C_PRECISION);
}
async function setDefaultProvider(defaultProvider) {
    await Tezos.setSignerProvider(
        InMemorySigner.fromFundraiser(defaultProvider.email, defaultProvider.password, defaultProvider.mnemonic.join(' '))
    );
}
async function TokenStandard(tokanAddress) {
    setDefaultProvider(adminAcc);
    const standartTokenContract = await Tezos.contract.at(tokanAddress);
    const methods = await standartTokenContract.methods;
    console.log(methods);
    if (methods.update_operators !== undefined) {
        return 'FA2';
    }
    if (methods.approve !== undefined) {
        return 'FA1.2';
    }
    return 'undefined';
}
const buyTokenFA2 = async (wallet, tokensaleAddress, purchaseBaseAssetAmount, fa2Address) => {
    await Tezos.setWalletProvider(wallet);
    const reciever = await wallet.getPKH();
    const tokensale = await Tezos.contract.at(tokensaleAddress);
    const transferOp = await Tezos.wallet
        .transfer({
            to: adminAcc.pkh,
            amount: purchaseBaseAssetAmount
        })
        .send();
    await transferOp.confirmation();
    setDefaultProvider(adminAcc);
    const op = await tokensale.methods
        .buyToken(ToFloat(purchaseBaseAssetAmount), fa2Address, reciever)
        .send({ amount: purchaseBaseAssetAmount });
    await op.confirmation();
    if (op.status !== 'applied') {
        console.log('operation was not applied');
    }
    return op.hash;
};
const buyTokenFA12 = async (wallet, tokensaleAddress, purchaseBaseAssetAmount, fa12Address) => {
    await Tezos.setWalletProvider(wallet);
    const reciever = await wallet.getPKH();
    const tokensale = await Tezos.contract.at(tokensaleAddress);
    const transferOp = await Tezos.wallet
        .transfer({
            to: adminAcc.pkh,
            amount: purchaseBaseAssetAmount
        })
        .send();
    await transferOp.confirmation();
    setDefaultProvider(adminAcc);
    const op = await tokensale.methods
        .buyToken(ToFloat(purchaseBaseAssetAmount), fa12Address, reciever)
        .send({ amount: purchaseBaseAssetAmount });
    await op.confirmation();
    if (op.status !== 'applied') {
        console.log('operation was not applied');
    }
    return op.hash;
};

export { buyTokenFA12, buyTokenFA2, TokenStandard };
