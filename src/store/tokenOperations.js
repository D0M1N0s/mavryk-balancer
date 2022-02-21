export const contractState = {
    tokens: [
        {
            token_address: 'first_address',
            close_date: new Date('2014-08-18T21:11:54'),
            input_weight: 38,
            output_weight: 62,
            total_token_amount: 23,
            total_tezos_amount: 4,
            token_sale_is_open: true
        },
        {
            token_address: 'second_address',
            close_date: new Date('2014-08-18T21:11:54'),
            input_weight: 38,
            output_weight: 62,
            total_token_amount: 23,
            total_tezos_amount: 4,
            token_sale_is_open: true
        },
        {
            token_address: 'third_address',
            close_date: new Date('2014-08-18T21:11:54'),
            input_weight: 38,
            output_weight: 62,
            total_token_amount: 23,
            total_tezos_amount: 4,
            token_sale_is_open: true
        },
        {
            token_address: 'fourth_address',
            close_date: new Date('2014-08-18T21:11:54'),
            input_weight: 38,
            output_weight: 62,
            total_token_amount: 23,
            total_tezos_amount: 4,
            token_sale_is_open: true
        }
    ],
    wallet: {
        email: null,
        password: null,
        mnemonic: null
    }
};

const tokenOperations = (state = contractState, action) => {
    switch (action.type) {
        case 'connectWallet':
            console.log(action.payload);
            return [
                ...state,
                {
                    token_address: null,
                    close_date: null,
                    input_weight: 38,
                    output_weight: 62,
                    total_token_amount: null,
                    total_tezos_amount: null,
                    token_sale_is_open: null
                }
            ];
        case 'openSale':
            // update state
            console.log(action.payload);
            return [
                ...state,
                {
                    token_address: null,
                    close_date: null,
                    input_weight: 38,
                    output_weight: 62,
                    total_token_amount: null,
                    total_tezos_amount: null,
                    token_sale_is_open: null
                }
            ];
        case 'buyToken':
            // update state
            console.log(action.payload);
            return state;
        default:
            return state;
    }
};

export default tokenOperations;
