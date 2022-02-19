import { FA12_Caller } from './fa12_caller_module'

const TOKEN_STANDART_CONTRACT = 'KT1LDjRzueHme3nDQGC9irB7MtWDVstm3ebC' // адрес опубликованного контракта стандарта токена
const SENDER = 'tz1MtDKdcXrk4s9aMA73uVjCSFpd1WEqRM2H' // публичный адрес отправителя (эмитента)
const TOKENSALE_CONTRACT = 'KT1GZ8uDosenty4zLaywBYbsj7UvicuSEqEb' // адрес контракта для токенсейла с балансером

const TOKEN_AMOUNT = 3; // количество токенов для отправки.
const TEZOS_AMOUNT = 2; // количество тезосов для отправки.
const TOKEN_WEIGHT = 80;
const CLOSE_DATE = "2022-01-01T00:01:30Z"
const RPC_URL = 'https://rpc.tzkt.io/hangzhou2net/'


let open_sale_json = `{ 
            "total_token_amount" : ${TOKEN_AMOUNT},
            "close_date" : "${CLOSE_DATE}",
            "token_weight" : ${TOKEN_WEIGHT},
            "total_tezos_amount" : 2,
            "token_address" : "${TOKEN_STANDART_CONTRACT}",
            "sender" : "${SENDER}"
            }`
let buy_token_json_map = `{
            "tezos_amount" : 2, 
            "token_address" : "${TOKEN_STANDART_CONTRACT}"
            }`
let caller = new FA12_Caller(RPC_URL);
caller.open_sale(open_sale_json, TOKENSALE_CONTRACT)
