#include "fa12_types.ligo"

type weights_t is michelson_pair(int, "1st_weight", int, "2nd_weight")

type token is record [
    address : address;
    close_date : timestamp;
	weights : weights_t;
	total_token_amount : nat;
    total_tezos_amount : tez;
    token_sale_is_open : bool;
]

type storage is big_map (address, token)

type buyTokenParameter is tez * address
type closeSaleParameter is nat
type openSaleParameter is  nat * tez * timestamp * weights_t

type balancerEntrypoint is
    OpenSale of openSaleParameter
    | BuyToken of buyTokenParameter
    | CloseSale of closeSaleParameter

type returnType is list (operation) * storage

function open_sale( var total_token_amount : nat;
                    var total_tezos_amount : tez;
                    var close_date : timestamp; 
                    var weights: weights_t;  
                    var store : storage)  
                    : returnType is
  block {
    var token_address : address := Tezos.sender; // hmm
    store[token_address] := record [
        address = token_address;
        close_date  = close_date;
        weights = weights;
        total_token_amount = total_token_amount;
        total_tezos_amount = total_tezos_amount;
        token_sale_is_open = True;
    ];
  } with ((nil : list (operation)), store)


function buy_token (var tezos_amnt : tez; var token_address : address; var store : storage) : returnType is
  block {
      var cur_token : token := case store[token_address] of
        | Some(val) -> val
        | None -> failwith("No such token")
      end;
      if not cur_token.token_sale_is_open then block {
        failwith("Tokensale is closed");
      } 
      else skip;
        const token_contract : contract(entryAction) =
        case (Tezos.get_contract_opt(token_address) : option (contract (entryAction))) of
            Some (contract) -> contract
            | None -> (failwith ("Contract for this token not found.") : contract (entryAction))
        end;
        var token_amnt : nat := 2n; // will be calculated by amm
        var reciever : address := Tezos.sender;
        var param : transferParams := (Tezos.self_address, ((reciever, token_amnt)));
        const op : operation = Tezos.transaction (Transfer(param), 0tez, token_contract);
        const operations : list (operation) = list [op]
    } with (operations, store)
    

function close_sale (var winning_ticket_number : nat; var store : storage) : returnType is
  block {
      skip;
  } with ((nil : list (operation)), store)

function main (var action : balancerEntrypoint; var store : storage): returnType is
    case action of
        | OpenSale (param) -> open_sale (param.0, param.1, param.2, param.3, store)
        | BuyToken (param) -> buy_token(param.0, param.1, store)
        | CloseSale (param) -> close_sale (param, store)
    end
