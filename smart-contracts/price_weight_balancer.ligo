
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
]
type parameter is
  SwapTokens

type entrypoint is list (operation) * finance_storage

function rebalance_weights   (var reserve_token_i : nat; 
                              var reserve_token_o : nat;
                              var delta_token_i : nat) : nat is
    block {
        var delta_token_o : nat := reserve_token_o * delta_token_i / (delta_token_i + reserve_token_i); // but no float, need to deal with it
    } with delta_token_o

function swap_tokens(const store : finance_storage) : entrypoint is 
  block {
    var token_i : string := store.input_token;
    var token_o : string := store.output_token;
    var reserve_i : nat :=  case store.reserve[token_i] of
      Some (val) -> val
      | None -> (failwith ("No such token in liquidity pool") : nat)
    end;
    var reserve_o : nat :=  case store.reserve[token_o] of
      Some (val) -> val
      | None -> (failwith ("No such token in liquidity pool") : nat)
    end;
    var delta_token_o : nat := rebalance_weights(reserve_i, reserve_o, store.amount);
    // todo: transactions + storage changing logic
  } with ((nil : list(operation)), store)

function main (const action : parameter; const store : finance_storage): entrypoint is
  case action of
    SwapTokens -> swap_tokens(store)
  end