
type finance_storage is int // not int of course, but for now let it be int
type operation is record [
    user_account_id: nat;
    bought_tokens_number: nat
]

function balance_cost_weight(var storage: finance_storage; var operation: operation): finance_storage is
    block {
        skip
    } with(storage)