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
type openSaleParameter is  address * nat * timestamp * weights_t

type balancerEntrypoint is
    OpenSale of openSaleParameter
    | BuyToken of buyTokenParameter
    | CloseSale of closeSaleParameter

type returnType is list (operation) * storage

function open_sale( var token_address : address; // think, that issuer's account call this contract, so Tezos.sender != standart_contract_address  
                    var total_token_amount : nat;
                    var close_date : timestamp; 
                    var weights: weights_t;  
                    var store : storage)  
                    : returnType is
  block {
    // todo later: to check that the sale wasn't started
    // var token_address : address := Tezos.sender; // hmm
    store[token_address] := record [
        address = token_address;
        close_date  = close_date;
        weights = weights;
        total_token_amount = total_token_amount;
        total_tezos_amount = Tezos.amount;  // stores the amount of tezos laying on the contract's address
        token_sale_is_open = True;
    ];
    const token_contract : contract(entryAction) =
      case (Tezos.get_contract_opt(token_address) : option (contract (entryAction))) of
        Some (contract) -> contract
        | None -> (failwith ("Contract for this token not found.") : contract (entryAction))
      end;
    var token_amnt : nat := 1n; // will be calculated by amm
    var param : transferParams := (Tezos.self_address, (Tezos.sender, total_token_amount)); // to swap sender and reciever, but then doesn't work
    const op : operation = Tezos.transaction (Transfer(param), 0mutez, token_contract);
    const operations : list (operation) = list [op]
  } with (operations, store)



function buy_token (var tezos_amnt : mutez; var token_address : address; var store : storage) : returnType is
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
        if token_amnt > cur_token.total_token_amount then block {
            failwith ("Not enough tokens in liquidity pool");
        }
        else skip;
        var reciever : address := Tezos.sender; // hmm, the function to buy will be called from which address?
        
        var param : transferParams := (Tezos.self_address, ((reciever, token_amnt)));
        const op : operation = Tezos.transaction (Transfer(param), 0tez, token_contract);
        const operations : list (operation) = list [op];
        // todo: to calculate token_amnt with amm, to change storage
        cur_token.total_token_amount := abs(cur_token.total_token_amount - token_amnt);
        cur_token.total_tezos_amount := cur_token.total_tezos_amount + tezos_amnt;
        store[token_address] := cur_token;
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
