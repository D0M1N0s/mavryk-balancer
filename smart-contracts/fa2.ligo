const c_PRECISION : nat = 10_000_000_000n;

type buyTokenParameter is tez * string
type openSaleParameter is nat * timestamp * ( int * int )
type closeSaleParameter is string

type balancerEntrypoints is
  Buy of buyTokenParameter
| Sale of openSaleParameter
| Close of closeSaleParameter

type token is record [
  close_date : timestamp;
  weights : (int * int);
  total_token_amount : nat;
  total_tezos_amount : tez;
  token_sale_is_open : bool;
]

type storage is big_map (address, token)
type returnType is list (operation) * storage

function mul(var a : int; var b : int) : int is 
    block {
        var prod : int := a * b / c_PRECISION;
} with prod

function div(var a : int; var b : int) : int is 
    block {
        if b = 0 then failwith("Zero division");
        else skip;
        var up : int := a * c_PRECISION;
        var res : int := up /  b;
} with res

function add_floats(var a : nat; var b : nat) : nat is
    block {
        var sum : nat := a + b;
} with sum

function sub_floats(var a : nat; var b : nat) : nat is
    block {
        if a < b 
            then failwith("Negative number couldn't be represented in nat")
        else skip;
        var sub : nat := abs(a - b);
} with sub

function mul_floats(var a : nat; var b : nat) : nat is abs(mul(int(a), int(b)))

function div_floats(var a : nat; var b : nat) : nat is abs(div(int(a), int(b)))

function pow_float_into_nat(var a : nat; var power : nat) : nat is
    block {
        var res : nat := c_PRECISION;
        var powered_a : nat := a;
        while power > 0n block {
            if power mod 2n = 1n 
                then res := mul_floats(res, powered_a);
            else skip;
            powered_a := mul_floats(powered_a, powered_a);
            power := power / 2n;
        }
} with res

// gets the approximation of a ^ (root_pow / c_PRECISION) with Taylor series 
// x ^ alpha = sum binomial(alpha, n) * (x - 1) ^ n for n from 0 to infty
// we call this function only for 0 < x < 1 => Taylor series converges
function approx_pow_float(var base : nat; var alpha : nat) : nat is
    block {
        var series_member : int := 1 * c_PRECISION;
        var res : int := 0;
        var multiplyer : int := 1;
        var n : int := 1;
        while n < 2000 block {
            res := res + series_member;
            multiplyer := mul(alpha - (n - 1) * c_PRECISION, base - 1 * c_PRECISION);
            multiplyer := div(multiplyer, n * c_PRECISION);
            series_member := mul(series_member, multiplyer);
            n := n + 1;
        }
} with abs(res)

// a ^ (power / presision) = a ^ (power // presision) * a ^ (power % c_PRECISION) / c_PRECISION
function pow_floats(var a : nat; var power : nat) : nat is
    block {
        var mul1 : nat := pow_float_into_nat(a, power / c_PRECISION);
        var mul2 : nat := approx_pow_float(a, power mod c_PRECISION);
        var res : nat := mul_floats(mul1, mul2);
} with res

function open_sale (const provided_total_token_amount : nat; const provided_close_date : timestamp; const provided_weights: (int * int) ;  const store : storage ) : returnType is
 begin
    const token_record : option(token) = store[Tezos.sender];
    case token_record of
      Some(i) -> failwith("The tokensale is already open")
    | None -> begin
            store[Tezos.sender] := record
                close_date = provided_close_date;
                weights = provided_weights; 
                total_token_amount = provided_total_token_amount;
                total_tezos_amount = 0mutez;
                token_sale_is_open = True;
            end
        end
    end
  end 
 with ((nil : list (operation)), store)

function buy_token (const provided_tez : tez; const provided_address : address; const store : storage ) : returnType is
 begin
    const token_record : option(token) = store[provided_address];
    case token_record of
      None -> failwith("The tokensale is already open")
    | Some(i) -> begin
            if Tezos.now < i.close_date then 
            block{
                failwith("Spectators")
            }
            else failwith("Spectators");
            end
        end
end with ((nil : list(operation)), store)

function close_sale (const contract_address : string; const store : storage ) : returnType is
 begin
    const token_record : option(token) = store[provided_address];
    case token_record of
      None -> failwith("The tokensale is already open")
    | Some(i) -> begin
            if Tezos.now < i.close_date then 
            block{
                failwith("Spectators")
            }
            else failwith("Spectators");
            end
        end
end with ((nil : list(operation)), store)



function main (const action : balancerEntrypoints; const store : storage): returnType is
block {
    const return : returnType = case action of
    Sale (param) -> open_sale (param.0, param.1, param.2, store)
    | Buy (param) -> buy_token (param.0, param.1, store)
	| Close (param) -> close_sale (param, store)
    end;
} with return
