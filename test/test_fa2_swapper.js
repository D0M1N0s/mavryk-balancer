import {toFloat, toNumber, getFullStorage, getContract,
    storage_assert, get_token_amount, createTezosFromHangzhou} from "./common_functions.js"

import assert from 'assert';
import fs  from "fs";

const { address } = JSON.parse(fs.readFileSync("../deployed/fa2-latest.json").toString())

const getAccounts = async () => {
    const Tezos = await createTezosFromHangzhou('../hangzhounet.json');
    const acc = JSON.parse(fs.readFileSync('../hangzhounet.json')); // require('../hangzhounet.json')
    const issuer_address = acc.pkh;
    const Tezos1 = await createTezosFromHangzhou('./accounts/buyer1.json');
    const Tezos2 = await createTezosFromHangzhou('./accounts/buyer2.json');
    const Tezos3 = await createTezosFromHangzhou('./accounts/buyer3.json');
    const tokensale_address = address;
    const fa2_address = "KT1KuLPcMBkfZeVLTvr2JDrazHUnf6pkvEwF"; //'KT1KH8end6E7LN4RSLJQxUJoa1H9uKC78NkK';
    return { Tezos, Tezos1, Tezos2, Tezos3, issuer_address, tokensale_address, fa2_address};
}

const getTestInput = async() => {
    const total_token_amount = 2;
    const total_base_asset_amount = 4;
    const close_date = "2022-01-01T00:01:30.000Z";
    const token_weight = 0.7;
    const token_decimals = 8;
    const asset_decimals = 6;
    const token_id = 0;
    return {total_token_amount, total_base_asset_amount, close_date, 
        token_weight, token_decimals, asset_decimals, token_id};
}

const add_operator = async(standart_token_contract, owner_address, tokensale_address, token_id) => {
    console.log(`Adding operator for tokensale ${tokensale_address}`);
    const operation = await standart_token_contract.methods.update_operators([
        {
          add_operator: {
            owner: owner_address,
            operator: tokensale_address,
            token_id: token_id
          }
        }
      ]).send();
    await operation.confirmation();
    console.log("Operation confirmed");
}

const remove_operator = async(standart_token_contract, owner_address, tokensale_address, token_id) => {
    console.log(`Removing operator for tokensale ${tokensale_address}`);
    const operation = await standart_token_contract.methods.update_operators([
        {
          remove_operator: {
            owner: owner_address,
            operator: tokensale_address,
            token_id: token_id
          }
        }
      ]).send();
    await operation.confirmation();
    console.log("Operation confirmed");
}

const open_sale = async(tokensale_contract, fa2_address, total_token_amount, total_base_asset_amount, close_date, token_weight, token_id, token_decimals, asset_decimals) => {
    console.log(`Opening tokensale for ${fa2_address} with ${total_base_asset_amount}ꜩ and ${total_token_amount} tokens of ${token_weight} weight`)
    const operation = await tokensale_contract.methods.openSale(fa2_address, toFloat(total_token_amount), toFloat(total_base_asset_amount), 
        close_date, toFloat(token_weight), toFloat(1) - toFloat(token_weight), token_id, token_decimals, asset_decimals, "DMN").send();
    
    await operation.confirmation();
    assert(operation.status === 'applied', 'Operation was not applied');
    console.log("Operation confirmed");
}

const close_sale = async(tokensale_contract, fa2_address) => {
    console.log(`Closing tokensale for ${fa2_address}`)
    const operation = await tokensale_contract.methods.closeSale(fa2_address).send();
    await operation.confirmation();
    assert(operation.status === 'applied', 'Operation was not applied')
    console.log("Operation confirmed");
}

const buy_token = async(tokensale_contract, purchase_base_asset_amount, fa2_address) => {
    console.log(`Purchuasing tokens ${fa2_address} by price ${purchase_base_asset_amount}ꜩ`)
    const op = await tokensale_contract.methods.buyToken(toFloat(purchase_base_asset_amount), fa2_address).send()
    await op.confirmation()
    assert(op.status === 'applied', 'Operation was not applied')
    console.log("Operation confirmed");
}

const test_open_twice = async () => {
    const {Tezos, tokensale_address, fa2_address, issuer_address} = await getAccounts();
    const tokensale_contract = await getContract(Tezos, tokensale_address);
    const standart_token_contract = await getContract(Tezos, fa2_address);

    const {token_id, token_weight, total_base_asset_amount, total_token_amount, close_date, asset_decimals, token_decimals} = await getTestInput();
    
    await add_operator(standart_token_contract, issuer_address, tokensale_address, token_id)
    await open_sale(tokensale_contract, fa2_address, total_token_amount, total_base_asset_amount, close_date, token_weight, token_id, token_decimals, asset_decimals);
    await remove_operator(standart_token_contract, issuer_address, tokensale_address, token_id)
    var storage = await getFullStorage(tokensale_contract, fa2_address);
    
    storage_assert(storage, true, total_token_amount, total_base_asset_amount, fa2_address, close_date, token_weight);
    let thrown = false;
    try {
        await open_sale(tokensale_contract, fa2_address, total_token_amount, total_base_asset_amount, close_date, token_weight, token_id, token_decimals, asset_decimals);
    } catch (ex) { 
        thrown = true; 
        assert(ex.message == "Tokensale is already open")
        storage = await getFullStorage(tokensale_contract, fa2_address);
        storage_assert(storage, true, total_token_amount, total_base_asset_amount, fa2_address, close_date, token_weight);
    }
    assert(thrown)

    await close_sale(tokensale_contract, fa2_address);
    storage = await getFullStorage(tokensale_contract, fa2_address);
    storage_assert(storage, false, total_token_amount, total_base_asset_amount, fa2_address, close_date, token_weight);
}

const test_close_closed = async() => {
    const {Tezos, tokensale_address, fa2_address, issuer_address} = await getAccounts();
    const tokensale_contract = await getContract(Tezos, tokensale_address);
    const standart_token_contract = await getContract(Tezos, fa2_address);

    const {token_id, token_weight, total_base_asset_amount, total_token_amount, close_date, asset_decimals, token_decimals} = await getTestInput();
    
    await add_operator(standart_token_contract, issuer_address, tokensale_address, token_id)
    await open_sale(tokensale_contract, fa2_address, total_token_amount, total_base_asset_amount, close_date, token_weight, token_id, token_decimals, asset_decimals);
    await remove_operator(standart_token_contract, issuer_address, tokensale_address, token_id)
    
    var storage = await getFullStorage(tokensale_contract, fa2_address);
    storage_assert(storage, true, total_token_amount, total_base_asset_amount, fa2_address, close_date, token_weight);
    await close_sale(tokensale_contract, fa2_address);
    storage = await getFullStorage(tokensale_contract, fa2_address);

    let thrown = false;
    try {
        await close_sale(tokensale_contract, fa2_address);
    } catch (ex) { 
        thrown = true; 
        assert(ex.message == "Tokensale is already closed")
        storage = await getFullStorage(tokensale_contract, fa2_address);
        storage_assert(storage, false, total_token_amount, total_base_asset_amount, fa2_address, close_date, token_weight);
    }
    assert(thrown)
    storage_assert(storage, false, total_token_amount, total_base_asset_amount, fa2_address, close_date, token_weight);
}

const test_invalid_token = async() => {
    const {Tezos, tokensale_address} = await getAccounts();
    const tokensale_contract = await getContract(Tezos, tokensale_address);
    const fa2_invalid = 'tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb'

    const {token_id, token_weight, total_base_asset_amount, total_token_amount, close_date, asset_decimals, token_decimals} = await getTestInput();
    
    let thrown = false;
    try {
        await open_sale(tokensale_contract, fa2_invalid, total_token_amount, total_base_asset_amount, close_date, token_weight, token_id, token_decimals, asset_decimals);
    } catch (ex) {
        thrown = true;
        assert(ex.message == "Contract for this token not found.")
    }
    assert(thrown)
}
const test_token_purchase = async() => {
    const {Tezos, tokensale_address, fa2_address, issuer_address} = await getAccounts();
    const tokensale_contract = await getContract(Tezos, tokensale_address);
    const standart_token_contract = await getContract(Tezos, fa2_address);

    let total_token_amount = 2000;
    let total_base_asset_amount = 40;
    let purchase_base_asset_amount = 10;
    const {token_id, token_weight, close_date, asset_decimals, token_decimals} = await getTestInput();
    
    await add_operator(standart_token_contract, issuer_address, tokensale_address, token_id)
    await open_sale(tokensale_contract, fa2_address, total_token_amount, total_base_asset_amount, close_date, token_weight, token_id, token_decimals, asset_decimals);
    await remove_operator(standart_token_contract, issuer_address, tokensale_address, token_id)
    var storage = await getFullStorage(tokensale_contract, fa2_address);
    storage_assert(storage, true, total_token_amount, total_base_asset_amount, fa2_address, close_date, token_weight);
    
    await buy_token(tokensale_contract, purchase_base_asset_amount, fa2_address)
    var storage = await getFullStorage(tokensale_contract, fa2_address);
    const correct_delta_tokens = get_token_amount(toFloat(total_base_asset_amount), toFloat(total_token_amount), toFloat(purchase_base_asset_amount), toFloat(1) - toFloat(token_weight), toFloat(token_weight))
    
    total_token_amount -= toNumber(correct_delta_tokens, token_decimals)
    total_base_asset_amount += purchase_base_asset_amount
    storage_assert(storage, true, total_token_amount, total_base_asset_amount, fa2_address, close_date, token_weight)
    
    await close_sale(tokensale_contract, fa2_address);
    storage = await getFullStorage(tokensale_contract, fa2_address);
    storage_assert(storage, false, total_token_amount, total_base_asset_amount, fa2_address, close_date, token_weight);
}

const test_purchuase_non_existing_token = async() => {
    const {Tezos, tokensale_address} = await getAccounts();
    const tokensale_contract = await getContract(Tezos, tokensale_address);
    let fa2_address = 'KT1PiqMJSEsZkFruWMKMpoAmRVumKk9LavX3'
    let purchase_base_asset_amount = 10;
    let thrown = false;
    try {
        await buy_token(tokensale_contract, purchase_base_asset_amount, fa2_address)
    } catch(ex) {
        thrown = true;
        assert(ex.message == 'No such token')
    }
    assert(thrown)
}

const test_purchuase_after_closure = async() => {
    const {Tezos, tokensale_address, fa2_address, issuer_address} = await getAccounts();
    const tokensale_contract = await getContract(Tezos, tokensale_address);
    const standart_token_contract = await getContract(Tezos, fa2_address);

    let total_token_amount = 2000;
    let total_base_asset_amount = 40;
    let purchase_base_asset_amount = 10;
    const {token_id, token_weight, close_date, asset_decimals, token_decimals} = await getTestInput();
   
    await add_operator(standart_token_contract, issuer_address, tokensale_address, token_id)
    await open_sale(tokensale_contract, fa2_address, total_token_amount, total_base_asset_amount, close_date, token_weight, token_id, token_decimals, asset_decimals);
    await remove_operator(standart_token_contract, issuer_address, tokensale_address, token_id)
    
    var storage = await getFullStorage(tokensale_contract, fa2_address);
    storage_assert(storage, true, total_token_amount, total_base_asset_amount, fa2_address, close_date, token_weight);
    
    await close_sale(tokensale_contract, fa2_address);
    storage = await getFullStorage(tokensale_contract, fa2_address);
    storage_assert(storage, false, total_token_amount, total_base_asset_amount, fa2_address, close_date, token_weight);
    let thrown = false
    try {
        await buy_token(tokensale_contract, purchase_base_asset_amount, fa2_address)
    } catch(ex) {
        thrown = true
        assert(ex.message == 'Tokensale is closed')
        storage = await getFullStorage(tokensale_contract, fa2_address);
        storage_assert(storage, false, total_token_amount, total_base_asset_amount, fa2_address, close_date, token_weight)
    }
    assert(thrown)
}
const test_many_purchasings = async() => {
    const {Tezos, Tezos1, tokensale_address, fa2_address, issuer_address} = await getAccounts();
    const tokensale = await getContract(Tezos, tokensale_address);
    const tokensale1 = await getContract(Tezos1, tokensale_address);
    const standart_token_contract = await getContract(Tezos, fa2_address);

    let total_token_amount = 2000;
    let total_base_asset_amount = 40;
    let purchase_base_asset = [10, 14, 87, 7]
    const {token_id, token_weight, close_date, asset_decimals, token_decimals} = await getTestInput();
    
    await add_operator(standart_token_contract, issuer_address, tokensale_address, token_id)
    await open_sale(tokensale, fa2_address, total_token_amount, total_base_asset_amount, close_date, token_weight, token_id, token_decimals, asset_decimals);
    await remove_operator(standart_token_contract, issuer_address, tokensale_address, token_id)
    var storage = await getFullStorage(tokensale, fa2_address);
    storage_assert(storage, true, total_token_amount, total_base_asset_amount, fa2_address, close_date, token_weight);
    
    for (let i = 0; i < 4; ++i) {
        let purchase_base_asset_amount = purchase_base_asset[i]
        const correct_delta_tokens = get_token_amount(toFloat(total_base_asset_amount), toFloat(total_token_amount), toFloat(purchase_base_asset_amount), toFloat(1) - toFloat(token_weight), toFloat(token_weight))
        await buy_token(tokensale1, purchase_base_asset_amount, fa2_address)
        var storage = await getFullStorage(tokensale1, fa2_address);
        total_token_amount -= toNumber(correct_delta_tokens, token_decimals)
        total_base_asset_amount += purchase_base_asset_amount
        storage_assert(storage, true, total_token_amount, total_base_asset_amount, fa2_address, close_date, token_weight)
    }

    await close_sale(tokensale, fa2_address);
    storage = await getFullStorage(tokensale, fa2_address);
    storage_assert(storage, false, total_token_amount, total_base_asset_amount, fa2_address, close_date, token_weight);
}

const execute_tests = async () => {
    const tests = [
        () => test_open_twice(),    
        () => test_close_closed(),  
        () => test_token_purchase(), 
        () => test_invalid_token(), 
        () => test_purchuase_non_existing_token(), 
        () => test_purchuase_after_closure(),
        () => test_many_purchasings(),
    ];
    for (let test of tests) {
        await test()
    }
}

try {
    execute_tests().catch(console.log);
} catch (ex) { 
    console.log(ex)
    throw "Tests were not passed"
}
