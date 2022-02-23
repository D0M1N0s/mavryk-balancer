
const { TezosToolkit } = require('@taquito/taquito')
const { InMemorySigner } = require('@taquito/signer')

var assert = require('assert');
const fs = require("fs");
const RPC = 'https://rpc.tzkt.io/hangzhou2net/'

const c_PRECISION = 10000000000;
function  to_float(value) {
    return Math.floor(value * c_PRECISION);
}
function  to_number(value) {
    return Math.floor(value / c_PRECISION);
}

const createTezosFromHangzhou = async (path) => {
    const Tezos = new TezosToolkit(RPC);
    const acc = require(path)
    await Tezos.setSignerProvider(InMemorySigner.fromFundraiser(acc.email, acc.password, acc.mnemonic.join(' ')));
    return Tezos;
}

const getContract = async(Tezos, contract_address) => {
    const contract = await Tezos.contract.at(contract_address);
    return contract
}

const getAccounts = async () => {
    const Tezos = await createTezosFromHangzhou('../hangzhounet.json');
    const acc = require('../hangzhounet.json')
    const issuer_address = acc.pkh
    const Tezos1 = await createTezosFromHangzhou('./accounts/buyer1.json');
    const Tezos2 = await createTezosFromHangzhou('./accounts/buyer2.json');
    const Tezos3 = await createTezosFromHangzhou('./accounts/buyer3.json');
    const tokensale_address = 'KT1NUSCmNvusUYUcm2qKMhXsZWGkfLHSSmPm';
    const fa2_address = 'KT1KH8end6E7LN4RSLJQxUJoa1H9uKC78NkK';

    return { Tezos, Tezos1, Tezos2, Tezos3, issuer_address, tokensale_address, fa2_address}
}

const get_full_storage = async (contract, token_address) => {
    const storage = await contract.storage();
    return storage.get(token_address)
}

const add_operator = async(standart_token_contract, owner_address, tokensale_address, token_id) => {
    console.log(`Adding operator for tokensale ${tokensale_address}`)
    const operation = await standart_token_contract.methods.update_operators([
        {
          add_operator: {
            owner: owner_address,
            operator: tokensale_address,
            token_id: token_id
          }
        }
      ]).send();
    await operation.confirmation()
    console.log("Operation confirmed")
}

const remove_operator = async(standart_token_contract, owner_address, tokensale_address, token_id) => {
    console.log(`Removing operator for tokensale ${tokensale_address}`)
    const operation = await standart_token_contract.methods.update_operators([
        {
          remove_operator: {
            owner: owner_address,
            operator: tokensale_address,
            token_id: token_id
          }
        }
      ]).send();
    await operation.confirmation()
    console.log("Operation confirmed")
}

const open_sale = async(tokensale_contract, fa2_address, total_token_amount, total_tezos_amount, close_date, token_weight) => {
    console.log(`Opening tokensale for ${fa2_address} with ${total_tezos_amount}ꜩ and ${total_token_amount} tokens of ${token_weight} weight`)
    const operation = await tokensale_contract.methods.openSale(fa2_address, to_float(total_token_amount), to_float(total_tezos_amount), 
        close_date, to_float(token_weight), to_float(1) - to_float(token_weight)).send();
    
    await operation.confirmation();
    assert(operation.status === 'applied', 'Operation was not applied')
    console.log("Operation confirmed");
}

const close_sale = async(tokensale_contract, fa2_address) => {
    console.log(`Closing tokensale for ${fa2_address}`)
    const operation = await tokensale_contract.methods.closeSale(fa2_address).send();
    await operation.confirmation();
    assert(operation.status === 'applied', 'Operation was not applied')
    console.log("Operation confirmed");
}

const buy_token = async(tokensale_contract, purchase_tezos_amount, fa2_address) => {
    console.log(`Purchuasing tokens ${fa2_address} by price ${purchase_tezos_amount}ꜩ`)
    const op = await tokensale_contract.methods.buyToken(to_float(purchase_tezos_amount), fa2_address).send()
    await op.confirmation()
    assert(op.status === 'applied', 'Operation was not applied')
    console.log("Operation confirmed");
}

function storage_assert(storage, tokensale_status, total_token_amount, total_tezos_amount, fa2_address, close_date, token_weight){
    assert(storage.token_sale_is_open == tokensale_status, `tokensale status: ${storage.token_sale_is_open}; expected: ${tokensale_status}`)
    assert(storage.total_token_amount == to_float(total_token_amount), `total_token_amount: ${storage.total_token_amount}; expected: ${to_float(total_token_amount)}`)
    assert(storage.total_tezos_amount == to_float(total_tezos_amount), `total_token_amount: ${storage.total_tezos_amount}; expected: ${to_float(total_tezos_amount)}`)
    assert(storage.address == fa2_address, `token address: ${storage.address}; expected: ${fa2_address}`)
    assert(storage.close_date == close_date, `close_date: ${storage.close_date}; expected: ${close_date}`)
    assert(storage.weights.token_weight['c'][0] == to_float(token_weight), `token_weight: ${storage.weights.token_weight['c'][0]}; expected: ${token_weight}`)
    assert(storage.weights.tezos_weight['c'][0] == to_float(1) - to_float(token_weight), `tezos_weight: ${storage.weights.tezos_weight['c'][0]}; expected: ${to_float(1) - to_float(token_weight)}`)
}

const test_open_twice = async () => {
    const {Tezos, tokensale_address, fa2_address, issuer_address} = await getAccounts();
    const tokensale_contract = await getContract(Tezos, tokensale_address);
    const standart_token_contract = await getContract(Tezos, fa2_address);

    const token_id = 0;
    const total_token_amount = 2;
    const total_tezos_amount = 4;
    const close_date = "2022-01-01T00:01:30.000Z";
    const token_weight = 0.7;
    
    await add_operator(standart_token_contract, issuer_address, tokensale_address, token_id)
    await open_sale(tokensale_contract, fa2_address, total_token_amount, total_tezos_amount, close_date, token_weight);
    await remove_operator(standart_token_contract, issuer_address, tokensale_address, token_id)
    
    var storage = await get_full_storage(tokensale_contract, fa2_address);
    storage_assert(storage, true, total_token_amount, total_tezos_amount, fa2_address, close_date, token_weight);
    let thrown = false;
    try {
        await open_sale(tokensale_contract, fa2_address, total_token_amount, total_tezos_amount, close_date, token_weight);
    } catch (ex) { 
        thrown = true; 
        assert(ex.message == "Tokensale is already open")
        storage = await get_full_storage(tokensale_contract, fa2_address);
        storage_assert(storage, true, total_token_amount, total_tezos_amount, fa2_address, close_date, token_weight);
    }
    assert(thrown)

    await close_sale(tokensale_contract, fa2_address);
    storage = await get_full_storage(tokensale_contract, fa2_address);
    storage_assert(storage, false, total_token_amount, total_tezos_amount, fa2_address, close_date, token_weight);
}

const test_close_closed = async() => {
    const {Tezos, tokensale_address, fa2_address, issuer_address} = await getAccounts();
    const tokensale_contract = await getContract(Tezos, tokensale_address);
    const standart_token_contract = await getContract(Tezos, fa2_address);

    const token_id = 0;
    const total_token_amount = 2;
    const total_tezos_amount = 4;
    const close_date = "2022-01-01T00:01:30.000Z";
    const token_weight = 0.7;
    
    await add_operator(standart_token_contract, issuer_address, tokensale_address, token_id)
    await open_sale(tokensale_contract, fa2_address, total_token_amount, total_tezos_amount, close_date, token_weight);
    await remove_operator(standart_token_contract, issuer_address, tokensale_address, token_id)
    
    var storage = await get_full_storage(tokensale_contract, fa2_address);
    storage_assert(storage, true, total_token_amount, total_tezos_amount, fa2_address, close_date, token_weight);
    await close_sale(tokensale_contract, fa2_address);
    storage = await get_full_storage(tokensale_contract, fa2_address);

    let thrown = false;
    try {
        await close_sale(tokensale_contract, fa2_address);
    } catch (ex) { 
        thrown = true; 
        assert(ex.message == "Tokensale is already closed")
        storage = await get_full_storage(tokensale_contract, fa2_address);
        storage_assert(storage, false, total_token_amount, total_tezos_amount, fa2_address, close_date, token_weight);
    }
    assert(thrown)
    storage_assert(storage, false, total_token_amount, total_tezos_amount, fa2_address, close_date, token_weight);
}

function get_token_amount(reserve_token_i, reserve_token_o, delta_token_i, weight_i, weight_o) {
    const delta_token_o = reserve_token_o * (1 - (reserve_token_i / (reserve_token_i + delta_token_i)) ** (weight_i / weight_o))
    return Math.floor(delta_token_o)
}

const test_invalid_token = async() => {
    const {Tezos, tokensale_address} = await getAccounts();
    const tokensale_contract = await getContract(Tezos, tokensale_address);
    const fa2_invalid = 'tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb'

    const total_token_amount = 2;
    const total_tezos_amount = 4;
    const close_date = "2022-01-01T00:01:30.000Z";
    const token_weight = 0.7;
    
    let thrown = false;
    try {
        await open_sale(tokensale_contract, fa2_invalid, total_token_amount, total_tezos_amount, close_date, token_weight);
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
    const token_id = 0;

    let total_token_amount = 2000;
    let total_tezos_amount = 40;
    let close_date = "2022-01-01T00:01:30.000Z";
    let token_weight = 0.7;
    let purchase_tezos_amount = 10;

    await add_operator(standart_token_contract, issuer_address, tokensale_address, token_id)
    await open_sale(tokensale_contract, fa2_address, total_token_amount, total_tezos_amount, close_date, token_weight);
    await remove_operator(standart_token_contract, issuer_address, tokensale_address, token_id)
    var storage = await get_full_storage(tokensale_contract, fa2_address);
    storage_assert(storage, true, total_token_amount, total_tezos_amount, fa2_address, close_date, token_weight);
    
    await buy_token(tokensale_contract, purchase_tezos_amount, fa2_address)
    var storage = await get_full_storage(tokensale_contract, fa2_address);
    const correct_delta_tokens = get_token_amount(to_float(total_tezos_amount), to_float(total_token_amount), to_float(purchase_tezos_amount), to_float(1) - to_float(token_weight), to_float(token_weight))
    
    total_token_amount -= to_number(correct_delta_tokens)
    total_tezos_amount += purchase_tezos_amount
    storage_assert(storage, true, total_token_amount, total_tezos_amount, fa2_address, close_date, token_weight)
    
    await close_sale(tokensale_contract, fa2_address);
    storage = await get_full_storage(tokensale_contract, fa2_address);
    storage_assert(storage, false, total_token_amount, total_tezos_amount, fa2_address, close_date, token_weight);
}

const test_purchuase_non_existing_token = async() => {
    const {Tezos, tokensale_address} = await getAccounts();
    const tokensale_contract = await getContract(Tezos, tokensale_address);
    let fa2_address = 'KT1PiqMJSEsZkFruWMKMpoAmRVumKk9LavX3'
    let purchase_tezos_amount = 10;
    thrown = false;
    try {
        await buy_token(tokensale_contract, purchase_tezos_amount, fa2_address)
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
    const token_id = 0;

    let total_token_amount = 2000;
    let total_tezos_amount = 40;
    let close_date = "2022-01-01T00:01:30.000Z";
    let token_weight = 0.7;
    let purchase_tezos_amount = 10;

    await add_operator(standart_token_contract, issuer_address, tokensale_address, token_id)
    await open_sale(tokensale_contract, fa2_address, total_token_amount, total_tezos_amount, close_date, token_weight);
    await remove_operator(standart_token_contract, issuer_address, tokensale_address, token_id)
    
    var storage = await get_full_storage(tokensale_contract, fa2_address);
    storage_assert(storage, true, total_token_amount, total_tezos_amount, fa2_address, close_date, token_weight);
    
    await close_sale(tokensale_contract, fa2_address);
    storage = await get_full_storage(tokensale_contract, fa2_address);
    storage_assert(storage, false, total_token_amount, total_tezos_amount, fa2_address, close_date, token_weight);
    thrown = false
    try {
        await buy_token(tokensale_contract, purchase_tezos_amount, fa2_address)
    } catch(ex) {
        thrown = true
        assert(ex.message == 'Tokensale is closed')
        storage = await get_full_storage(tokensale_contract, fa2_address);
        storage_assert(storage, false, total_token_amount, total_tezos_amount, fa2_address, close_date, token_weight)
    }
    assert(thrown)
}
const test_many_purchasings = async() => {
    const {Tezos, Tezos1, tokensale_address, fa2_address, issuer_address} = await getAccounts();
    const tokensale = await getContract(Tezos, tokensale_address);
    const tokensale1 = await getContract(Tezos1, tokensale_address);
    const standart_token_contract = await getContract(Tezos, fa2_address);
    const token_id = 0;

    let total_token_amount = 2000;
    let total_tezos_amount = 40;
    let close_date = "2022-01-01T00:01:30.000Z";
    let token_weight = 0.7;
    let purchase_tezos = [10, 14, 87, 7]

    await add_operator(standart_token_contract, issuer_address, tokensale_address, token_id)
    await open_sale(tokensale, fa2_address, total_token_amount, total_tezos_amount, close_date, token_weight);
    await remove_operator(standart_token_contract, issuer_address, tokensale_address, token_id)
    var storage = await get_full_storage(tokensale, fa2_address);
    storage_assert(storage, true, total_token_amount, total_tezos_amount, fa2_address, close_date, token_weight);
    
    for (let i = 0; i < 4; ++i) {
        let purchase_tezos_amount = purchase_tezos[i]
        await buy_token(tokensale1, purchase_tezos_amount, fa2_address)
        var storage = await get_full_storage(tokensale1, fa2_address);
        const correct_delta_tokens = get_token_amount(to_float(total_tezos_amount), to_float(total_token_amount), to_float(purchase_tezos_amount), to_float(1) - to_float(token_weight), to_float(token_weight))
        total_token_amount -= to_number(correct_delta_tokens)
        total_tezos_amount += purchase_tezos_amount
        storage_assert(storage, true, total_token_amount, total_tezos_amount, fa2_address, close_date, token_weight)
    }

    await close_sale(tokensale, fa2_address);
    storage = await get_full_storage(tokensale, fa2_address);
    storage_assert(storage, false, total_token_amount, total_tezos_amount, fa2_address, close_date, token_weight);
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
