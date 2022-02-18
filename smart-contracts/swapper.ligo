type buyTokenParameter is unit 
type openSaleParameter is ( nat * timestamp * ( int * int ))
type closeSaleParameter is nat 

type balancerEntrypoint is 
 openSale of openSaleParameter
|buyToken of buyTokenParameter
|closeSale of closeSaleParameter

type token is record [
    address : address;
    close_date : timestamp;
	weights : (int * int);
	total_token_amount : nat;
    total_tezos_amount : tez;
    token_sale_is_open : bool;
]

type storage is big_map (address, token)


type returnType is list (operation) * storage

function open_sale (const total_token_amount : nat; const close_date : timestamp; const weights: (int * int) ;  const store : storage) : returnType is
  block {
    if Tezos.source =/= store.admin
    then failwith ("Administrator not recognized.")
    else {
      if not store.raffle_is_open then {
        if Tezos.amount < jackpot_amount then failwith ("The administrator does not own enough tz.")
        else {
          const today : timestamp = Tezos.now;
          const seven_day : int = 7 * 86400;
          const in_7_day : timestamp = today + seven_day;
          const is_close_date_not_valid : bool = close_date < in_7_day;
          if is_close_date_not_valid then failwith("The raffle must remain open for at least 7 days.")
          else {
            patch store with record [
            jackpot = jackpot_amount;
            close_date = close_date;
            raffle_is_open = True;
            ];

            case description of
              Some(d) -> patch store with record [description=d]
            | None -> {skip}
            end
          }
        }
      }
      else {
        failwith ("A raffle is already open.")
      }
    }
  } with ((nil : list (operation)), store)

function buy_token (const param: unit; const store : storage) : returnType is
  block {
    if store.raffle_is_open then {
      const ticket_price : tez = 1tez;
      const current_player : address = Tezos.sender;
      if Tezos.amount = ticket_price then failwith("The sender does not own enough tz to buy a ticket.")
      else {
        if store.players contains current_player then failwith("Each player can participate only once.")
        else {
            skip
        }
      }
    } else {
      failwith("The raffle is closed.")
    }
  } with ((nil : list (operation)), store)

function close_sale (const param : unit; const store : storage) : returnType is
  block {
    const operations : list(operation) = nil;
    if Tezos.source =/= store.admin then failwith("Administrator not recognized.")
    else {
      if store.raffle_is_open then {
        if Tezos.now < store.close_date then failwith("The raffle must remain open for at least 7 days.")
        else{
          const number_of_players : nat = Set.size(store.players);
          const random_number : nat = 467n; // hardcoded number
          const winning_ticket_id : nat = random_number mod number_of_players; // modulo expression
        }
      } else {
        failwith("The raffle is closed.")
      }
    }
  } with (operations, store)

function main (const action : balancerEntrypoint; const store : storage): returnType is
block {
    const return : returnType = case action of
    openSale (param) -> open_sale (param.0, param.1, param.2, store)
    | buyToken (param) -> buy_token (param, store)
	  | closeSale (param) -> close_sale (param, store)
    end;
} with return
