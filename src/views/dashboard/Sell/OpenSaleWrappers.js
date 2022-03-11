import { TezosToolkit } from '@taquito/taquito';

import { InMemorySigner } from '@taquito/signer';

import adminAcc from '../../../json_files/hangzhounet.json';

const Tezos = new TezosToolkit('https://rpc.tzkt.io/hangzhou2net/');
const C_PRECISION = 10000000000;

function toFloat(value) {
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

const addOperator = async (standartToken, ownerAddress, tokensaleAddress, tokenId) => {
    console.log('standart adress:', standartToken);
    const standartTokenContract = await Tezos.contract.at(standartToken);
    const operation = await standartTokenContract.methods
        .update_operators([
            {
                add_operator: {
                    owner: ownerAddress,
                    operator: tokensaleAddress,
                    token_id: tokenId
                }
            }
        ])
        .send();
    await operation.confirmation();
};

const removeOperator = async (standartToken, ownerAddress, tokensaleAddress, tokenId) => {
    const standartTokenContract = await Tezos.contract.at(standartToken);
    const operation = await standartTokenContract.methods
        .update_operators([
            {
                remove_operator: {
                    owner: ownerAddress,
                    operator: tokensaleAddress,
                    token_id: tokenId
                }
            }
        ])
        .send();
    await operation.confirmation();
};
const approveTransfer = async (standartToken, tokensaleAddress, totalTokenAmount, tokenDecimals) => {
    const standartTokenContract = await Tezos.contract.at(standartToken);
    console.log('standart:', standartTokenContract);
    const normalizedTokenAmount = Math.floor(totalTokenAmount * 10 ** tokenDecimals);
    const operation = await standartTokenContract.methods.approve(tokensaleAddress, normalizedTokenAmount).send();
    await operation.confirmation();
    if (operation.status !== 'applied') {
        console.log('operation was not applied');
    }
};
const transfer = async (wallet, standartToken, from, to, amount, tokenId, assetDecimals) => {
    Tezos.setWalletProvider(wallet);
    const standartTokenContract = await Tezos.contract.at(standartToken);
    const methods = await standartTokenContract.methods;
    if (methods.update_operators === undefined) {
        // FA1.2
        console.log('FA1.2');
        await approveTransfer(standartToken, to, amount, assetDecimals);
        const operation = await standartTokenContract.methods.transfer(from, to, amount).send();
        await operation.confirmation();
        await approveTransfer(standartToken, to, 0, assetDecimals);
    } else {
        console.log('FA2');
        await addOperator(standartToken, from, to, tokenId);
        const operation = await standartTokenContract.methods
            .transfer([
                {
                    from_: from,
                    txs: [
                        {
                            to_: to,
                            token_id: tokenId,
                            amount
                        }
                    ]
                }
            ])
            .send();
        await operation.confirmation();
        await removeOperator(standartToken, from, to, tokenId);
    }
    setDefaultProvider(adminAcc);
};
const openSaleFA2 = async (
    wallet,
    tokensaleAddress,
    fa2Address,
    totalTokenAmount,
    totalBaseAssetAmount,
    closeDate,
    tokenWeight, // to fetch
    tokenId,    // to fetch
    tokenDecimals,
    assetDecimals,
    tokenSymbol,
    basedAssetAddress,
    basedAssetName
) => {
    await setDefaultProvider(adminAcc);
    const tokensale = await Tezos.contract.at(tokensaleAddress);
    const issuerAddress = await wallet.getPKH();
    await addOperator(fa2Address, issuerAddress, tokensaleAddress, tokenId);
    const openSalePromise = tokensale.methods.openSale(
        fa2Address,
        toFloat(totalTokenAmount),
        toFloat(totalBaseAssetAmount),
        closeDate,
        toFloat(tokenWeight),
        toFloat(1) - toFloat(tokenWeight),
        tokenId,
        tokenDecimals,
        assetDecimals,
        tokenSymbol,
        issuerAddress,
        basedAssetAddress,
        basedAssetName
    );
    if (basedAssetAddress === '') {
        const operation = await openSalePromise.send({ amount: totalBaseAssetAmount });

        await operation.confirmation();
        if (operation.status !== 'applied') {
            console.log('Operation was not applied');
        }
    } else {
        await Tezos.wallet
            .batch()
            .withContractCall(await openSalePromise)
            .withContractCall(await transfer(wallet, basedAssetAddress, issuerAddress, tokensaleAddress, totalBaseAssetAmount, tokenId))
            .send();
    }
    await removeOperator(fa2Address, issuerAddress, tokensaleAddress, tokenId);
};
const openSaleFA12 = async (
    wallet,
    tokensaleAddress,
    fa12Address,
    totalTokenAmount,
    totalBaseAssetAmount,
    closeDate,
    tokenWeight,
    tokenDecimals,
    assetDecimals,
    tokenSymbol,
    baseAssetAddress,
    baseAssetName
) => {
    Tezos.setWalletProvider(wallet);
    const tokensale = await Tezos.contract.at(tokensaleAddress);
    await approveTransfer(fa12Address, tokensaleAddress, totalTokenAmount, tokenDecimals);
    console.log(
        tokensaleAddress,
        fa12Address,
        toFloat(totalTokenAmount),
        toFloat(totalBaseAssetAmount),
        closeDate,
        toFloat(tokenWeight),
        toFloat(1) - toFloat(tokenWeight),
        tokenDecimals,
        assetDecimals,
        tokenSymbol,
        baseAssetAddress,
        baseAssetName
    );
    if (baseAssetAddress === '') {
        const operation = await tokensale.methods
            .openSale(
                fa12Address,
                toFloat(totalTokenAmount),
                toFloat(totalBaseAssetAmount),
                closeDate,
                toFloat(tokenWeight),
                toFloat(1) - toFloat(tokenWeight),
                tokenDecimals,
                assetDecimals,
                tokenSymbol,
                await wallet.getPKH(),
                baseAssetAddress,
                baseAssetName
            )
            .send({ amount: totalBaseAssetAmount });

        await operation.confirmation();
        if (operation.status !== 'applied') {
            console.log('operation was not applied');
        }
    } else {
        // TODO
    }
};

export { openSaleFA12, openSaleFA2 };
