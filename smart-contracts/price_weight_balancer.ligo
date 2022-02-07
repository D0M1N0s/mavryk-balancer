#include "arithmetic.ligo"

type user is record [
  user_wallet: big_map(string, nat);
  user_id : nat;
]
type finance_storage is record [
    trader : user;
    input_token : string;
    output_token : string;
    amount : nat;
    reserve : big_map(string, nat); // need to store the liquidity pool, but for now it is big_map
    weight : big_map(string, nat); // the real ratio of asset is weight[asset] / 10**6
]
type parameter is
  SwapTokens
  | ChangeAssetsRatio
type entrypoint is list (operation) * finance_storage

function get_value_from_opt(const data : option(nat); const error : string) : nat is 
  case data of
    Some (val) -> val
    | None -> (failwith (error) : nat)
  end

// All float numbers are represented as nat / precision 
// Since there no real floats in ligo it is necessary to mul numbers with precision
function rebalance_weights   (var reserve_token_i : nat; 
                              var reserve_token_o : nat;
                              var delta_token_i : nat;
                              var weight_i : nat;
                              var weight_o : nat) : nat is
    block {
        var fraction : nat := div_floats(reserve_token_i * precision, (reserve_token_i + delta_token_i) * precision);
        var power : nat := div_floats(weight_i * precision, weight_o * precision);
        var fraction_root : nat := pow_floats(fraction, power);
        var sub_res : nat := sub_floats(1n * precision, fraction_root * precision);
        var delta_token_o : nat := mul_floats(reserve_token_o * precision, sub_res);
        // todo: to think of calculations optimisation to reduce rounding error
    } with delta_token_o

function swap_tokens(const store : finance_storage) : entrypoint is 
  block {
    var token_i : string := store.input_token;
    var token_o : string := store.output_token;
    var reserve_i : nat := get_value_from_opt(store.reserve[token_i], "No such token in liquidity pool");
    var reserve_o : nat := get_value_from_opt(store.reserve[token_o], "No such token in liquidity pool");

    var delta_token_o : nat := rebalance_weights(reserve_i, reserve_o, store.amount, 50n * 100_000n, 50n * 100_000n);
    // todo: transactions + storage changing logic
  } with ((nil : list(operation)), store)

function main (const action : parameter; const store : finance_storage): entrypoint is
  case action of
    SwapTokens -> swap_tokens(store)
    | ChangeAssetsRatio -> (failwith("Not implemented yet") : entrypoint)
  end