import { FA12_Caller } from './fa12_caller_module'

const RPC_URL_ = 'https://rpc.tzkt.io/hangzhou2net/'
const TOKEN_STANDART_CONTRACT = 'KT1LDjRzueHme3nDQGC9irB7MtWDVstm3ebC' //адрес опубликованного контракта стандарта токена
const SENDER_ = 'tz1MtDKdcXrk4s9aMA73uVjCSFpd1WEqRM2H' //публичный адрес отправителя (эмитента)
const TOKEN_AMOUNT = 1 //количество токенов для отправки.


const RPC_URL = 'https://rpc.tzkt.io/hangzhou2net/'
const TOKENSALE_CONTRACT = 'KT1GZ8uDosenty4zLaywBYbsj7UvicuSEqEb' //адрес контракта для токенсейла с балансером


let open_sale_json_map = `{ 
            "total_token_amount" : 5,
            "close_date" : "2022-01-01T00:01:30Z",
            "token_weight" : 80,
            "total_tezos_amount" : 2,
            "token_address" : "${TOKEN_STANDART_CONTRACT}",
            "sender" : "${SENDER_}",
            "tokensale_contract" : "${TOKENSALE_CONTRACT}"
            }`
let buy_token_json_map = `{
            "tezos_amount" : 2, 
            "token_address" : "${TOKEN_STANDART_CONTRACT}"
            }`
let caller = new FA12_Caller(RPC_URL);
// todo: to make contract calls async, currently it goes parallel so one operation out of two (three) fails

caller.open_sale(open_sale_json_map, TOKENSALE_CONTRACT)



