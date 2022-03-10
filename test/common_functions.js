import { TezosToolkit }  from '@taquito/taquito'
import { InMemorySigner } from '@taquito/signer'

import assert from 'assert';
import fs  from "fs";

const RPC = 'https://rpc.tzkt.io/hangzhou2net/'
const C_PRECISION = 10000000000;
const eps = 5;

function  equal(a, b) {
    return Math.abs(a - b) / C_PRECISION < 10 ** (-eps);
}

function  toFloat(value) {
    return Math.floor(value * C_PRECISION);
}

function  toNumber(value, decimals) {
    let num = Math.floor((10 ** decimals) * value / C_PRECISION);
    return num / (10 ** decimals);
}

function mul(a, b) {
    return Math.floor(a * b / C_PRECISION);
}

function div(a, b) {
    return Math.floor((a * C_PRECISION) / b);
}

function powFloatIntoNat(a , power) {
    if (power == 0) {
        return C_PRECISION;
    }
    let root = powFloatIntoNat(a, Math.floor(power / 2));
    let result = mul(root, root);
    if (power % 2 == 1) {
        result = mul(a, result);
    }
    return result;
}

function approxPowFloat(base, alpha, steps = 2000) {
    let term = 1 * C_PRECISION;
    let res = 0;
    for (let n = 1; n <= steps; ++n) {
        res += term;
        let m = mul(alpha - (n - 1) * C_PRECISION, base - 1 * C_PRECISION);
        m = div(m, n * C_PRECISION);
        term = mul(term, m);
    }
    return res;
}

function powFloats(a, power){
    const mul1 = powFloatIntoNat(a, power / C_PRECISION);
    const mul2 = approxPowFloat(a, power % C_PRECISION);
    const res = mul(mul1, mul2);
    return res;
}

function getTokenAmount(reserveTokenI, reserveTokenO, deltaTokenI, weightI, weightO) {
    const fraction = div(reserveTokenI, (reserveTokenI + deltaTokenI));
    const power = div(weightI, weightO);
    const fractionRoot = powFloats(fraction, power);
    const subRes = 1 * C_PRECISION - fractionRoot;
    const deltaTokenO = mul(reserveTokenO, subRes);
    return deltaTokenO;
}

const getFullStorage = async (contract, tokenAddress) => {
    const storage = await contract.storage();
    return {
        admin : storage.admin,
        token_list : await storage.token_list.get(tokenAddress)
    };
}

function storageAssert(storage, admin, tokensaleStatus, totalTokenAmount, totalBaseAssetAmount, fa12Address, closeDate, tokenWeight){
    assert(storage.admin == admin, `admin: ${storage.admin}; expected: ${admin}`);
    let token_list = storage.token_list;
    assert(token_list.sale == tokensaleStatus, `tokensale status: ${token_list.token_sale_is_open}; expected: ${tokensaleStatus}`)
    assert(equal(token_list.token_amount, toFloat(totalTokenAmount)), `total_token_amount: ${token_list.total_token_amount}; expected: ${toFloat(totalTokenAmount)}`)
    assert(equal(token_list.based_asset_amount, toFloat(totalBaseAssetAmount)), `total_based_asset_amount: ${token_list.based_asset_amount}; expected: ${toFloat(totalBaseAssetAmount)}`)
    assert(token_list.token_address == fa12Address, `token address: ${token_list.address}; expected: ${fa12Address}`)
    assert(token_list.close_date == closeDate, `close_date: ${token_list.closeDate}; expected: ${closeDate}`)
    assert(token_list.weights.token_weight['c'][0] == toFloat(tokenWeight), `token_weight: ${token_list.weights.token_weight['c'][0]}; expected: ${tokenWeight}`)
    assert(token_list.weights.based_asset_weight['c'][0] == toFloat(1) - toFloat(tokenWeight), `based_asset_weight: ${token_list.weights.based_asset_weight['c'][0]}; expected: ${toFloat(1) - toFloat(tokenWeight)}`)
}

const createTezosFromHangzhou = async (path) => {
    const Tezos = new TezosToolkit(RPC);
    const acc = JSON.parse(fs.readFileSync(path))
    await Tezos.setSignerProvider(InMemorySigner.fromFundraiser(acc.email, acc.password, acc.mnemonic.join(' ')));
    return Tezos;
}

const getContract = async(Tezos, contractAddress) => {
    const contract = await Tezos.contract.at(contractAddress);
    return contract
}

export {equal, toFloat, toNumber, storageAssert, getFullStorage, 
    getTokenAmount, createTezosFromHangzhou, getContract}