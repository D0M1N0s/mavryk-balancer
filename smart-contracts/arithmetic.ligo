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

// UNDONE!!!
function pow_floats(var a : nat; var power : nat) : nat is
    block {
        // to check that it works correctly with "float" numbers ("float" = nat / precision)
        var res : nat := 1n;
        var powered_a : nat := a;
        while power > 0n block {
            if power mod 2n = 1n then res := res * powered_a;
            else skip;
            powered_a := powered_a * powered_a;
            power := power / 2n;
        }
        // no float in result, need to normalize it and to represent as nat / precision
    } with res