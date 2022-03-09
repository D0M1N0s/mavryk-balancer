export const saleState = {
    sender: '',
    token_address: 'first_address',
    close_date: new Date('2014-08-18T21:11:54'),
    input_weight: 38,
    output_weight: 62,
    total_token_amount: 23,
    total_tezos_amount: 4,
    token_sale_is_open: true
};

const saleOperations = (state = saleState, action) => {
    switch (action.type) {
        case 'changeToken':
            return {
                ...state,
                tezos: action.payload.tezos,
                wallet: action.payload.wallet,
                address: action.payload.address,
                balance: action.payload.balance,
                connected: true
            };
        case 'changeTokenWeight':
            return {
                ...state,
                input_weight: action.payload.input_weight,
                output_weight: action.payload.output_weight
            };
        default:
            return {
                ...state
            };
    }
};

export default saleOperations;
