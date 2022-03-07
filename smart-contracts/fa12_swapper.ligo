#include "token_types/fa12_types.ligo"
#include "lib/arithmetic.ligo"

type float is nat
type weights_t is michelson_pair(int, "token_weight", int, "base_asset_weight")
// type decimals_t is 

type token is record [
    address : address;
    close_date : timestamp;
	  weights : weights_t;  // stored as (number * c_PRECISION, number * c_PRECISION)
	  total_token_amount : float; // stored as number * c_PRECISION
    total_based_asset_amount : float; // stored as number * c_PRECISION
    token_sale_is_open : bool;
    token_decimals : nat;
    based_asset_decimals : nat;
]

type storage is big_map (address, token)

type buyTokenParameter is nat * address
type closeSaleParameter is address
type openSaleParameter is  address * float * float * timestamp * weights_t * nat * nat

type balancerEntrypoint is
    | OpenSale of openSaleParameter
    | BuyToken of buyTokenParameter
    | CloseSale of closeSaleParameter

type returnType is list (operation) * storage


function open_sale( var token_address : address; 
                    var total_token_amount : float;
                    var total_based_asset_amount : float;
                    var close_date : timestamp; 
                    var weights: weights_t;  
                    var token_decimals : nat;
                    var based_asset_decimals : nat;
                    var store : storage)  
                    : returnType is
  block {
    case store[token_address] of
      | Some(val) -> block {
          if val.token_sale_is_open then failwith ("Tokensale is already open");
          else skip;
        }
      | None -> skip
    end;
    store[token_address] := record [
        address = token_address;
        close_date  = close_date;
        weights = weights;
        total_token_amount = total_token_amount;
        total_based_asset_amount = total_based_asset_amount;  // stores the amount of tezos laying on the contract's address
        token_sale_is_open = True;
        token_decimals = token_decimals;
        based_asset_decimals = based_asset_decimals;
    ];
    const token_contract : contract(entryAction) =
      case (Tezos.get_contract_opt(token_address) : option (contract (entryAction))) of
        Some (contract) -> contract
        | None -> (failwith ("Contract for this token not found.") : contract (entryAction))
      end;
    
    var transfer_param : transferParams := (Tezos.sender, ( Tezos.self_address, total_token_amount / c_PRECISION)); // to swap sender and reciever, but then doesn't work
    const op : operation = Tezos.transaction (Transfer(transfer_param), 0mutez, token_contract);
    const operations : list (operation) = list [op];
  } with (operations, store)


// All float numbers are represented as nat / c_PRECISION 
function get_token_amount   ( var reserve_token_i : float; 
                              var reserve_token_o : float;
                              var delta_token_i : float;
                              var weight_i : float;
                              var weight_o : float) : float is
    block {
        var fraction : float := div_floats(reserve_token_i, (reserve_token_i + delta_token_i));
        var power : float := div_floats(weight_i, weight_o);
        var fraction_root : nat := pow_floats(fraction, power);
        var sub_res : float := sub_floats(1n * c_PRECISION, fraction_root);
        var delta_token_o : float := mul_floats(reserve_token_o, sub_res);
    } with delta_token_o;
  
function buy_token (var base_asset_amnt : nat; var token_address : address; var store : storage) : returnType is
  block {
      var cur_token : token := case store[token_address] of
        | Some(val) -> val
        | None -> failwith("No such token")
      end;
      if not cur_token.token_sale_is_open then block {
        failwith("Tokensale is closed");
      } else skip;
      const token_contract : contract(entryAction) =
      case (Tezos.get_contract_opt(token_address) : option (contract (entryAction))) of
          Some (contract) -> contract
          | None -> (failwith ("Contract for this token not found.") : contract (entryAction))
      end;
      var token_w : float := abs (cur_token.weights.0);
      var base_asset_w : float := abs (cur_token.weights.1);
      var base_asset_reserve : float := cur_token.total_based_asset_amount;
      var token_reserve : float := cur_token.total_token_amount;
      var delta_token := get_token_amount(base_asset_reserve, token_reserve,  base_asset_amnt, base_asset_w, token_w);

      var power : int := c_PRECISION_ORDER - cur_token.token_decimals;
      var divisor : nat := pow(10n, abs(power));
      var token_amnt := delta_token;
      if power > 0 then
        token_amnt := token_amnt / divisor;
      else
        token_amnt := token_amnt * divisor;
      
      var reciever : address := Tezos.sender; // hmm, the function to buy will be called from which address?
        
      var param : transferParams := (Tezos.self_address, ((reciever, token_amnt)));
      const op : operation = Tezos.transaction (Transfer(param), 0tez, token_contract);
      const operations : list (operation) = list [op];
      
      if power > 0 then
        token_amnt := token_amnt * divisor;
      else
        token_amnt := token_amnt / divisor;
      cur_token.total_token_amount := abs(cur_token.total_token_amount - token_amnt);
      cur_token.total_based_asset_amount := cur_token.total_based_asset_amount + base_asset_amnt;
      store[token_address] := cur_token;
  } with (operations, store)
    

function close_sale (var token_address : address; var store : storage) : returnType is
  block {
    var cur_token : token := case store[token_address] of
        | Some(val) -> val
        | None -> failwith("No such token in tokensale")
    end;
    if not cur_token.token_sale_is_open then block {
      failwith("Tokensale is already closed");
    } else skip;
    if Tezos.now < cur_token.close_date then block {
      failwith("Closing time hasn't come yet");
    } else skip;
    cur_token.token_sale_is_open := False;
    store[token_address] := cur_token;
    // add burning tokens and sending money to issuer
  } with ((nil : list (operation)), store)

function main (var action : balancerEntrypoint; var store : storage): returnType is
    case action of
        | OpenSale (param) -> open_sale (param.0, param.1, param.2, param.3, param.4, param.5, param.6, store)
        | BuyToken (param) -> buy_token(param.0, param.1, store)
        | CloseSale (param) -> close_sale (param, store)
    end
