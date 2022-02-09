#include "arithmetic.ligo"

type finance_storage is record [
    a : nat;
    b : nat;
    res : nat;
]
type parameter is
  FloatSum
  | FloatSub
  | FloatMul
  | FloatDiv
  | FloatPow
  | FloatRoot
  | FloatToNatPow
type entrypoint is list (operation) * finance_storage

function main (const action : parameter; var store : finance_storage): entrypoint is
    block {
         store.res := case action of
            FloatSum -> add_floats(store.a, store.b)
            | FloatSub -> sub_floats(store.a, store.b)
            | FloatMul -> mul_floats(store.a, store.b)
            | FloatDiv -> div_floats(store.a, store.b)
            | FloatPow -> pow_floats(store.a, store.b)
            | FloatRoot -> root_float(store.a, store.b)
            | FloatToNatPow -> pow_float_into_nat(store.a, store.b)
        end
    } with ((nil : list(operation)), store)