type token_id is nat

type transfer_destination is [@layout:comb] record [
    to_ : address;
    token_id : token_id;
    amount : nat;
]

type transfer is [@layout:comb] record [
    from_ : address;
    txs : list(transfer_destination);
]

type transferType is list(transfer)