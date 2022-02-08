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
        if b = 0n then failwith("Zero division");
        else skip;
        var up : nat := a * precision;
        var res : nat := up /  b;
    } with res

// powers the float into nat power
function pow_float_into_nat(var a : nat; var power : nat) : nat is
    block {var res : nat := 1n;
        var powered_a : nat := a;
        while power > 0n block {
            if power mod 2n = 1n then res := res * powered_a;
            else skip;
            powered_a := mul_floats(powered_a, powered_a);
            power := power / 2n;
        }
    } with res

// gets the nat power from float
function root_float(var a : nat; var root_pow : nat) : nat is
    block {
        var root : nat := a;
        var powered : nat := pow_float_into_nat(root, sub_floats(root_pow, 1n));
        while abs (mul_floats(root, powered) - a) > precision block {
            var value : nat := sub_floats(root_pow, 1n) * root + div_floats(a, powered);
            root := div_floats(value, root_pow); 
            powered := pow_float_into_nat(root, sub_floats(root_pow, 1n));
        }
    } with root

function pow_floats(var a : nat; var power : nat) : nat is
    // to check that it works correctly with "float" numbers ("float" = nat / precision)
    block {
        var res : nat := pow_float_into_nat(a, power);
        res := root_float(res, precision);
    } with res