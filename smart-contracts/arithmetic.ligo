const precision : nat = 1000_000n;

function add_floats(var a : nat; var b : nat) : nat is
    block {
        var sum : nat := a + b;
    } with sum

function sub_floats(var a : nat; var b : nat) : nat is
    block {
        if a < b then failwith("Negative number couldn't be represented in nat")
        else skip;
        var sub : nat := abs(a - b);
    } with sub

function mul_floats(var a : nat; var b : nat) : nat is 
    block {
        var prod : nat := a * b / precision;
    } with prod

function div_floats(var a : nat; var b : nat) : nat is 
    block {
        var up : nat := a * precision;
        var res : nat := up /  b;
    } with res

function multiplyer(var a : nat; var b : nat) : nat is 
    if b = 0n then 1n else a

recursive function pow_float(var a : nat; var power : nat) : nat is
    block {
        skip;
    } with (failwith ("Not implemented yet") : nat)