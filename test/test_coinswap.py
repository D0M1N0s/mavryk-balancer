import pytest, random
from random import randint
from pytezos import pytezos, ContractInterface, MichelsonRuntimeError

TARGET = './build/amm.tz'
PRECISION = 10 ** 10

def form_dummy_storage():
    return {
        "trader" : {
            "user_wallet" : {},
            "user_address" : 12,
        },
        "input_token" : "",
        "output_token" : "",
        "inp_token_amount" : 0,
        "reserve" : {
            "TEZ" : 1000 * PRECISION,
            "ETH" : 1000 * PRECISION,
        },
        "weight" : {
            "TEZ" : int(0.5 * PRECISION),
            "ETH" : int(0.5 * PRECISION),
        },
        "swaps" : {},
        "swps_size" : 0,
    }

def test_not_enough_funds():
    contract = ContractInterface.from_file(TARGET)
    obj = contract.swapTokens(None)
    store = form_dummy_storage()
    store["inp_token_amount"] = 10 * PRECISION
    store["input_token"] = "ETH"
    store["output_token"] = "TEZ"

    with pytest.raises(MichelsonRuntimeError) as error:
        result = obj.interpret(storage=store)
    assert 'Insufficient funds' in str(error)

def swap(b_o, b_i, w_i, w_o, a_i):
    return b_o * (1 - (b_i / (b_i + a_i)) ** (w_i / w_o))

def test_swap():
    random.seed(42)
    contract = ContractInterface.from_file(TARGET)
    obj = contract.swapTokens(None)
    for i in range(5):
        store = form_dummy_storage()
        eth_cnt = randint(1, 100)
        tez_cnt = randint(1, 100)
        eth_w = randint(1, 100) / 100
        tez_w = 1 - eth_w

        store["trader"]["user_wallet"] = {
            "ETH" : eth_cnt * PRECISION,
            "TEZ" : tez_cnt * PRECISION,
        }
        store["weight"] = {
            "TEZ" : int(tez_w * PRECISION),
            "ETH" : int(eth_w * PRECISION),
        }
        store["input_token"] = "ETH"
        store["output_token"] = "TEZ"
        store["inp_token_amount"] = randint(1, eth_cnt) * PRECISION
        
        result = obj.interpret(storage=store)
        delta = result.storage['trader']['user_wallet']['TEZ'] - tez_cnt * PRECISION
        real_delta = swap(store['reserve']['TEZ'] // PRECISION, store['reserve']['ETH'] // PRECISION, eth_w, tez_w, store["inp_token_amount"] // PRECISION)
        
        res_store = result.storage
        
        assert abs(delta / PRECISION - real_delta) < 2e-3
        assert res_store['swps_size'] == 1
        
        assert res_store['reserve']['TEZ'] == store['reserve']['TEZ'] - delta
        assert res_store['reserve']['ETH'] == store['reserve']['ETH'] + store["inp_token_amount"]

        assert res_store["trader"]["user_wallet"]['ETH'] == store["trader"]["user_wallet"]['ETH'] - store["inp_token_amount"]
        assert res_store["trader"]["user_wallet"]['TEZ'] == store["trader"]["user_wallet"]['TEZ'] + delta
        
        

def test_empty_pool():
    random.seed(42)
    contract = ContractInterface.from_file(TARGET)
    obj = contract.swapTokens(None)
    store = form_dummy_storage()
    eth_cnt = randint(1, 100)
    tez_cnt = randint(1, 100)
    store["trader"]["user_wallet"] = {
        "ETH" : eth_cnt * PRECISION,
        "TEZ" : tez_cnt * PRECISION,
    }
    store["reserve"] = {
        "TEZ" : 0,
        "ETH" : 0,
    }
    store["input_token"] = "ETH"
    store["output_token"] = "TEZ"
    store["inp_token_amount"] = randint(1, eth_cnt) * PRECISION

    with pytest.raises(MichelsonRuntimeError) as error:
        result = obj.interpret(storage=store)
    assert 'No such token in liquidity pool' in str(error)
    
