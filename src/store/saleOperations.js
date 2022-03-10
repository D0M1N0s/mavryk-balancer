export const saleState = {
    token_address: null,
    token_name: null,
    token_amount: null,
    based_asset_address: null,
    based_asset_name: null,
    based_asset_amount: null,
    close_date: null,
    input_weight: null,
    output_weight: null,
    token_dec: null,
    fa2: null,
    token_sale_is_open: null
};

const saleOperations = (state = saleState, action) => {
    switch (action.type) {
        case 'changeToken':
            return {
                ...state,
                ...action.payload
            };
        case 'changeTokenWeight':
            return {
                ...state,
                ...action.payload
            };
        case 'specifyToken':
            return {
                ...state,
                ...action.payload
            };
        default:
            return {
                ...state
            };
    }
};

export default saleOperations;
