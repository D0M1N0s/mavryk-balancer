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

const addOperator = (standartTokenContract, ownerAddress, tokensaleAddress, tokenId) =>
    standartTokenContract.methods.update_operators([
        {
            add_operator: {
                owner: ownerAddress,
                operator: tokensaleAddress,
                token_id: tokenId
            }
        }
    ]);

const removeOperator = async (standartToken, ownerAddress, tokensaleAddress, tokenId) => {
    const standartTokenContract = await Tezos.contract.at(standartToken);
    return standartTokenContract.methods.update_operators([
        {
            remove_operator: {
                owner: ownerAddress,
                operator: tokensaleAddress,
                token_id: tokenId
            }
        }
    ]);
};
const approveTransfer = (standartTokenContract, tokensaleAddress, totalTokenAmount, tokenDecimals) => {
    const normalizedTokenAmount = Math.floor(totalTokenAmount * 10 ** tokenDecimals);
    return standartTokenContract.methods.approve(tokensaleAddress, normalizedTokenAmount);
};
const transferFA2 = (fa2Contract, from, to, amountI, tokenId) =>
    fa2Contract.methods.transfer([
        {
            from_: from,
            txs: [
                {
                    to_: to,
                    token_id: tokenId,
                    amount: amountI
                }
            ]
        }
    ]);
const transferFA12 = (fa12Contract, from, to, amount) => fa12Contract.methods.transfer(from, to, amount);
const openSaleFA2 = async (
    wallet,
    tokensaleAddress,
    fa2Address,
    totalTokenAmount,
    totalBaseAssetAmount,
    closeDate,
    tokenWeight, // to fetch
    tokenId, // to fetch
    tokenDecimals,
    assetDecimals,
    tokenSymbol,
    basedAssetAddress,
    basedAssetName
) => {
    await setDefaultProvider(adminAcc);
    const tokensale = await Tezos.contract.at(tokensaleAddress);
    const issuerAddress = await wallet.getPKH();
    const openSaleTransaction = tokensale.methods.openSale(
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
    let operationHash = null;
    const standartTokenContract = await Tezos.contract.at(fa2Address);
    if (basedAssetAddress === '') {
        const addOp = await addOperator(standartTokenContract, issuerAddress, tokensaleAddress, tokenId).send();
        await addOp.confirmation();
        const operation = await openSaleTransaction.send({ amount: totalBaseAssetAmount });
        await operation.confirmation();
        if (operation.status !== 'applied') {
            console.log('Operation was not applied');
        }
        operationHash = operation.hash;
    } else {
        const basedAssetContract = await Tezos.contract.at(basedAssetAddress);
        const standard = await TokenStandard(basedAssetAddress);
        let transferBasedAsset = null;
        if (standard === 'FA2') {
            transferBasedAsset = transferFA2(basedAssetContract, issuerAddress, tokensaleAddress, totalBaseAssetAmount, 0);
        } else if (standard === 'FA1.2') {
            transferBasedAsset = transferFA12(basedAssetContract, issuerAddress, tokensaleAddress, totalBaseAssetAmount);
        } else {
            // to show error
        }
        console.log(transferBasedAsset);
        const batchOperation = await Tezos.contract
            .batch()
            .withContractCall(addOperator(standartTokenContract, issuerAddress, tokensaleAddress, tokenId))
            .withContractCall(openSaleTransaction)
            .withContractCall(transferBasedAsset)
            .send();
        console.log(batchOperation);
        await batchOperation.confirmation();
        console.log(batchOperation.hash);
        operationHash = batchOperation.hash;
    }
    await removeOperator(fa2Address, issuerAddress, tokensaleAddress, tokenId);
    return operationHash;
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
    setDefaultProvider(adminAcc);
    const tokensale = await Tezos.contract.at(tokensaleAddress);
    const standartTokenContract = await Tezos.contract.at(fa12Address);
    const issuerAddress = await wallet.getPKH();
    const openSaleTransaction = tokensale.methods.openSale(
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
    );
    let operationHash = null;
    if (baseAssetAddress === '') {
        const approveOp = await approveTransfer(standartTokenContract, tokensaleAddress, totalTokenAmount, tokenDecimals).send();
        await approveOp.confirmation();
        const operation = await openSaleTransaction.send({ amount: totalBaseAssetAmount });
        await operation.confirmation();
        if (operation.status !== 'applied') {
            console.log('operation was not applied');
        }
        operationHash = operation.hash;
    } else {
        const basedAssetContract = await Tezos.contract.at(baseAssetAddress);
        const standard = await TokenStandard(baseAssetAddress);
        let transferBasedAsset = null;
        if (standard === 'FA2') {
            transferBasedAsset = transferFA2(basedAssetContract, issuerAddress, tokensaleAddress, totalBaseAssetAmount, 0);
        } else if (standard === 'FA1.2') {
            transferBasedAsset = transferFA12(basedAssetContract, issuerAddress, tokensaleAddress, totalBaseAssetAmount);
        } else {
            // to show error
        }
        console.log(transferBasedAsset);
        const batchOperation = await Tezos.contract
            .batch()
            .withContractCall(approveTransfer(standartTokenContract, tokensaleAddress, totalTokenAmount, tokenDecimals))
            .withContractCall(openSaleTransaction)
            .withContractCall(transferBasedAsset)
            .send();
        await batchOperation.confirmation();
        if (batchOperation.status !== 'applied') {
            console.log('operation was not applied');
        }
        operationHash = batchOperation.hash;
    }
    const removeOp = await approveTransfer(standartTokenContract, tokensaleAddress, 0, tokenDecimals).send();
    await removeOp.confirmation();
    return operationHash;
};

export { openSaleFA12, openSaleFA2, TokenStandard };
