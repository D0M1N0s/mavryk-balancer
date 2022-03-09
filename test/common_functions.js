import { TezosToolkit }  from '@taquito/taquito'
import { InMemorySigner } from '@taquito/signer'

import assert from 'assert';
import fs  from "fs";

const RPC = 'https://rpc.tzkt.io/hangzhou2net/'
const c_PRECISION = 10000000000;
const eps = 5;

function  equal(a, b) {
    return Math.abs(a - b) / c_PRECISION < 10 ** (-eps);
}

function  toFloat(value) {
    return Math.floor(value * c_PRECISION);
}

function  toNumber(value, decimals) {
    let num = Math.floor((10 ** decimals) * value / c_PRECISION);
    return num / (10 ** decimals);
}

function mul(a, b) {
    return Math.floor(a * b / c_PRECISION);
}

function div(a, b) {
    return Math.floor((a * c_PRECISION) / b);
}

function powFloatIntoNat(a , power) {
    if (power == 0) {
        return c_PRECISION;
    }
    let root = powFloatIntoNat(a, Math.floor(power / 2));
    let result = mul(root, root);
    if (power % 2 == 1) {
        result = mul(a, result);
    }
    return result;
}

function approxPowFloat(base, alpha, steps = 2000) {
    let term = 1 * c_PRECISION;
    let res = 0;
    for (let n = 1; n <= steps; ++n) {
        res += term;
        let m = mul(alpha - (n - 1) * c_PRECISION, base - 1 * c_PRECISION);
        m = div(m, n * c_PRECISION);
        term = mul(term, m);
    }
    return res;
}

function powFloats(a, power){
    const mul1 = powFloatIntoNat(a, power / c_PRECISION);
    const mul2 = approxPowFloat(a, power % c_PRECISION);
    const res = mul(mul1, mul2);
    return res;
}

function get_token_amount(reserve_token_i, reserve_token_o, delta_token_i, weight_i, weight_o) {
    const fraction = div(reserve_token_i, (reserve_token_i + delta_token_i));
    const power = div(weight_i, weight_o);
    const fraction_root = powFloats(fraction, power);
    const sub_res = 1 * c_PRECISION - fraction_root;
    const delta_token_o = mul(reserve_token_o, sub_res);
    return delta_token_o;
}

const getFullStorage = async (contract, token_address) => {
    const storage = await contract.storage();
    return storage.get(token_address);
}

function storage_assert(storage, tokensale_status, total_token_amount, total_base_asset_amount, fa12_address, close_date, token_weight){
    assert(storage.token_sale_is_open == tokensale_status, `tokensale status: ${storage.token_sale_is_open}; expected: ${tokensale_status}`)
    assert(equal(storage.total_token_amount, toFloat(total_token_amount)), `total_token_amount: ${storage.total_token_amount}; expected: ${toFloat(total_token_amount)}`)
    assert(equal(storage.total_based_asset_amount, toFloat(total_base_asset_amount)), `total_based_asset_amount: ${storage.total_base_asset_amount}; expected: ${toFloat(total_base_asset_amount)}`)
    assert(storage.address == fa12_address, `token address: ${storage.address}; expected: ${fa12_address}`)
    assert(storage.close_date == close_date, `close_date: ${storage.close_date}; expected: ${close_date}`)
    assert(storage.weights.token_weight['c'][0] == toFloat(token_weight), `token_weight: ${storage.weights.token_weight['c'][0]}; expected: ${token_weight}`)
    assert(storage.weights.base_asset_weight['c'][0] == toFloat(1) - toFloat(token_weight), `base_asset_weight: ${storage.weights.base_asset_weight['c'][0]}; expected: ${toFloat(1) - toFloat(token_weight)}`)
}
const createTezosFromHangzhou = async (path) => {
    const Tezos = new TezosToolkit(RPC);
    const acc = JSON.parse(fs.readFileSync(path))
    await Tezos.setSignerProvider(InMemorySigner.fromFundraiser(acc.email, acc.password, acc.mnemonic.join(' ')));
    return Tezos;
}

const getContract = async(Tezos, contract_address) => {
    const contract = await Tezos.contract.at(contract_address);
    return contract
}

export {equal, toFloat, toNumber, storage_assert, getFullStorage, 
    get_token_amount, createTezosFromHangzhou, getContract}