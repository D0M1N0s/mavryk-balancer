
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
    const Tezos2 = await createTezosFromHangzhou('../hangzhounet2.json');
    const tokensale_address = 'KT1PqZsey9vN7C6HwLjDuGnZcqdRCvqvZS7e';
    const fa12_address = 'KT1D2xH31FDDC5wcjugcMsgd9Mfp4LjvwLCs';
    // const tokensale_contract = await Tezos.contract.at(tokensale_address);
    // const standart_token_contract = await Tezos.contract.at(fa12_address);
    
    return { Tezos, Tezos2, tokensale_address, fa12_address}
}

const get_full_storage = async (contract, token_address) => {
    const storage = await contract.storage();
    return storage.get(token_address)
}

const approve_transfer = async(standart_token_contract, tokensale_address, total_token_amount) => {
    console.log(`Approving transfer ${total_token_amount}ꜩ to ${tokensale_address}`)
    const operation = await standart_token_contract.methods.approve(tokensale_address, total_token_amount).send()
    await operation.confirmation()
    assert(operation.status === 'applied', 'Operation was not applied')
    console.log("Operation confirmed");
}

const open_sale = async(tokensale_contract, fa12_address, total_token_amount, total_tezos_amount, close_date, token_weight) => {
    console.log(`Opening tokensale for ${fa12_address} with ${total_tezos_amount}ꜩ and ${total_token_amount} tokens of ${token_weight} weight`)
    const operation = await tokensale_contract.methods.openSale(fa12_address, to_float(total_token_amount), to_float(total_tezos_amount), 
        close_date, to_float(token_weight), to_float(1) - to_float(token_weight)).send();
    
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

const buy_token = async(tokensale_contract, purchase_tezos_amount, fa12_address) => {
    console.log(`Purchuasing tokens ${fa12_address} by price ${purchase_tezos_amount}ꜩ`)
    const op = await tokensale_contract.methods.buyToken(to_float(purchase_tezos_amount), fa12_address).send()
    await op.confirmation()
    assert(op.status === 'applied', 'Operation was not applied')
    console.log("Operation confirmed");
}

function storage_assert(initialStorage, tokensale_status, total_token_amount, total_tezos_amount, fa12_address, close_date, token_weight){
    assert(initialStorage.token_sale_is_open == tokensale_status, `tokensale status: ${initialStorage.token_sale_is_open}; expected: ${tokensale_status}`)
    assert(initialStorage.total_token_amount == to_float(total_token_amount), `total_token_amount: ${initialStorage.total_token_amount}; expected: ${to_float(total_token_amount)}`)
    assert(initialStorage.total_tezos_amount == to_float(total_tezos_amount), `total_token_amount: ${initialStorage.total_tezos_amount}; expected: ${to_float(total_tezos_amount)}`)
    assert(initialStorage.address == fa12_address, `token address: ${initialStorage.address}; expected: ${fa12_address}`)
    // assert(initialStorage.close_date == close_date)
    assert(initialStorage.weights.token_weight['c'][0] == to_float(token_weight))
    assert(initialStorage.weights.tezos_weight['c'][0] == to_float(1) - to_float(token_weight))

}

const test_open_twice = async () => {
    const {Tezos, tokensale_address, fa12_address} = await getAccounts();
    const tokensale_contract = await getContract(Tezos, tokensale_address);
    const standart_token_contract = await getContract(Tezos, fa12_address);

    const total_token_amount = 2;
    const total_tezos_amount = 4;
    const close_date = "2022-01-01T00:01:30Z";
    const token_weight = 0.7;

    await approve_transfer(standart_token_contract, tokensale_address, 0)
    await approve_transfer(standart_token_contract, tokensale_address, total_token_amount)
    await open_sale(tokensale_contract, fa12_address, total_token_amount, total_tezos_amount, close_date, token_weight);
    await approve_transfer(standart_token_contract, tokensale_address, 0)
    
    var storage = await get_full_storage(tokensale_contract, fa12_address);
    storage_assert(storage, true, total_token_amount, total_tezos_amount, fa12_address, close_date, token_weight);
    let thrown = false;
    try {
        await open_sale(tokensale_contract, fa12_address, total_token_amount, total_tezos_amount, close_date, token_weight);
    } catch (ex) { 
        thrown = true; 
        assert(ex.message == "Tokensale is already open")
        storage = await get_full_storage(tokensale_contract, fa12_address);
        storage_assert(storage, true, total_token_amount, total_tezos_amount, fa12_address, close_date, token_weight);
    }
    assert(thrown)

    await close_sale(tokensale_contract, fa12_address);
    storage = await get_full_storage(tokensale_contract, fa12_address);
    storage_assert(storage, false, total_token_amount, total_tezos_amount, fa12_address, close_date, token_weight);
    
}

const test_close_closed = async() => {
    const {Tezos, tokensale_address, fa12_address} = await getAccounts();
    const tokensale_contract = await getContract(Tezos, tokensale_address);
    const standart_token_contract = await getContract(Tezos, fa12_address);
    
    const total_token_amount = 2;
    const total_tezos_amount = 4;
    const close_date = "2022-01-01T00:01:30Z";
    const token_weight = 0.7;

    await approve_transfer(standart_token_contract, tokensale_address, 0)
    await approve_transfer(standart_token_contract, tokensale_address, total_token_amount)
    await open_sale(tokensale_contract, fa12_address, total_token_amount, total_tezos_amount, close_date, token_weight);
    await approve_transfer(standart_token_contract, tokensale_address, 0)

    var storage = await get_full_storage(tokensale_contract, fa12_address);
    storage_assert(storage, true, total_token_amount, total_tezos_amount, fa12_address, close_date, token_weight);
    await close_sale(tokensale_contract, fa12_address);
    storage = await get_full_storage(tokensale_contract, fa12_address);

    let thrown = false;
    try {
        await close_sale(tokensale_contract, fa12_address);
    } catch (ex) { 
        thrown = true; 
        assert(ex.message == "Tokensale is already closed")
        storage = await get_full_storage(tokensale_contract, fa12_address);
        storage_assert(storage, false, total_token_amount, total_tezos_amount, fa12_address, close_date, token_weight);
    }
    assert(thrown)
    storage_assert(storage, false, total_token_amount, total_tezos_amount, fa12_address, close_date, token_weight);
}

function mul(a, b) {
    return Math.floor(a * b / c_PRECISION)
}

function div(a, b) {
    return Math.floor((a * c_PRECISION) / b)
}

function pow_float_into_nat(a , power) {
    if (power == 0) {
        return c_PRECISION;
    }
    let root = pow_float_into_nat(a, Math.floor(power / 2));
    let result = mul(root, root);
    if (power % 2 == 1) {
        result = mul(a, result)
    }
    return result
}

function approx_pow_float(base, alpha, steps = 2000) {
    let term = 1 * c_PRECISION
    let res = 0
    for (let n = 1; n <= steps; ++n) {
        res += term
        let m = mul(alpha - (n - 1) * c_PRECISION, base - 1 * c_PRECISION)
        m = div(m, n * c_PRECISION)
        term = mul(term, m)
    }
    return res
}

function pow_floats(a, power){
    const mul1 = pow_float_into_nat(a, power / c_PRECISION)
    const mul2 = approx_pow_float(a, power % c_PRECISION)
    const res = mul(mul1, mul2)
    return res
}

function get_token_amount(reserve_token_i, reserve_token_o, delta_token_i, weight_i, weight_o) {
    const fraction = div(reserve_token_i, (reserve_token_i + delta_token_i))
    const power = div(weight_i, weight_o)
    const fraction_root = pow_floats(fraction, power)
    const sub_res = 1 * c_PRECISION - fraction_root
    const delta_token_o = mul(reserve_token_o, sub_res)
    return delta_token_o
}

const test_token_purchase = async() => {
    const {Tezos, Tezos2, tokensale_address, fa12_address} = await getAccounts();
    const tokensale_contract = await getContract(Tezos, tokensale_address);
    const standart_token_contract = await getContract(Tezos, fa12_address);
    
    let total_token_amount = 2000;
    let total_tezos_amount = 40;
    let close_date = "2022-01-01T00:01:30Z";
    let token_weight = 0.7;
    let purchase_tezos_amount = 10;

    await approve_transfer(standart_token_contract, tokensale_address, 0)
    await approve_transfer(standart_token_contract, tokensale_address, total_token_amount)
    await open_sale(tokensale_contract, fa12_address, total_token_amount, total_tezos_amount, close_date, token_weight);
    await approve_transfer(standart_token_contract, tokensale_address, 0)
    var storage = await get_full_storage(tokensale_contract, fa12_address);
    storage_assert(storage, true, total_token_amount, total_tezos_amount, fa12_address, close_date, token_weight);
    
    await buy_token(tokensale_contract, purchase_tezos_amount, fa12_address)
    var storage = await get_full_storage(tokensale_contract, fa12_address);
    const correct_delta_tokens = get_token_amount(to_float(total_tezos_amount), to_float(total_token_amount), to_float(purchase_tezos_amount), to_float(1) - to_float(token_weight), to_float(token_weight))
    
    total_token_amount -= to_number(correct_delta_tokens)
    total_tezos_amount += purchase_tezos_amount
    storage_assert(storage, true, total_token_amount, total_tezos_amount, fa12_address, close_date, token_weight)
    
    await close_sale(tokensale_contract, fa12_address);
    storage = await get_full_storage(tokensale_contract, fa12_address);
    storage_assert(storage, false, total_token_amount, total_tezos_amount, fa12_address, close_date, token_weight);
}

const test_invalid_token = async() => {
    const {Tezos, tokensale_address} = await getAccounts();
    const tokensale_contract = await getContract(Tezos, tokensale_address);
    const fa12_invalid = 'tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb'

    const total_token_amount = 2;
    const total_tezos_amount = 4;
    const close_date = "2022-01-01T00:01:30Z";
    const token_weight = 0.7;
    
    let thrown = false;
    try {
        await open_sale(tokensale_contract, fa12_invalid, total_token_amount, total_tezos_amount, close_date, token_weight);
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
    let purchase_tezos_amount = 10;
    thrown = false;
    try {
        await buy_token(tokensale_contract, purchase_tezos_amount, fa12_address)
    } catch(ex) {
        thrown = true;
        assert(ex.message == 'No such token')
    }
    assert(thrown)
}

const test_purchuase_after_closure = async() => {
    const {Tezos, Tezos2, tokensale_address, fa12_address} = await getAccounts();
    const tokensale_contract = await getContract(Tezos, tokensale_address);
    const standart_token_contract = await getContract(Tezos, fa12_address);
    
    let total_token_amount = 2000;
    let total_tezos_amount = 40;
    let close_date = "2022-01-01T00:01:30Z";
    let token_weight = 0.7;
    let purchase_tezos_amount = 10;

    await approve_transfer(standart_token_contract, tokensale_address, 0)
    await approve_transfer(standart_token_contract, tokensale_address, total_token_amount)
    await open_sale(tokensale_contract, fa12_address, total_token_amount, total_tezos_amount, close_date, token_weight);
    await approve_transfer(standart_token_contract, tokensale_address, 0)
    var storage = await get_full_storage(tokensale_contract, fa12_address);
    storage_assert(storage, true, total_token_amount, total_tezos_amount, fa12_address, close_date, token_weight);
    
    await close_sale(tokensale_contract, fa12_address);
    storage = await get_full_storage(tokensale_contract, fa12_address);
    storage_assert(storage, false, total_token_amount, total_tezos_amount, fa12_address, close_date, token_weight);
    thrown = false
    try {
        await buy_token(tokensale_contract, purchase_tezos_amount, fa12_address)
    } catch(ex) {
        thrown = true
        assert(ex.message == 'Tokensale is closed')
        storage = await get_full_storage(tokensale_contract, fa12_address);
        storage_assert(storage, false, total_token_amount, total_tezos_amount, fa12_address, close_date, token_weight)
    }
    assert(thrown)
}

const execute_tests = async () => {
    const tests = [
         () => test_open_twice(),
         () => test_close_closed(),
         () => test_token_purchase(),
         () => test_invalid_token(),
         () => test_purchuase_non_existing_token(),
         () => test_purchuase_after_closure(),
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
