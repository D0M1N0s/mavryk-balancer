import {toFloat, toNumber, getFullStorage, getContract,
    storageAssert, getTokenAmount, createTezosFromHangzhou} from "./common_functions.js"

import assert from 'assert';
import fs  from "fs";

const { address } = JSON.parse(fs.readFileSync("../deployed/fa12-latest.json").toString())

const getAccounts = async () => {
    const Tezos = await createTezosFromHangzhou('../hangzhounet.json');
    const Tezos1 = await createTezosFromHangzhou('./accounts/buyer1.json');
    const Tezos2 = await createTezosFromHangzhou('./accounts/buyer2.json');
    const Tezos3 = await createTezosFromHangzhou('./accounts/buyer3.json');
    const tokensaleAddress = address;
    const fa12Address = "KT1VE7N21H9X48yk1bGjikDDrSFGWDvsJVyb";

    return { Tezos, Tezos1, Tezos2, Tezos3, tokensaleAddress, fa12Address}
}

const getTestInput = async() => {
    const totalTokenAmount = 2;
    const totalBaseAssetAmount = 4;
    const closeDate = "2022-01-01T00:01:30.000Z";
    const tokenWeight = 0.7;
    const tokenDecimals = 8;
    const assetDecimals = 6;
    return {totalTokenAmount, totalBaseAssetAmount, closeDate, tokenWeight, tokenDecimals, assetDecimals}
}

const approveTransfer = async(standartTokenContract, tokensaleAddress, totalTokenAmount, tokenDecimals) => {
    console.log(`Approving transfer ${totalTokenAmount}ꜩ to ${tokensaleAddress}`);
    const normalizedTokenAmount = Math.floor(totalTokenAmount * (10 ** tokenDecimals));
    const operation = await standartTokenContract.methods.approve(tokensaleAddress, normalizedTokenAmount).send();
    await operation.confirmation();
    assert(operation.status === 'applied', 'Operation was not applied');
    console.log("Operation confirmed");
}

const openSale = async(tokensaleContract, fa12Address, totalTokenAmount, totalBaseAssetAmount, closeDate, tokenWeight, tokenDecimals, assetDecimals) => {
    console.log(`Opening tokensale for ${fa12Address} with ${totalBaseAssetAmount}ꜩ and ${totalTokenAmount} tokens of ${tokenWeight} weight`)
    const operation = await tokensaleContract.methods.openSale(fa12Address, toFloat(totalTokenAmount), toFloat(totalBaseAssetAmount), 
        closeDate, toFloat(tokenWeight), toFloat(1) - toFloat(tokenWeight), tokenDecimals, assetDecimals, "DMN").send();
    
    await operation.confirmation();
    assert(operation.status === 'applied', 'Operation was not applied')
    console.log("Operation confirmed");
}

const closeSale = async(tokensaleContract, fa12Address) => {
    console.log(`Closing tokensale for ${fa12Address}`)
    const operation = await tokensaleContract.methods.closeSale(fa12Address).send();
    await operation.confirmation();
    assert(operation.status === 'applied', 'Operation was not applied')
    console.log("Operation confirmed");
}

const buyToken = async(tokensaleContract, purchaseBaseAssetAmount, fa12Address) => {
    console.log(`Purchuasing tokens ${fa12Address} by price ${purchaseBaseAssetAmount}ꜩ`)
    const op = await tokensaleContract.methods.buyToken(toFloat(purchaseBaseAssetAmount), fa12Address)
        .send()
    await op.confirmation()
    assert(op.status === 'applied', 'Operation was not applied')
    console.log("Operation confirmed");
}

const testOpenTwice = async () => {
    const {Tezos, tokensaleAddress, fa12Address} = await getAccounts();
    const tokensaleContract = await getContract(Tezos, tokensaleAddress);
    const standartTokenContract = await getContract(Tezos, fa12Address);

    const {totalTokenAmount, totalBaseAssetAmount, 
        closeDate, tokenWeight, tokenDecimals, assetDecimals} = await getTestInput();
    
    await approveTransfer(standartTokenContract, tokensaleAddress, totalTokenAmount, tokenDecimals)
    await openSale(tokensaleContract, fa12Address, totalTokenAmount, totalBaseAssetAmount, closeDate, tokenWeight, tokenDecimals, assetDecimals);
    await approveTransfer(standartTokenContract, tokensaleAddress, 0, tokenDecimals)
    
    var storage = await getFullStorage(tokensaleContract, fa12Address);
    storageAssert(storage, true, totalTokenAmount, totalBaseAssetAmount, fa12Address, closeDate, tokenWeight);
    let thrown = false;
    try {
        await openSale(tokensaleContract, fa12Address, totalTokenAmount, totalBaseAssetAmount, closeDate, tokenWeight, tokenDecimals, assetDecimals);
    } catch (ex) { 
        thrown = true; 
        assert(ex.message == "Tokensale is already open")
        storage = await getFullStorage(tokensaleContract, fa12Address);
        storageAssert(storage, true, totalTokenAmount, totalBaseAssetAmount, fa12Address, closeDate, tokenWeight);
    }
    assert(thrown)

    await closeSale(tokensaleContract, fa12Address);
    storage = await getFullStorage(tokensaleContract, fa12Address);
    storageAssert(storage, false, totalTokenAmount, totalBaseAssetAmount, fa12Address, closeDate, tokenWeight);
}

const testCloseClosed = async() => {
    const {Tezos, tokensaleAddress, fa12Address} = await getAccounts();
    const tokensaleContract = await getContract(Tezos, tokensaleAddress);
    const standartTokenContract = await getContract(Tezos, fa12Address);
    
    const {totalTokenAmount, totalBaseAssetAmount, closeDate, tokenWeight, tokenDecimals, assetDecimals} = await getTestInput();

    await approveTransfer(standartTokenContract, tokensaleAddress, totalTokenAmount, tokenDecimals)
    await openSale(tokensaleContract, fa12Address, totalTokenAmount, totalBaseAssetAmount, closeDate, tokenWeight, tokenDecimals, assetDecimals);
    await approveTransfer(standartTokenContract, tokensaleAddress, 0, tokenDecimals)

    var storage = await getFullStorage(tokensaleContract, fa12Address);
    storageAssert(storage, true, totalTokenAmount, totalBaseAssetAmount, fa12Address, closeDate, tokenWeight);
    await closeSale(tokensaleContract, fa12Address);
    storage = await getFullStorage(tokensaleContract, fa12Address);

    let thrown = false;
    try {
        await closeSale(tokensaleContract, fa12Address);
    } catch (ex) { 
        thrown = true; 
        assert(ex.message == "Tokensale is already closed")
        storage = await getFullStorage(tokensaleContract, fa12Address);
        storageAssert(storage, false, totalTokenAmount, totalBaseAssetAmount, fa12Address, closeDate, tokenWeight);
    }
    assert(thrown)
    storageAssert(storage, false, totalTokenAmount, totalBaseAssetAmount, fa12Address, closeDate, tokenWeight);
}

const testTokenPurchase = async() => {
    const {Tezos, tokensaleAddress, fa12Address} = await getAccounts();
    const tokensaleContract = await getContract(Tezos, tokensaleAddress);
    const standartTokenContract = await getContract(Tezos, fa12Address);
    const {closeDate, tokenWeight, tokenDecimals, assetDecimals} = await getTestInput();
    
    let totalTokenAmount = 2000;
    let totalBaseAssetAmount = 40;
    let purchaseBaseAssetAmount = 10;

    await approveTransfer(standartTokenContract, tokensaleAddress, totalTokenAmount, tokenDecimals)
    await openSale(tokensaleContract, fa12Address, totalTokenAmount, totalBaseAssetAmount, closeDate, tokenWeight, tokenDecimals, assetDecimals);
    await approveTransfer(standartTokenContract, tokensaleAddress, 0, tokenDecimals)
    var storage = await getFullStorage(tokensaleContract, fa12Address);
    storageAssert(storage, true, totalTokenAmount, totalBaseAssetAmount, fa12Address, closeDate, tokenWeight);
    const correctDeltaTokens = getTokenAmount(toFloat(totalBaseAssetAmount), toFloat(totalTokenAmount), toFloat(purchaseBaseAssetAmount), toFloat(1) - toFloat(tokenWeight), toFloat(tokenWeight))
    
    await buyToken(tokensaleContract, purchaseBaseAssetAmount, fa12Address)
    var storage = await getFullStorage(tokensaleContract, fa12Address);
    
    totalTokenAmount -= toNumber(correctDeltaTokens, tokenDecimals);
    totalBaseAssetAmount += purchaseBaseAssetAmount
    storageAssert(storage, true, totalTokenAmount, totalBaseAssetAmount, fa12Address, closeDate, tokenWeight)
    
    await closeSale(tokensaleContract, fa12Address);
    storage = await getFullStorage(tokensaleContract, fa12Address);
    storageAssert(storage, false, totalTokenAmount, totalBaseAssetAmount, fa12Address, closeDate, tokenWeight);
}

const testInvalidToken = async() => {
    const {Tezos, tokensaleAddress} = await getAccounts();
    const tokensaleContract = await getContract(Tezos, tokensaleAddress);
    const fa12Invalid = 'tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb'

    const {totalTokenAmount, totalBaseAssetAmount, closeDate, tokenWeight, tokenDecimals, assetDecimals} = await getTestInput();
    
    let thrown = false;
    try {
        await openSale(tokensaleContract, fa12Invalid, totalTokenAmount, totalBaseAssetAmount, closeDate, tokenWeight, tokenDecimals, assetDecimals);
    } catch (ex) {
        thrown = true;
        assert(ex.message == "Contract for this token not found.")
    }
    assert(thrown)
}

const testPurchuaseNonExistingToken = async() => {
    const {Tezos, tokensaleAddress} = await getAccounts();
    const tokensaleContract = await getContract(Tezos, tokensaleAddress);
    let fa12Address = 'KT1HE3TujvVFFUUCo7DvGRqtr9sovcJ3pwkh'
    let purchaseBaseAssetAmount = 10;
    let thrown = false;
    try {
        await buyToken(tokensaleContract, purchaseBaseAssetAmount, fa12Address)
    } catch(ex) {
        thrown = true;
        assert(ex.message == 'No such token')
    }
    assert(thrown)
}

const testPurchuaseAfterClosure = async() => {
    const {Tezos, tokensaleAddress, fa12Address} = await getAccounts();
    const tokensaleContract = await getContract(Tezos, tokensaleAddress);
    const standartTokenContract = await getContract(Tezos, fa12Address);
    
    let totalTokenAmount = 2000;
    let totalBaseAssetAmount = 40;
    let purchaseBaseAssetAmount = 10;
    const {closeDate, tokenWeight, tokenDecimals, assetDecimals} = await getTestInput();

    await approveTransfer(standartTokenContract, tokensaleAddress, totalTokenAmount, tokenDecimals)
    await openSale(tokensaleContract, fa12Address, totalTokenAmount, totalBaseAssetAmount, closeDate, tokenWeight, tokenDecimals, assetDecimals);
    await approveTransfer(standartTokenContract, tokensaleAddress, 0, tokenDecimals)
    var storage = await getFullStorage(tokensaleContract, fa12Address);
    storageAssert(storage, true, totalTokenAmount, totalBaseAssetAmount, fa12Address, closeDate, tokenWeight);
    
    await closeSale(tokensaleContract, fa12Address);
    storage = await getFullStorage(tokensaleContract, fa12Address);
    storageAssert(storage, false, totalTokenAmount, totalBaseAssetAmount, fa12Address, closeDate, tokenWeight);
    let thrown = false
    try {
        await buyToken(tokensaleContract, purchaseBaseAssetAmount, fa12Address)
    } catch(ex) {
        thrown = true
        assert(ex.message == 'Tokensale is closed')
        storage = await getFullStorage(tokensaleContract, fa12Address);
        storageAssert(storage, false, totalTokenAmount, totalBaseAssetAmount, fa12Address, closeDate, tokenWeight)
    }
    assert(thrown)
}

const testManyPurchasings = async() => {
    const {Tezos, Tezos1, tokensaleAddress, fa12Address} = await getAccounts();
    const tokensale = await getContract(Tezos, tokensaleAddress);
    const tokensale1 = await getContract(Tezos1, tokensaleAddress);
    const standartTokenContract = await getContract(Tezos, fa12Address);
    
    let totalTokenAmount = 2000;
    let totalBaseAssetAmount = 40;
    let purchaseBaseAsset = [10, 14, 87, 7, 43, 107];
    const {closeDate, tokenWeight, tokenDecimals, assetDecimals} = await getTestInput();
    
    await approveTransfer(standartTokenContract, tokensaleAddress, totalTokenAmount, tokenDecimals)
    await openSale(tokensale, fa12Address, totalTokenAmount, totalBaseAssetAmount, closeDate, tokenWeight, tokenDecimals, assetDecimals);
    await approveTransfer(standartTokenContract, tokensaleAddress, 0, tokenDecimals)
    var storage = await getFullStorage(tokensale, fa12Address);
    storageAssert(storage, true, totalTokenAmount, totalBaseAssetAmount, fa12Address, closeDate, tokenWeight);
    
    for (let i = 0; i < purchaseBaseAsset.length; ++i) {
        let purchaseBaseAssetAmount = purchaseBaseAsset[i]
        const correctDeltaTokens = getTokenAmount(toFloat(totalBaseAssetAmount), toFloat(totalTokenAmount), toFloat(purchaseBaseAssetAmount), toFloat(1) - toFloat(tokenWeight), toFloat(tokenWeight))
        
        await buyToken(tokensale1, purchaseBaseAssetAmount, fa12Address)
        var storage = await getFullStorage(tokensale1, fa12Address);
        totalTokenAmount -= toNumber(correctDeltaTokens, tokenDecimals)
        totalBaseAssetAmount += purchaseBaseAssetAmount
        storageAssert(storage, true, totalTokenAmount, totalBaseAssetAmount, fa12Address, closeDate, tokenWeight)
    }

    await closeSale(tokensale, fa12Address);
    storage = await getFullStorage(tokensale, fa12Address);
    storageAssert(storage, false, totalTokenAmount, totalBaseAssetAmount, fa12Address, closeDate, tokenWeight);
}

const executeTests = async () => {
    const tests = [
        () => testOpenTwice(),
        () => testCloseClosed(),
        () => testTokenPurchase(),
        () => testInvalidToken(),
        () => testPurchuaseNonExistingToken(),
        () => testPurchuaseAfterClosure(),
        () => testManyPurchasings(),
    ];
    for (let test of tests) {
        await test()
    }
}

try {
    executeTests().catch(console.log);
} catch (ex) { 
    console.log(ex)
    throw "Tests were not passed"
}
