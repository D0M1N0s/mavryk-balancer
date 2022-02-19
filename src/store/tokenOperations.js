export const contractState = {
    tokens: [
        {
            address: null,
            close_date: null,
            weights: null,
            total_token_amount: null,
            total_tezos_amount: null,
            token_sale_is_open: null
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
                    address: null,
                    close_date: null,
                    weights: null,
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
                    address: null,
                    close_date: null,
                    weights: null,
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
