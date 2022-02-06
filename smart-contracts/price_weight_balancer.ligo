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

function rebalance_weights   (var reserve_token_i : nat; 
                              var reserve_token_o : nat;
                              var delta_token_i : nat;
                              var weight_i : nat;
                              var weight_o : nat) : nat is
    block {
        var delta_token_o : nat := reserve_token_o * delta_token_i / (delta_token_i + reserve_token_i); 
        // todo: 
        // - to change rebalancing function (it should support different weights)
        // - to understand how to use floats, while there no of then in ligo
    } with delta_token_o

function swap_tokens(const store : finance_storage) : entrypoint is 
  block {
    var token_i : string := store.input_token;
    var token_o : string := store.output_token;
    var reserve_i : nat := get_value_from_opt(store.reserve[token_i], "No such token in liquidity pool");
    var reserve_o : nat := get_value_from_opt(store.reserve[token_o], "No such token in liquidity pool");

    var delta_token_o : nat := rebalance_weights(reserve_i, reserve_o, store.amount, 50n * 100_000n, 50n * 10_000n);
    // todo: transactions + storage changing logic
  } with ((nil : list(operation)), store)

function main (const action : parameter; const store : finance_storage): entrypoint is
  case action of
    SwapTokens -> swap_tokens(store)
    | ChangeAssetsRatio -> (failwith("Not implemented yet") : entrypoint)
  end