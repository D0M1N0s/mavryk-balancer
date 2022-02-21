type token_id is nat

//объявляем типы входящих параметров, которые принимает функция передачи токена: адрес получателя, id и количество токенов. В тип transfer добавляем адрес отправителя
type transfer_destination is [@layout:comb] record [
    to_ : address;
    token_id : token_id;
    amount : nat;
]

type transfer is [@layout:comb] record [
    from_ : address;
    txs : list(transfer_destination);
]

//объявляем типы для чтения баланса: адрес владельца, id токена,
type balance_of_request is [@layout:comb] record [
    owner : address;
    token_id : token_id;
]

type balance_of_response is [@layout:comb] record [
    request : balance_of_request;
    balance : nat;
]

type balance_of_param is [@layout:comb] record [
    requests : list(balance_of_request);
    callback : contract (list(balance_of_response));
]

//объявляем тип оператора — адреса, который может отправлять токены
type operator_param is [@layout:comb] record [
    owner : address;
    operator : address;
    token_id: token_id;
]

//объявляем тип параметров, которые нужны для обновления списка операторов
type update_operator is [@layout:comb]
    | Add_operator of operator_param
    | Remove_operator of operator_param

//объявляем тип, который содержит метаданные NFT: ID токена и ссылку на json-файл
type token_info is (token_id * map(string, bytes))

type token_metadata is big_map (token_id, token_info)

//объявляем тип со ссылкой на метаданные смарт-контракта. Эти данные будут отображаться в кошельке
type metadata is big_map(string, bytes)

//объявляем тип, который может хранить записи о нескольких токенах и их метаданных в одном контракте
type token_metadata_param is [@layout:comb] record [
    token_ids : list(token_id);
    handler : (list(token_metadata)) -> unit;
]

//объявляем псевдо-точки входа: передача токенов, проверка баланса, обновление операторов и проверка метаданных
type entryAction is
    | Transfer of list(transfer)
    | Balance_of of balance_of_param
    | Update_operators of list(update_operator)
    | Token_metadata_registry of contract(address)

type fa2_token_metadata is
    | Token_metadata of token_metadata_param

//объявляем типы данных для изменения разрешений на передачу токенов. Например, с их помощью можно сделать токен, который нельзя отправить на другой адрес
type operator_transfer_policy is [@layout:comb]
    | No_transfer
    | Owner_transfer
    | Owner_or_operator_transfer

type owner_hook_policy is [@layout:comb]
    | Owner_no_hook
    | Optional_owner_hook
    | Required_owner_hook

type custom_permission_policy is [@layout:comb] record [
    tag : string;
    config_api: option(address);
]

type permissions_descriptor is [@layout:comb] record [
    operator : operator_transfer_policy;
    receiver : owner_hook_policy;
    sender : owner_hook_policy;
    custom : option(custom_permission_policy);
]

type transfer_destination_descriptor is [@layout:comb] record [
    to_ : option(address);
    token_id : token_id;
    amount : nat;
]

type transfer_descriptor is [@layout:comb] record [
    from_ : option(address);
    txs : list(transfer_destination_descriptor)
]

type transfer_descriptor_param is [@layout:comb] record [
    batch : list(transfer_descriptor);
    operator : address;
]

//OPERATORS

//объявляем тип, который хранит записи об операторах в одном big_map
type operator_storage is big_map ((address * (address * token_id)), unit)