import { FA12_Caller } from './fa12_caller_module'

const TOKEN_STANDART_CONTRACT = 'KT1LDjRzueHme3nDQGC9irB7MtWDVstm3ebC' // адрес опубликованного контракта стандарта токена
const SENDER = 'tz1MtDKdcXrk4s9aMA73uVjCSFpd1WEqRM2H' // публичный адрес отправителя (эмитента)
const TOKENSALE_CONTRACT = 'KT1PqZsey9vN7C6HwLjDuGnZcqdRCvqvZS7e' // адрес контракта для токенсейла с балансером
const RPC_URL = 'https://rpc.tzkt.io/hangzhou2net/'

const TOKEN_AMOUNT = 20; // количество токенов для отправки.
const TEZOS_AMOUNT = 10; // количество тезосов для отправки.
const TOKEN_WEIGHT = 0.8;
const CLOSE_DATE = "2022-01-01T00:01:30Z"


let open_sale_json = `{ 
            "total_token_amount" : ${TOKEN_AMOUNT},
            "close_date" : "${CLOSE_DATE}",
            "token_weight" : ${TOKEN_WEIGHT},
            "total_tezos_amount" : ${TEZOS_AMOUNT},
            "token_address" : "${TOKEN_STANDART_CONTRACT}",
            "sender" : "${SENDER}"
            }`
        // 2.8 tez gives 1 tok -> 7.6 tez gives 2 toks
let buy_token_json_map = `{
            "tezos_amount" : 2.8, 
            "token_address" : "${TOKEN_STANDART_CONTRACT}"
            }`

let caller = new FA12_Caller(RPC_URL);

caller.open_sale(open_sale_json, TOKENSALE_CONTRACT).then(() => {
    return caller.buy_token(buy_token_json_map, TOKENSALE_CONTRACT);
});
// caller.close_sale(TOKENSALE_CONTRACT, TOKEN_STANDART_CONTRACT)
// caller.transfer_tokens(TOKEN_STANDART_CONTRACT, SENDER, TOKENSALE_CONTRACT, 10)