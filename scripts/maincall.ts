import { FA12_Caller } from './caller_module'

const RPC_URL = 'https://rpc.tzkt.io/hangzhou2net/'
const CONTRACT = 'KT1Pbmd9czwAP2eFhriQdWLFMwkAGPSUyRTu' //адрес контракта с балансером
const RECEIVER = 'tz1MtDKdcXrk4s9aMA73uVjCSFpd1WEqRM2H'

let json_map = `{ 
            "total_tezos_amount": 12, 
            "total_token_amount" : 2,
            "close_date" : "2022-01-01T00:01:30Z",
            "token_weight" : 80
            }`

new FA12_Caller(RPC_URL).open_sale(json_map, CONTRACT)