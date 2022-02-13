#include "arithmetic.ligo"

type user is record [
    user_wallet: big_map(string, nat);
    user_address : nat;
]
type swap_t is record [
    transfered_coin : string;
    received_coin : string;
    amount : tez;
    reciever : nat;
]
type storage_t is record [
    trader : user;
    input_token : string;
    output_token : string;
    inp_token_amount : nat;
    reserve : big_map(string, nat); // need to store the liquidity pool, but for now it is big_map
    weight : big_map(string, nat); // the real ratio of asset is weight[asset] / 10**6
    swaps : big_map(nat, swap_t);
    swps_size : nat;
]
type action_t is
    SwapTokens
    | ChangeAssetsRatio
type entrypoint is list (operation) * storage_t

function get_opt(const data : option(nat)) : nat is 
    case data of
        Some (val) -> val
        | None -> 0n
    end

// All float numbers are represented as nat / c_PRECISION 
// Since there no real floats in ligo it is necessary to mul numbers with c_PRECISION
function rebalance_weights   (var reserve_token_i : nat; 
                              var reserve_token_o : nat;
                              var delta_token_i : nat;
                              var weight_i : nat;
                              var weight_o : nat) : nat is
    block {
        var fraction : nat := div_floats(reserve_token_i * c_PRECISION, (reserve_token_i + delta_token_i) * c_PRECISION);
        var power : nat := div_floats(weight_i, weight_o);
        var fraction_root : nat := pow_floats(fraction, power);
        var sub_res : nat := sub_floats(1n * c_PRECISION, fraction_root);
        var delta_token_o : nat := mul_floats(reserve_token_o * c_PRECISION, sub_res) / c_PRECISION;
        // todo: to think of calculations optimisation to reduce rounding error
    } with delta_token_o;

function swap_tokens(var store : storage_t) : entrypoint is 
  block {
    var token_i : string := store.input_token;
    var token_o : string := store.output_token;
    var reserve_i : nat := get_opt(store.reserve[token_i]);
    if reserve_i = 0n then failwith("No such token in liquidity pool");
    else skip;
    var reserve_o : nat := get_opt(store.reserve[token_o]);
    if reserve_o = 0n then failwith("No such token in liquidity pool");
    else skip;
    if get_opt(store.trader.user_wallet[token_i]) < store.inp_token_amount then 
        failwith ("Insufficient funds");
    else skip;

    var weight_o : nat := get_opt(store.weight[token_o]);
    var weight_i : nat := get_opt(store.weight[token_i]);
    var delta_token_o : nat := 
        rebalance_weights(reserve_i, reserve_o, store.inp_token_amount, weight_i, weight_o);
    
    store.swaps[store.swps_size] := record [
        amount = Tezos.amount;
        reciever = store.trader.user_address;
        transfered_coin = token_i;
        received_coin = token_o;
    ];
    store.swps_size := store.swps_size + 1n;
    var trader_inp_reserve : nat := get_opt(store.trader.user_wallet[token_i]);
    var trader_out_reserve : nat := get_opt(store.trader.user_wallet[token_o]);
    store.trader.user_wallet[token_i] := abs (trader_inp_reserve - store.inp_token_amount);
    store.trader.user_wallet[token_o] := trader_out_reserve + delta_token_o;
    store.reserve[token_i] := get_opt(store.reserve[token_i]) + store.inp_token_amount;
    store.reserve[token_o] := abs(get_opt(store.reserve[token_o]) - delta_token_o);
  } with ((nil : list(operation)), store)

function main (const action : action_t; const store : storage_t): entrypoint is
    case action of
        SwapTokens -> swap_tokens(store)
        | ChangeAssetsRatio -> (failwith("Not implemented yet") : entrypoint)
    end