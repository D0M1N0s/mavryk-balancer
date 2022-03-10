#include "token_types/fa12_types.ligo"
#include "lib/arithmetic.ligo"

type float is nat
type weights_t is michelson_pair(int, "token_weight", int, "based_asset_weight")

type token is record [
    token_address : address;
    close_date : timestamp;
    weights : weights_t;  // stored as (number * c_PRECISION, number * c_PRECISION)
    token_amount : float; // stored as number * c_PRECISION
    based_asset_amount : float; // stored as number * c_PRECISION
    sale : bool;
    token_dec : nat;
    based_asset_decimals : nat;
    token_name : string;
    based_asset_address : string;
    based_asset_name : string;
]

type storage is record[
    token_list: big_map (address, token);
    admin : address;
]

type buyTokenParameter is nat * address * address
type closeSaleParameter is address
type openSaleParameter is  address * float * float * timestamp * weights_t * nat * nat * string * address * string * string

type balancerEntrypoint is
    | OpenSale of openSaleParameter
    | BuyToken of buyTokenParameter
    | CloseSale of closeSaleParameter

type returnType is list (operation) * storage


function open_sale( var token_address : address; 
                    var token_amount : float;
                    var based_asset_amount : float;
                    var close_date : timestamp; 
                    var weights: weights_t;  
                    var token_decimals : nat;
                    var based_asset_decimals : nat;
                    var token_name : string;
                    var token_issuer : address;
                    var based_asset_address : string;
                    var based_asset_name : string;
                    var store : storage)  
                    : returnType is
block {
    if Tezos.sender =/= store.admin then failwith("Not admin");
    else skip;
    case store.token_list[token_address] of
        | Some(val) -> block {
                if val.sale then failwith ("Tokensale is already open");
                else skip;
            }
        | None -> skip
    end;
    store.token_list[token_address] := record [
        token_address = token_address;
        close_date  = close_date;
        weights = weights;
        token_amount = token_amount;
        based_asset_amount = based_asset_amount;
        sale = True;
        token_dec = token_decimals;
        based_asset_decimals = based_asset_decimals;
        token_name = token_name;
        based_asset_address = based_asset_address;
        based_asset_name = based_asset_name;

    ];
    const token_contract : contract(transferParams) =
        case (Tezos.get_entrypoint_opt("%transfer", token_address) : option (contract (transferParams))) of
            | Some (contract) -> contract
            | None -> (failwith ("Contract for this token not found.") : contract (transferParams))
        end;
    var power : int := c_PRECISION_ORDER - token_decimals;
    var divisor : nat := pow(10n, abs(power));
    var token_amnt := token_amount;
    if power > 0 then
        token_amnt := token_amnt / divisor;
    else
        token_amnt := token_amnt * divisor;
    var transfer_param : transferParams := (token_issuer, (Tezos.self_address, token_amnt));
    const op : operation = Tezos.transaction (transfer_param, 0mutez, token_contract);
    const operations : list (operation) = list [op];
} with (operations, store)


// All float numbers are represented as nat / c_PRECISION 
function get_token_amount(var reserve_token_i : float; 
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
  
function buy_token (var base_asset_amnt : nat; 
                    var token_address : address; 
                    var reciever : address; 
                    var store : storage) : returnType is
block {
    if Tezos.sender =/= store.admin then failwith("Not admin");
    else skip;
    var cur_token : token := case store.token_list[token_address] of
        | Some(val) -> val
        | None -> failwith("No such token")
    end;
    if not cur_token.sale then block {
        failwith("Tokensale is closed");
    } else skip;
    const token_contract : contract(transferParams) =
        case (Tezos.get_entrypoint_opt("%transfer", token_address) : option (contract (transferParams))) of
            | Some (contract) -> contract
            | None -> (failwith ("Contract for this token not found.") : contract (transferParams))
        end;
    var token_w : float := abs (cur_token.weights.0);
    var base_asset_w : float := abs (cur_token.weights.1);
    var base_asset_reserve : float := cur_token.based_asset_amount;
    var token_reserve : float := cur_token.token_amount;
    var delta_token := get_token_amount(base_asset_reserve, token_reserve,  base_asset_amnt, base_asset_w, token_w);

    var power : int := c_PRECISION_ORDER - cur_token.token_dec;
    var divisor : nat := pow(10n, abs(power));
    var token_amnt := delta_token;
    if power > 0 then
        token_amnt := token_amnt / divisor;
    else
        token_amnt := token_amnt * divisor;
        
    // var reciever : address := Tezos.sender; // hmm, the function to buy will be called from which address?
            
    var param : transferParams := (Tezos.self_address, ((reciever, token_amnt)));
    const op : operation = Tezos.transaction (param, 0tez, token_contract);
    const operations : list (operation) = list [op];
      
    if power > 0 then
        token_amnt := token_amnt * divisor;
    else
        token_amnt := token_amnt / divisor;
    cur_token.token_amount := abs(cur_token.token_amount - token_amnt);
    cur_token.based_asset_amount := cur_token.based_asset_amount + base_asset_amnt;
    store.token_list[token_address] := cur_token;
} with (operations, store)
    

function close_sale (var token_address : address; var store : storage) : returnType is 
block {
    if Tezos.sender =/= store.admin then failwith("Not admin");
    else skip;
    var cur_token : token := case store.token_list[token_address] of
        | Some(val) -> val
        | None -> failwith("No such token in tokensale")
    end;
    if not cur_token.sale then block {
        failwith("Tokensale is already closed");
    } else skip;
    if Tezos.now < cur_token.close_date then block {
        failwith("Closing time hasn't come yet");
    } else skip;
    cur_token.sale := False;
    store.token_list[token_address] := cur_token;
    // add burning tokens and sending money to issuer
} with ((nil : list (operation)), store)

function main (var action : balancerEntrypoint; var store : storage): returnType is
    case action of
        | OpenSale (param) -> open_sale (param.0, param.1, param.2, param.3, param.4, param.5, param.6, param.7, param.8, param.9, param.10, store)
        | BuyToken (param) -> buy_token(param.0, param.1, param.2, store)
        | CloseSale (param) -> close_sale (param, store)
    end
