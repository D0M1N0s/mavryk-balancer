import {toFloat, toNumber, getFullStorage, getContract,
    storageAssert, getTokenAmount, createTezosFromHangzhou} from "./common_functions.js"

import assert from 'assert';
import fs  from "fs";

const { address } = JSON.parse(fs.readFileSync("../deployed/fa2-latest.json").toString())

const getAccounts = async () => {
    const Tezos = await createTezosFromHangzhou('../hangzhounet.json');
    const acc = JSON.parse(fs.readFileSync('../hangzhounet.json'));
    const issuerAddress = acc.pkh;
    const acc2 = JSON.parse(fs.readFileSync('./accounts/buyer1.json'));
    const customerAddress = acc2.pkh;
    const Tezos1 = await createTezosFromHangzhou('./accounts/buyer1.json');
    const Tezos2 = await createTezosFromHangzhou('./accounts/buyer2.json');
    const Tezos3 = await createTezosFromHangzhou('./accounts/buyer3.json');
    const tokensaleAddress = address;
    const fa2Address = "KT1KuLPcMBkfZeVLTvr2JDrazHUnf6pkvEwF"; //'KT1KH8end6E7LN4RSLJQxUJoa1H9uKC78NkK';
    return { Tezos, Tezos1, Tezos2, Tezos3, issuerAddress, tokensaleAddress, fa2Address, customerAddress};
}

const getTestInput = async() => {
    const totalTokenAmount = 2;
    const totalBaseAssetAmount = 4;
    const closeDate = "2022-01-01T00:01:30.000Z";
    const tokenWeight = 0.7;
    const tokenDecimals = 8;
    const assetDecimals = 6;
    const tokenId = 0;
    return {totalTokenAmount, totalBaseAssetAmount, closeDate, 
        tokenWeight, tokenDecimals, assetDecimals, tokenId};
}

const addOperator = async(standartTokenContract, ownerAddress, tokensaleAddress, tokenId) => {
    console.log(`Adding operator for tokensale ${tokensaleAddress}`);
    const operation = await standartTokenContract.methods.update_operators([
        {
          add_operator: {
            owner: ownerAddress,
            operator: tokensaleAddress,
            token_id: tokenId
          }
        }
      ]).send();
    await operation.confirmation();
    console.log("Operation confirmed");
}

const removeOperator = async(standartTokenContract, ownerAddress, tokensaleAddress, tokenId) => {
    console.log(`Removing operator for tokensale ${tokensaleAddress}`);
    const operation = await standartTokenContract.methods.update_operators([
        {
          remove_operator: {
            owner: ownerAddress,
            operator: tokensaleAddress,
            token_id: tokenId
          }
        }
      ]).send();
    await operation.confirmation();
    console.log("Operation confirmed");
}

const openSale = async(tokensaleContract, fa2Address, totalTokenAmount, totalBaseAssetAmount, closeDate, tokenWeight, tokenId, tokenDecimals, assetDecimals, adminAddress) => {
    console.log(`Opening tokensale for ${fa2Address} with ${totalBaseAssetAmount}ꜩ and ${totalTokenAmount} tokens of ${tokenWeight} weight`)
    const operation = await tokensaleContract.methods.openSale(fa2Address, toFloat(totalTokenAmount), toFloat(totalBaseAssetAmount), 
        closeDate, toFloat(tokenWeight), toFloat(1) - toFloat(tokenWeight), tokenId, tokenDecimals, assetDecimals, "DMN", adminAddress).send();
    
    await operation.confirmation();
    assert(operation.status === 'applied', 'Operation was not applied');
    console.log("Operation confirmed");
}

const closeSale = async(tokensaleContract, fa2Address) => {
    console.log(`Closing tokensale for ${fa2Address}`)
    const operation = await tokensaleContract.methods.closeSale(fa2Address).send();
    await operation.confirmation();
    assert(operation.status === 'applied', 'Operation was not applied')
    console.log("Operation confirmed");
}

const buyToken = async(tokensaleContract, purchaseBaseAssetAmount, fa2Address, recieverAddress) => {
    console.log(`Purchuasing tokens ${fa2Address} by price ${purchaseBaseAssetAmount}ꜩ`)
    const op = await tokensaleContract.methods.buyToken(toFloat(purchaseBaseAssetAmount), fa2Address, recieverAddress).send()
    await op.confirmation()
    assert(op.status === 'applied', 'Operation was not applied')
    console.log("Operation confirmed");
}

const testOpenTwice = async () => {
    const {Tezos, tokensaleAddress, fa2Address, issuerAddress} = await getAccounts();
    const tokensaleContract = await getContract(Tezos, tokensaleAddress);
    const standartTokenContract = await getContract(Tezos, fa2Address);
    const {tokenId, tokenWeight, totalBaseAssetAmount, totalTokenAmount, closeDate, assetDecimals, tokenDecimals} = await getTestInput();
    
    await addOperator(standartTokenContract, issuerAddress, tokensaleAddress, tokenId)
    await openSale(tokensaleContract, fa2Address, totalTokenAmount, totalBaseAssetAmount, closeDate, tokenWeight, tokenId, tokenDecimals, assetDecimals, issuerAddress);
    await removeOperator(standartTokenContract, issuerAddress, tokensaleAddress, tokenId)
    
    var storage = await getFullStorage(tokensaleContract, fa2Address);
    storageAssert(storage, issuerAddress, true, totalTokenAmount, totalBaseAssetAmount, fa2Address, closeDate, tokenWeight);
    
    let thrown = false;
    try {
        await openSale(tokensaleContract, fa2Address, totalTokenAmount, totalBaseAssetAmount, closeDate, tokenWeight, tokenId, tokenDecimals, assetDecimals, issuerAddress);
    } catch (ex) { 
        thrown = true;
        assert(ex.message == "Tokensale is already open")
        storage = await getFullStorage(tokensaleContract, fa2Address);
        storageAssert(storage, issuerAddress, true, totalTokenAmount, totalBaseAssetAmount, fa2Address, closeDate, tokenWeight);
    }
    assert(thrown)

    await closeSale(tokensaleContract, fa2Address);
    storage = await getFullStorage(tokensaleContract, fa2Address);
    storageAssert(storage, issuerAddress, false, totalTokenAmount, totalBaseAssetAmount, fa2Address, closeDate, tokenWeight);
}

const testCloseClosed = async() => {
    const {Tezos, tokensaleAddress, fa2Address, issuerAddress} = await getAccounts();
    const tokensaleContract = await getContract(Tezos, tokensaleAddress);
    const standartTokenContract = await getContract(Tezos, fa2Address);

    const {tokenId, tokenWeight, totalBaseAssetAmount, totalTokenAmount, closeDate, assetDecimals, tokenDecimals} = await getTestInput();
    
    await addOperator(standartTokenContract, issuerAddress, tokensaleAddress, tokenId)
    await openSale(tokensaleContract, fa2Address, totalTokenAmount, totalBaseAssetAmount, closeDate, tokenWeight, tokenId, tokenDecimals, assetDecimals, issuerAddress);
    await removeOperator(standartTokenContract, issuerAddress, tokensaleAddress, tokenId)
    
    var storage = await getFullStorage(tokensaleContract, fa2Address);
    storageAssert(storage, issuerAddress, true, totalTokenAmount, totalBaseAssetAmount, fa2Address, closeDate, tokenWeight);
    await closeSale(tokensaleContract, fa2Address);
    storage = await getFullStorage(tokensaleContract, fa2Address);

    let thrown = false;
    try {
        await closeSale(tokensaleContract, fa2Address);
    } catch (ex) { 
        thrown = true; 
        assert(ex.message == "Tokensale is already closed")
        storage = await getFullStorage(tokensaleContract, fa2Address);
        storageAssert(storage, issuerAddress, false, totalTokenAmount, totalBaseAssetAmount, fa2Address, closeDate, tokenWeight);
    }
    assert(thrown)
    storageAssert(storage, issuerAddress, false, totalTokenAmount, totalBaseAssetAmount, fa2Address, closeDate, tokenWeight);
}

const testInvalidToken = async() => {
    const {Tezos, tokensaleAddress, issuerAddress} = await getAccounts();
    const tokensaleContract = await getContract(Tezos, tokensaleAddress);
    const fa2Invalid = 'tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb'

    const {tokenId, tokenWeight, totalBaseAssetAmount, totalTokenAmount, closeDate, assetDecimals, tokenDecimals} = await getTestInput();
    
    let thrown = false;
    try {
        await openSale(tokensaleContract, fa2Invalid, totalTokenAmount, totalBaseAssetAmount, closeDate, tokenWeight, tokenId, tokenDecimals, assetDecimals, issuerAddress);
    } catch (ex) {
        thrown = true;
        assert(ex.message == "Contract for this token not found.")
    }
    assert(thrown)
}
const testTokenPurchase = async() => {
    const {Tezos, tokensaleAddress, fa2Address, issuerAddress} = await getAccounts();
    const tokensaleContract = await getContract(Tezos, tokensaleAddress);
    const standartTokenContract = await getContract(Tezos, fa2Address);

    let totalTokenAmount = 2000;
    let totalBaseAssetAmount = 40;
    let purchaseBaseAssetAmount = 10;
    const {tokenId, tokenWeight, closeDate, assetDecimals, tokenDecimals} = await getTestInput();
    
    await addOperator(standartTokenContract, issuerAddress, tokensaleAddress, tokenId)
    await openSale(tokensaleContract, fa2Address, totalTokenAmount, totalBaseAssetAmount, closeDate, tokenWeight, tokenId, tokenDecimals, assetDecimals, issuerAddress);
    await removeOperator(standartTokenContract, issuerAddress, tokensaleAddress, tokenId)
    var storage = await getFullStorage(tokensaleContract, fa2Address);
    storageAssert(storage, issuerAddress, true, totalTokenAmount, totalBaseAssetAmount, fa2Address, closeDate, tokenWeight);
    
    await buyToken(tokensaleContract, purchaseBaseAssetAmount, fa2Address, issuerAddress);
    var storage = await getFullStorage(tokensaleContract, fa2Address);
    const correctDeltaTokens = getTokenAmount(toFloat(totalBaseAssetAmount), toFloat(totalTokenAmount), toFloat(purchaseBaseAssetAmount), toFloat(1) - toFloat(tokenWeight), toFloat(tokenWeight))
    
    totalTokenAmount -= toNumber(correctDeltaTokens, tokenDecimals)
    totalBaseAssetAmount += purchaseBaseAssetAmount
    storageAssert(storage, issuerAddress, true, totalTokenAmount, totalBaseAssetAmount, fa2Address, closeDate, tokenWeight)
    
    await closeSale(tokensaleContract, fa2Address);
    storage = await getFullStorage(tokensaleContract, fa2Address);
    storageAssert(storage, issuerAddress, false, totalTokenAmount, totalBaseAssetAmount, fa2Address, closeDate, tokenWeight);
}

const testPurchuaseNonExistingToken = async() => {
    const {Tezos, tokensaleAddress, issuerAddress} = await getAccounts();
    const tokensaleContract = await getContract(Tezos, tokensaleAddress);
    let fa2Address = 'KT1PiqMJSEsZkFruWMKMpoAmRVumKk9LavX3'
    let purchaseBaseAssetAmount = 10;
    let thrown = false;
    try {
        await buyToken(tokensaleContract, purchaseBaseAssetAmount, fa2Address, issuerAddress)
    } catch(ex) {
        thrown = true;
        assert(ex.message == 'No such token')
    }
    assert(thrown)
}

const testPurchuaseAfterClosure = async() => {
    const {Tezos, tokensaleAddress, fa2Address, issuerAddress} = await getAccounts();
    const tokensaleContract = await getContract(Tezos, tokensaleAddress);
    const standartTokenContract = await getContract(Tezos, fa2Address);

    let totalTokenAmount = 2000;
    let totalBaseAssetAmount = 40;
    let purchaseBaseAssetAmount = 10;
    const {tokenId, tokenWeight, closeDate, assetDecimals, tokenDecimals} = await getTestInput();
   
    await addOperator(standartTokenContract, issuerAddress, tokensaleAddress, tokenId)
    await openSale(tokensaleContract, fa2Address, totalTokenAmount, totalBaseAssetAmount, closeDate, tokenWeight, tokenId, tokenDecimals, assetDecimals, issuerAddress);
    await removeOperator(standartTokenContract, issuerAddress, tokensaleAddress, tokenId)
    
    var storage = await getFullStorage(tokensaleContract, fa2Address);
    storageAssert(storage, issuerAddress, true, totalTokenAmount, totalBaseAssetAmount, fa2Address, closeDate, tokenWeight);
    
    await closeSale(tokensaleContract, fa2Address);
    storage = await getFullStorage(tokensaleContract, fa2Address);
    storageAssert(storage, issuerAddress, false, totalTokenAmount, totalBaseAssetAmount, fa2Address, closeDate, tokenWeight);
    let thrown = false
    try {
        await buyToken(tokensaleContract, purchaseBaseAssetAmount, fa2Address, issuerAddress)
    } catch(ex) {
        thrown = true
        assert(ex.message == 'Tokensale is closed')
        storage = await getFullStorage(tokensaleContract, fa2Address);
        storageAssert(storage, issuerAddress, false, totalTokenAmount, totalBaseAssetAmount, fa2Address, closeDate, tokenWeight)
    }
    assert(thrown)
}
const testManyPurchasings = async() => {
    const {Tezos, Tezos1, tokensaleAddress, fa2Address, issuerAddress, customerAddress} = await getAccounts();
    const tokensale = await getContract(Tezos, tokensaleAddress);
    const standartTokenContract = await getContract(Tezos, fa2Address);

    let totalTokenAmount = 2000;
    let totalBaseAssetAmount = 40;
    let purchaseBaseAsset = [10, 14, 87, 7, 43, 107];
    const {tokenId, tokenWeight, closeDate, assetDecimals, tokenDecimals} = await getTestInput();
    
    await addOperator(standartTokenContract, issuerAddress, tokensaleAddress, tokenId)
    await openSale(tokensale, fa2Address, totalTokenAmount, totalBaseAssetAmount, closeDate, tokenWeight, tokenId, tokenDecimals, assetDecimals, issuerAddress);
    await removeOperator(standartTokenContract, issuerAddress, tokensaleAddress, tokenId)
    var storage = await getFullStorage(tokensale, fa2Address);
    storageAssert(storage, issuerAddress, true, totalTokenAmount, totalBaseAssetAmount, fa2Address, closeDate, tokenWeight);
    
    for (let i = 0; i < purchaseBaseAsset.length; ++i) {
        let purchaseBaseAssetAmount = purchaseBaseAsset[i]
        const correctDeltaTokens = getTokenAmount(toFloat(totalBaseAssetAmount), toFloat(totalTokenAmount), toFloat(purchaseBaseAssetAmount), toFloat(1) - toFloat(tokenWeight), toFloat(tokenWeight))
        await buyToken(tokensale, purchaseBaseAssetAmount, fa2Address, customerAddress);
        var storage = await getFullStorage(tokensale, fa2Address);
        totalTokenAmount -= toNumber(correctDeltaTokens, tokenDecimals)
        totalBaseAssetAmount += purchaseBaseAssetAmount
        storageAssert(storage, issuerAddress, true, totalTokenAmount, totalBaseAssetAmount, fa2Address, closeDate, tokenWeight)
    }

    await closeSale(tokensale, fa2Address);
    storage = await getFullStorage(tokensale, fa2Address);
    storageAssert(storage, issuerAddress, false, totalTokenAmount, totalBaseAssetAmount, fa2Address, closeDate, tokenWeight);
}

const testNotAdmin = async() => {
    const {Tezos1, tokensaleAddress, fa2Address, issuerAddress} = await getAccounts();
    const tokensaleContract = await getContract(Tezos1, tokensaleAddress);
    
    let thrown = false;
    try {
        await closeSale(tokensaleContract, fa2Address);
    } catch(ex) {
        thrown = true;
        assert(ex.message == 'Not admin', `Unepected exception: ${ex.message}`);
    }
    assert(thrown);

    thrown = false;
    const {totalTokenAmount, totalBaseAssetAmount, closeDate, tokenWeight, tokenDecimals, assetDecimals, tokenId} = await getTestInput();
    try {
        await openSale(tokensaleContract, fa2Address, totalTokenAmount, totalBaseAssetAmount, closeDate, tokenWeight, tokenId, tokenDecimals, assetDecimals, issuerAddress);
    } catch(ex) {
        thrown = true;
        assert(ex.message == 'Not admin', `Unepected exception: ${ex.message}`);
    }
    assert(thrown);

    thrown = false;
    try {
        await buyToken(tokensaleContract, 10, fa2Address, issuerAddress);
    } catch(ex) {
        thrown = true;
        assert(ex.message == 'Not admin', `Unepected exception: ${ex.message}`);
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
        await test();
    }
}

try {
    await executeTests();
    console.log("Tests were passed");
} catch (ex) { 
    console.log(ex)
    throw "Tests were not passed";
}
