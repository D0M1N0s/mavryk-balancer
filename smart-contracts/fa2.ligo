type buyTokenParameter is ( tez * address)
type openSaleParameter is ( nat * timestamp * ( int * int ))
type closeSaleParameter is ( address )

type balancerEntrypoint is 
 openSale of openSaleParameter
|buyToken of buyTokenParameter
|closeSale of closeSaleParameter

type token is record [
  close_date : timestamp;
	weights : (int * int);
	total_token_amount : nat;
  total_tezos_amount : tez;
  token_sale_is_open : bool;
]

type storage is big_map (address, token)


type returnType is list (operation) * storage

function open_sale (const provided_total_token_amount : nat; const provided_close_date : timestamp; const provided_weights: (int * int) ;  const store : storage) : returnType is
  block {
	  // we check if the tokensale is present 
	  // if not continue 
		const token_record : option(token) = store[Tezos.sender];
		case token_record of 
		  Some(record) -> failwith("Tokensale is active.")
		  | None -> block{
			  store[Tezos.sender] := record [
				  close_date : provided_close_date;
				  weights : provided_weights; 
				  total_token_amount : provided_total_token_amount;
				  total_token_amount : 0mutez;
				  token_sale_is_open : True;
			  ]
		  }
		end 
        }
  } with ((nil : list (operation)), store)

function buy_token (const provided_tez : tez; const provided_address : address; const store : storage) : returnType is
  block {
		const token_record : option(token) = store[provided_address];
		case token_record of 
		  Some(record) -> block{
			  		if Tezos.now < store[provided_address].close_date then{
						  BalanceWeights()
					}
					else{
						failwith("The tokensale is over.")
					}
		  }
		  | None -> failwith("Tokensale doesn't exist.")
		end 
        }
  } with ((nil : list(operation)), store)

function close_sale (const contract_address : address; const store : storage) : returnType is
  block {
      if store.[contract_address] then {
        if Tezos.now < store[contract_address].close_date then failwith("The tokensale will reamain open, untill the end of timer.")
        else{
			// burn tokens and delete recording from the map
        }
      } else {
        failwith("The tokensale is already closed.")
      }
  } with ((nil : list(operation)), store)



function main (const action : balancerEntrypoint; const store : storage): returnType is
block {
    const return : returnType = case action of
    openSale (param) -> open_sale (param.0, param.1, param.2, store)
    | buyToken (param) -> buy_token (param.0, param.1, store)
	| closeSale (param) -> close_sale (param, store)
    end;
} with return
