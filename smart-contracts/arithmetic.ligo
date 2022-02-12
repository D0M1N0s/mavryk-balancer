const c_PRECISION : nat = 1000_000_000n;

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

// powers the float into nat power
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