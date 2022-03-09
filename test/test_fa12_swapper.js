import {toFloat, toNumber, getFullStorage, getContract,
    storage_assert, get_token_amount, createTezosFromHangzhou} from "./common_functions.js"

import assert from 'assert';
import fs  from "fs";

const { address } = JSON.parse(fs.readFileSync("../deployed/fa12-latest.json").toString())

const getAccounts = async () => {
    const Tezos = await createTezosFromHangzhou('../hangzhounet.json');
    const Tezos1 = await createTezosFromHangzhou('./accounts/buyer1.json');
    const Tezos2 = await createTezosFromHangzhou('./accounts/buyer2.json');
    const Tezos3 = await createTezosFromHangzhou('./accounts/buyer3.json');
    const tokensale_address = address;
    const fa12_address = "KT1VE7N21H9X48yk1bGjikDDrSFGWDvsJVyb";

    return { Tezos, Tezos1, Tezos2, Tezos3, tokensale_address, fa12_address}
}

const getTestInput = async() => {
    const total_token_amount = 2;
    const total_base_asset_amount = 4;
    const close_date = "2022-01-01T00:01:30.000Z";
    const token_weight = 0.7;
    const token_decimals = 8;
    const asset_decimals = 6;
    return {total_token_amount, total_base_asset_amount, close_date, token_weight, token_decimals, asset_decimals}
}

const approve_transfer = async(standart_token_contract, tokensale_address, total_token_amount, token_decimals) => {
    console.log(`Approving transfer ${total_token_amount}ꜩ to ${tokensale_address}`);
    const normalized_token_amount = Math.floor(total_token_amount * (10 ** token_decimals));
    const operation = await standart_token_contract.methods.approve(tokensale_address, normalized_token_amount).send();
    await operation.confirmation();
    assert(operation.status === 'applied', 'Operation was not applied');
    console.log("Operation confirmed");
}

const open_sale = async(tokensale_contract, fa12_address, total_token_amount, total_base_asset_amount, close_date, token_weight, token_decimals, asset_decimals) => {
    console.log(`Opening tokensale for ${fa12_address} with ${total_base_asset_amount}ꜩ and ${total_token_amount} tokens of ${token_weight} weight`)
    const operation = await tokensale_contract.methods.openSale(fa12_address, toFloat(total_token_amount), toFloat(total_base_asset_amount), 
        close_date, toFloat(token_weight), toFloat(1) - toFloat(token_weight), token_decimals, asset_decimals).send();
    
    await operation.confirmation();
    assert(operation.status === 'applied', 'Operation was not applied')
    console.log("Operation confirmed");
}

const close_sale = async(tokensale_contract, fa12_address) => {
    console.log(`Closing tokensale for ${fa12_address}`)
    const operation = await tokensale_contract.methods.closeSale(fa12_address).send();
    await operation.confirmation();
    assert(operation.status === 'applied', 'Operation was not applied')
    console.log("Operation confirmed");
}

const buy_token = async(tokensale_contract, purchase_base_asset_amount, fa12_address) => {
    console.log(`Purchuasing tokens ${fa12_address} by price ${purchase_base_asset_amount}ꜩ`)
    const op = await tokensale_contract.methods.buyToken(toFloat(purchase_base_asset_amount), fa12_address)
        .send()
    await op.confirmation()
    assert(op.status === 'applied', 'Operation was not applied')
    console.log("Operation confirmed");
}

const test_open_twice = async () => {
    const {Tezos, tokensale_address, fa12_address} = await getAccounts();
    const tokensale_contract = await getContract(Tezos, tokensale_address);
    const standart_token_contract = await getContract(Tezos, fa12_address);

    const {total_token_amount, total_base_asset_amount, 
        close_date, token_weight, token_decimals, asset_decimals} = await getTestInput();
    
    await approve_transfer(standart_token_contract, tokensale_address, total_token_amount, token_decimals)
    await open_sale(tokensale_contract, fa12_address, total_token_amount, total_base_asset_amount, close_date, token_weight, token_decimals, asset_decimals);
    await approve_transfer(standart_token_contract, tokensale_address, 0, token_decimals)
    
    var storage = await getFullStorage(tokensale_contract, fa12_address);
    storage_assert(storage, true, total_token_amount, total_base_asset_amount, fa12_address, close_date, token_weight);
    let thrown = false;
    try {
        await open_sale(tokensale_contract, fa12_address, total_token_amount, total_base_asset_amount, close_date, token_weight, token_decimals, asset_decimals);
    } catch (ex) { 
        thrown = true; 
        assert(ex.message == "Tokensale is already open")
        storage = await getFullStorage(tokensale_contract, fa12_address);
        storage_assert(storage, true, total_token_amount, total_base_asset_amount, fa12_address, close_date, token_weight);
    }
    assert(thrown)

    await close_sale(tokensale_contract, fa12_address);
    storage = await getFullStorage(tokensale_contract, fa12_address);
    storage_assert(storage, false, total_token_amount, total_base_asset_amount, fa12_address, close_date, token_weight);
}

const test_close_closed = async() => {
    const {Tezos, tokensale_address, fa12_address} = await getAccounts();
    const tokensale_contract = await getContract(Tezos, tokensale_address);
    const standart_token_contract = await getContract(Tezos, fa12_address);
    
    const {total_token_amount, total_base_asset_amount, close_date, token_weight, token_decimals, asset_decimals} = await getTestInput();

    await approve_transfer(standart_token_contract, tokensale_address, total_token_amount, token_decimals)
    await open_sale(tokensale_contract, fa12_address, total_token_amount, total_base_asset_amount, close_date, token_weight, token_decimals, asset_decimals);
    await approve_transfer(standart_token_contract, tokensale_address, 0, token_decimals)

    var storage = await getFullStorage(tokensale_contract, fa12_address);
    storage_assert(storage, true, total_token_amount, total_base_asset_amount, fa12_address, close_date, token_weight);
    await close_sale(tokensale_contract, fa12_address);
    storage = await getFullStorage(tokensale_contract, fa12_address);

    let thrown = false;
    try {
        await close_sale(tokensale_contract, fa12_address);
    } catch (ex) { 
        thrown = true; 
        assert(ex.message == "Tokensale is already closed")
        storage = await getFullStorage(tokensale_contract, fa12_address);
        storage_assert(storage, false, total_token_amount, total_base_asset_amount, fa12_address, close_date, token_weight);
    }
    assert(thrown)
    storage_assert(storage, false, total_token_amount, total_base_asset_amount, fa12_address, close_date, token_weight);
}

const test_token_purchase = async() => {
    const {Tezos, tokensale_address, fa12_address} = await getAccounts();
    const tokensale_contract = await getContract(Tezos, tokensale_address);
    const standart_token_contract = await getContract(Tezos, fa12_address);
    const {close_date, token_weight, token_decimals, asset_decimals} = await getTestInput();
    
    let total_token_amount = 2000;
    let total_base_asset_amount = 40;
    let purchase_base_asset_amount = 10;

    await approve_transfer(standart_token_contract, tokensale_address, total_token_amount, token_decimals)
    await open_sale(tokensale_contract, fa12_address, total_token_amount, total_base_asset_amount, close_date, token_weight, token_decimals, asset_decimals);
    await approve_transfer(standart_token_contract, tokensale_address, 0, token_decimals)
    var storage = await getFullStorage(tokensale_contract, fa12_address);
    storage_assert(storage, true, total_token_amount, total_base_asset_amount, fa12_address, close_date, token_weight);
    const correct_delta_tokens = get_token_amount(toFloat(total_base_asset_amount), toFloat(total_token_amount), toFloat(purchase_base_asset_amount), toFloat(1) - toFloat(token_weight), toFloat(token_weight))
    console.log(toNumber(correct_delta_tokens, token_decimals));
    
    await buy_token(tokensale_contract, purchase_base_asset_amount, fa12_address)
    var storage = await getFullStorage(tokensale_contract, fa12_address);
    
    total_token_amount -= toNumber(correct_delta_tokens, token_decimals);
    total_base_asset_amount += purchase_base_asset_amount
    storage_assert(storage, true, total_token_amount, total_base_asset_amount, fa12_address, close_date, token_weight)
    
    await close_sale(tokensale_contract, fa12_address);
    storage = await getFullStorage(tokensale_contract, fa12_address);
    storage_assert(storage, false, total_token_amount, total_base_asset_amount, fa12_address, close_date, token_weight);
}

const test_invalid_token = async() => {
    const {Tezos, tokensale_address} = await getAccounts();
    const tokensale_contract = await getContract(Tezos, tokensale_address);
    const fa12_invalid = 'tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb'

    const {total_token_amount, total_base_asset_amount, close_date, token_weight, token_decimals, asset_decimals} = await getTestInput();
    
    let thrown = false;
    try {
        await open_sale(tokensale_contract, fa12_invalid, total_token_amount, total_base_asset_amount, close_date, token_weight, token_decimals, asset_decimals);
    } catch (ex) {
        thrown = true;
        assert(ex.message == "Contract for this token not found.")
    }
    assert(thrown)
}

const test_purchuase_non_existing_token = async() => {
    const {Tezos, tokensale_address} = await getAccounts();
    const tokensale_contract = await getContract(Tezos, tokensale_address);
    let fa12_address = 'KT1HE3TujvVFFUUCo7DvGRqtr9sovcJ3pwkh'
    let purchase_base_asset_amount = 10;
    let thrown = false;
    try {
        await buy_token(tokensale_contract, purchase_base_asset_amount, fa12_address)
    } catch(ex) {
        thrown = true;
        assert(ex.message == 'No such token')
    }
    assert(thrown)
}

const test_purchuase_after_closure = async() => {
    const {Tezos, tokensale_address, fa12_address} = await getAccounts();
    const tokensale_contract = await getContract(Tezos, tokensale_address);
    const standart_token_contract = await getContract(Tezos, fa12_address);
    
    let total_token_amount = 2000;
    let total_base_asset_amount = 40;
    let purchase_base_asset_amount = 10;
    const {close_date, token_weight, token_decimals, asset_decimals} = await getTestInput();

    await approve_transfer(standart_token_contract, tokensale_address, total_token_amount, token_decimals)
    await open_sale(tokensale_contract, fa12_address, total_token_amount, total_base_asset_amount, close_date, token_weight, token_decimals, asset_decimals);
    await approve_transfer(standart_token_contract, tokensale_address, 0, token_decimals)
    var storage = await getFullStorage(tokensale_contract, fa12_address);
    storage_assert(storage, true, total_token_amount, total_base_asset_amount, fa12_address, close_date, token_weight);
    
    await close_sale(tokensale_contract, fa12_address);
    storage = await getFullStorage(tokensale_contract, fa12_address);
    storage_assert(storage, false, total_token_amount, total_base_asset_amount, fa12_address, close_date, token_weight);
    let thrown = false
    try {
        await buy_token(tokensale_contract, purchase_base_asset_amount, fa12_address)
    } catch(ex) {
        thrown = true
        assert(ex.message == 'Tokensale is closed')
        storage = await getFullStorage(tokensale_contract, fa12_address);
        storage_assert(storage, false, total_token_amount, total_base_asset_amount, fa12_address, close_date, token_weight)
    }
    assert(thrown)
}

const test_many_purchasings = async() => {
    const {Tezos, Tezos1, tokensale_address, fa12_address} = await getAccounts();
    const tokensale = await getContract(Tezos, tokensale_address);
    const tokensale1 = await getContract(Tezos1, tokensale_address);
    const standart_token_contract = await getContract(Tezos, fa12_address);
    
    let total_token_amount = 2000;
    let total_base_asset_amount = 40;
    let purchase_base_asset = [10, 14, 87, 7];
    const {close_date, token_weight, token_decimals, asset_decimals} = await getTestInput();
    
    await approve_transfer(standart_token_contract, tokensale_address, total_token_amount, token_decimals)
    await open_sale(tokensale, fa12_address, total_token_amount, total_base_asset_amount, close_date, token_weight, token_decimals, asset_decimals);
    await approve_transfer(standart_token_contract, tokensale_address, 0, token_decimals)
    var storage = await getFullStorage(tokensale, fa12_address);
    storage_assert(storage, true, total_token_amount, total_base_asset_amount, fa12_address, close_date, token_weight);
    
    for (let i = 0; i < 4; ++i) {
        let purchase_base_asset_amount = purchase_base_asset[i]
        const correct_delta_tokens = get_token_amount(toFloat(total_base_asset_amount), toFloat(total_token_amount), toFloat(purchase_base_asset_amount), toFloat(1) - toFloat(token_weight), toFloat(token_weight))
        console.log(toNumber(correct_delta_tokens, token_decimals))
        
        await buy_token(tokensale1, purchase_base_asset_amount, fa12_address)
        var storage = await getFullStorage(tokensale1, fa12_address);
        total_token_amount -= toNumber(correct_delta_tokens, token_decimals)
        total_base_asset_amount += purchase_base_asset_amount
        storage_assert(storage, true, total_token_amount, total_base_asset_amount, fa12_address, close_date, token_weight)
    }

    await close_sale(tokensale, fa12_address);
    storage = await getFullStorage(tokensale, fa12_address);
    storage_assert(storage, false, total_token_amount, total_base_asset_amount, fa12_address, close_date, token_weight);
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
