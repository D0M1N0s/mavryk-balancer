import {toFloat, toNumber, getFullStorage, getContract,
    storageAssert, getTokenAmount, createTezosFromHangzhou} from "./common_functions.js"

import assert from 'assert';
import fs  from "fs";

const { address } = JSON.parse(fs.readFileSync("../deployed/fa12-latest.json").toString())

const getAccounts = async () => {
    const Tezos = await createTezosFromHangzhou('../hangzhounet.json');
    const Tezos1 = await createTezosFromHangzhou('./accounts/buyer1.json');
    const tokensaleAddress = address;
    const fa12Address = "KT1VE7N21H9X48yk1bGjikDDrSFGWDvsJVyb";
    const acc = JSON.parse(fs.readFileSync('../hangzhounet.json'));
    const acc2 = JSON.parse(fs.readFileSync('./accounts/buyer1.json'));
    const issuerAddress = acc.pkh;
    const customerAddress = acc2.pkh;
    return { Tezos, Tezos1, tokensaleAddress, fa12Address, issuerAddress, customerAddress}
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

const openSale = async(tokensaleContract, fa12Address, totalTokenAmount, totalBaseAssetAmount, closeDate, tokenWeight, tokenDecimals, assetDecimals, adminAddress) => {
    console.log(`Opening tokensale for ${fa12Address} with ${totalBaseAssetAmount}ꜩ and ${totalTokenAmount} tokens of ${tokenWeight} weight`)
    const operation = await tokensaleContract.methods.openSale(fa12Address, toFloat(totalTokenAmount), toFloat(totalBaseAssetAmount), 
        closeDate, toFloat(tokenWeight), toFloat(1) - toFloat(tokenWeight), tokenDecimals, assetDecimals, "DMN", adminAddress).send();
    
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

const buyToken = async(tokensaleContract, purchaseBaseAssetAmount, fa12Address, recieverAddress) => {
    console.log(`Purchuasing tokens ${fa12Address} by price ${purchaseBaseAssetAmount}ꜩ`)
    const op = await tokensaleContract.methods.buyToken(toFloat(purchaseBaseAssetAmount), fa12Address, recieverAddress)
        .send()
    await op.confirmation()
    assert(op.status === 'applied', 'Operation was not applied')
    console.log("Operation confirmed");
}

const testOpenTwice = async () => {
    const {Tezos, tokensaleAddress, fa12Address, issuerAddress} = await getAccounts();
    const tokensaleContract = await getContract(Tezos, tokensaleAddress);
    const standartTokenContract = await getContract(Tezos, fa12Address);

    const {totalTokenAmount, totalBaseAssetAmount, 
        closeDate, tokenWeight, tokenDecimals, assetDecimals} = await getTestInput();
        
    await approveTransfer(standartTokenContract, tokensaleAddress, totalTokenAmount, tokenDecimals)
    await openSale(tokensaleContract, fa12Address, totalTokenAmount, totalBaseAssetAmount, closeDate, tokenWeight, tokenDecimals, assetDecimals, issuerAddress);
    await approveTransfer(standartTokenContract, tokensaleAddress, 0, tokenDecimals)
    
    var storage = await getFullStorage(tokensaleContract, fa12Address);
    storageAssert(storage, issuerAddress, true, totalTokenAmount, totalBaseAssetAmount, fa12Address, closeDate, tokenWeight);
    let thrown = false;
    try {
        await openSale(tokensaleContract, fa12Address, totalTokenAmount, totalBaseAssetAmount, closeDate, tokenWeight, tokenDecimals, assetDecimals, issuerAddress);
    } catch (ex) { 
        thrown = true; 
        assert(ex.message == "Tokensale is already open", `Unepected exception: ${ex.message}`)
        storage = await getFullStorage(tokensaleContract, fa12Address);
        storageAssert(storage, issuerAddress, true, totalTokenAmount, totalBaseAssetAmount, fa12Address, closeDate, tokenWeight);
    }
    assert(thrown)

    await closeSale(tokensaleContract, fa12Address);
    storage = await getFullStorage(tokensaleContract, fa12Address);
    storageAssert(storage, issuerAddress, false, totalTokenAmount, totalBaseAssetAmount, fa12Address, closeDate, tokenWeight);
}

const testCloseClosed = async() => {
    const {Tezos, tokensaleAddress, fa12Address, issuerAddress} = await getAccounts();
    const tokensaleContract = await getContract(Tezos, tokensaleAddress);
    const standartTokenContract = await getContract(Tezos, fa12Address);
    
    const {totalTokenAmount, totalBaseAssetAmount, closeDate, tokenWeight, tokenDecimals, assetDecimals} = await getTestInput();

    await approveTransfer(standartTokenContract, tokensaleAddress, totalTokenAmount, tokenDecimals)
    await openSale(tokensaleContract, fa12Address, totalTokenAmount, totalBaseAssetAmount, closeDate, tokenWeight, tokenDecimals, assetDecimals, issuerAddress);
    await approveTransfer(standartTokenContract, tokensaleAddress, 0, tokenDecimals)

    var storage = await getFullStorage(tokensaleContract, fa12Address);
    storageAssert(storage, issuerAddress, true, totalTokenAmount, totalBaseAssetAmount, fa12Address, closeDate, tokenWeight);
    await closeSale(tokensaleContract, fa12Address);
    storage = await getFullStorage(tokensaleContract, fa12Address);

    let thrown = false;
    try {
        await closeSale(tokensaleContract, fa12Address);
    } catch (ex) { 
        thrown = true; 
        assert(ex.message == "Tokensale is already closed", `Unepected exception: ${ex.message}`)
        storage = await getFullStorage(tokensaleContract, fa12Address);
        storageAssert(storage, issuerAddress, false, totalTokenAmount, totalBaseAssetAmount, fa12Address, closeDate, tokenWeight);
    }
    assert(thrown)
    storageAssert(storage, issuerAddress, false, totalTokenAmount, totalBaseAssetAmount, fa12Address, closeDate, tokenWeight);
}

const testTokenPurchase = async() => {
    const {Tezos, tokensaleAddress, fa12Address, issuerAddress} = await getAccounts();
    const tokensaleContract = await getContract(Tezos, tokensaleAddress);
    const standartTokenContract = await getContract(Tezos, fa12Address);
    const {closeDate, tokenWeight, tokenDecimals, assetDecimals} = await getTestInput();
    
    let totalTokenAmount = 2000;
    let totalBaseAssetAmount = 40;
    let purchaseBaseAssetAmount = 10;

    await approveTransfer(standartTokenContract, tokensaleAddress, totalTokenAmount, tokenDecimals)
    await openSale(tokensaleContract, fa12Address, totalTokenAmount, totalBaseAssetAmount, closeDate, tokenWeight, tokenDecimals, assetDecimals, issuerAddress);
    await approveTransfer(standartTokenContract, tokensaleAddress, 0, tokenDecimals)
    var storage = await getFullStorage(tokensaleContract, fa12Address);
    storageAssert(storage, issuerAddress, true, totalTokenAmount, totalBaseAssetAmount, fa12Address, closeDate, tokenWeight);
    const correctDeltaTokens = getTokenAmount(toFloat(totalBaseAssetAmount), toFloat(totalTokenAmount), toFloat(purchaseBaseAssetAmount), toFloat(1) - toFloat(tokenWeight), toFloat(tokenWeight))
    
    await buyToken(tokensaleContract, purchaseBaseAssetAmount, fa12Address, issuerAddress)
    var storage = await getFullStorage(tokensaleContract, fa12Address);
    
    totalTokenAmount -= toNumber(correctDeltaTokens, tokenDecimals);
    totalBaseAssetAmount += purchaseBaseAssetAmount
    storageAssert(storage, issuerAddress, true, totalTokenAmount, totalBaseAssetAmount, fa12Address, closeDate, tokenWeight)
    
    await closeSale(tokensaleContract, fa12Address);
    storage = await getFullStorage(tokensaleContract, fa12Address);
    storageAssert(storage, issuerAddress, false, totalTokenAmount, totalBaseAssetAmount, fa12Address, closeDate, tokenWeight);
}

const testInvalidToken = async() => {
    const {Tezos, tokensaleAddress, issuerAddress} = await getAccounts();
    const tokensaleContract = await getContract(Tezos, tokensaleAddress);
    const fa12Invalid = 'tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb'

    const {totalTokenAmount, totalBaseAssetAmount, closeDate, tokenWeight, tokenDecimals, assetDecimals} = await getTestInput();
    
    let thrown = false;
    try {
        await openSale(tokensaleContract, fa12Invalid, totalTokenAmount, totalBaseAssetAmount, closeDate, tokenWeight, tokenDecimals, assetDecimals, issuerAddress);
    } catch (ex) {
        thrown = true;
        assert(ex.message == "Contract for this token not found.", `Unepected exception: ${ex.message}`)
    }
    assert(thrown)
}

const testPurchuaseNonExistingToken = async() => {
    const {Tezos, tokensaleAddress, issuerAddress} = await getAccounts();
    const tokensaleContract = await getContract(Tezos, tokensaleAddress);
    let fa12Address = 'KT1HE3TujvVFFUUCo7DvGRqtr9sovcJ3pwkh'
    let purchaseBaseAssetAmount = 10;
    let thrown = false;
    try {
        await buyToken(tokensaleContract, purchaseBaseAssetAmount, fa12Address, issuerAddress)
    } catch(ex) {
        thrown = true;
        assert(ex.message == 'No such token', `Unepected exception: ${ex.message}`)
    }
    assert(thrown)
}

const testPurchuaseAfterClosure = async() => {
    const {Tezos, tokensaleAddress, fa12Address, issuerAddress} = await getAccounts();
    const tokensaleContract = await getContract(Tezos, tokensaleAddress);
    const standartTokenContract = await getContract(Tezos, fa12Address);
    
    let totalTokenAmount = 2000;
    let totalBaseAssetAmount = 40;
    let purchaseBaseAssetAmount = 10;
    const {closeDate, tokenWeight, tokenDecimals, assetDecimals} = await getTestInput();

    await approveTransfer(standartTokenContract, tokensaleAddress, totalTokenAmount, tokenDecimals)
    await openSale(tokensaleContract, fa12Address, totalTokenAmount, totalBaseAssetAmount, closeDate, tokenWeight, tokenDecimals, assetDecimals, issuerAddress);
    await approveTransfer(standartTokenContract, tokensaleAddress, 0, tokenDecimals)
    var storage = await getFullStorage(tokensaleContract, fa12Address);
    storageAssert(storage, issuerAddress, true, totalTokenAmount, totalBaseAssetAmount, fa12Address, closeDate, tokenWeight);
    
    await closeSale(tokensaleContract, fa12Address);
    storage = await getFullStorage(tokensaleContract, fa12Address);
    storageAssert(storage, issuerAddress, false, totalTokenAmount, totalBaseAssetAmount, fa12Address, closeDate, tokenWeight);
    let thrown = false
    try {
        await buyToken(tokensaleContract, purchaseBaseAssetAmount, fa12Address, issuerAddress)
    } catch(ex) {
        thrown = true
        assert(ex.message == 'Tokensale is closed', `Unepected exception: ${ex.message}`)
        storage = await getFullStorage(tokensaleContract, fa12Address);
        storageAssert(storage, issuerAddress, false, totalTokenAmount, totalBaseAssetAmount, fa12Address, closeDate, tokenWeight)
    }
    assert(thrown)
}

const testManyPurchasings = async() => {
    const {Tezos, tokensaleAddress, fa12Address, issuerAddress, customerAddress} = await getAccounts();
    const tokensale = await getContract(Tezos, tokensaleAddress);
    const standartTokenContract = await getContract(Tezos, fa12Address);
    
    let totalTokenAmount = 2000;
    let totalBaseAssetAmount = 40;
    let purchaseBaseAsset = [10, 14, 87, 7, 43, 107];
    const {closeDate, tokenWeight, tokenDecimals, assetDecimals} = await getTestInput();
    
    await approveTransfer(standartTokenContract, tokensaleAddress, totalTokenAmount, tokenDecimals)
    await openSale(tokensale, fa12Address, totalTokenAmount, totalBaseAssetAmount, closeDate, tokenWeight, tokenDecimals, assetDecimals, issuerAddress);
    await approveTransfer(standartTokenContract, tokensaleAddress, 0, tokenDecimals)
    var storage = await getFullStorage(tokensale, fa12Address);
    storageAssert(storage, issuerAddress, true, totalTokenAmount, totalBaseAssetAmount, fa12Address, closeDate, tokenWeight);
    
    for (let i = 0; i < purchaseBaseAsset.length; ++i) {
        let purchaseBaseAssetAmount = purchaseBaseAsset[i]
        const correctDeltaTokens = getTokenAmount(toFloat(totalBaseAssetAmount), toFloat(totalTokenAmount), toFloat(purchaseBaseAssetAmount), toFloat(1) - toFloat(tokenWeight), toFloat(tokenWeight))
        
        await buyToken(tokensale, purchaseBaseAssetAmount, fa12Address, customerAddress)
        var storage = await getFullStorage(tokensale, fa12Address);
        totalTokenAmount -= toNumber(correctDeltaTokens, tokenDecimals)
        totalBaseAssetAmount += purchaseBaseAssetAmount
        storageAssert(storage, issuerAddress, true, totalTokenAmount, totalBaseAssetAmount, fa12Address, closeDate, tokenWeight)
    }

    await closeSale(tokensale, fa12Address);
    storage = await getFullStorage(tokensale, fa12Address);
    storageAssert(storage, issuerAddress, false, totalTokenAmount, totalBaseAssetAmount, fa12Address, closeDate, tokenWeight);
}

const testNotAdmin = async() => {
    const {Tezos1, tokensaleAddress, fa12Address, issuerAddress} = await getAccounts();
    const tokensaleContract = await getContract(Tezos1, tokensaleAddress);
    
    let thrown = false;
    try {
        await closeSale(tokensaleContract, fa12Address);
    } catch(ex) {
        thrown = true
        assert(ex.message == 'Not admin', `Unepected exception: ${ex.message}`)
    }
    assert(thrown);

    thrown = false;
    const {totalTokenAmount, totalBaseAssetAmount, closeDate, tokenWeight, tokenDecimals, assetDecimals} = await getTestInput();
    try {
        await openSale(tokensaleContract, fa12Address, totalTokenAmount, totalBaseAssetAmount, closeDate, tokenWeight, tokenDecimals, assetDecimals, issuerAddress);
    } catch(ex) {
        thrown = true
        assert(ex.message == 'Not admin', `Unepected exception: ${ex.message}`)
    }
    assert(thrown);

    thrown = false;
    try {
        await buyToken(tokensaleContract, 10, fa12Address, issuerAddress);
    } catch(ex) {
        thrown = true
        assert(ex.message == 'Not admin', `Unepected exception: ${ex.message}`)
    }
    assert(thrown);
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
        () => testNotAdmin(),
    ];
    for (let test of tests) {
        await test()
    }
}

try {
    await executeTests();
    console.log("Tests were passed");
} catch (ex) { 
    console.log(ex)
    throw "Tests were not passed";
}