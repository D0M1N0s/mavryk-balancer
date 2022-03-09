export const tokenState = [
    {
        token_weight: 50,
        token_amount: 15384,
        token_address: 'first_address',
        token_name: 'ETH',
        based_asset_weight: 50,
        based_asset_amount: 15384,
        based_asset_address: 'first_asset_address',
        based_asset_name: 'first_asset_name',
        sale: true,
        close_date: new Date('2024-08-18T21:11:54')
    },
    {
        token_weight: 38,
        token_amount: 23,
        token_address: 'second_address',
        token_name: 'BTC',
        based_asset_weight: 62,
        based_asset_amount: 4,
        based_asset_address: 'second_asset_address',
        based_asset_name: 'second_asset_name',
        sale: true,
        close_date: new Date('2025-08-18T21:11:54')
    },
    {
        token_weight: 38,
        token_amount: 23,
        token_address: 'third_address',
        token_name: 'DCL',
        based_asset_weight: 62,
        based_asset_amount: 4,
        based_asset_address: 'third_asset_address',
        based_asset_name: 'third_asset_name',
        sale: true,
        close_date: new Date('2026-08-18T21:11:54')
    },
    {
        token_weight: 38,
        token_amount: 23,
        token_address: 'fourth_address',
        token_name: 'BTC',
        based_asset_weight: 62,
        based_asset_amount: 4,
        based_asset_address: 'fourth_asset_address',
        based_asset_name: 'fourth_asset_name',
        sale: true,
        close_date: new Date('2027-08-18T21:11:54')
    },
    {
        token_weight: 38,
        token_amount: 23,
        token_address: 'fifth_address',
        token_name: 'BTC',
        based_asset_weight: 62,
        based_asset_amount: 4,
        based_asset_address: 'fifth_asset_address',
        based_asset_name: 'fifth_asset_name',
        sale: true,
        close_date: new Date('2028-08-18T21:11:54')
    },
    {
        token_weight: 38,
        token_amount: 23,
        token_address: 'sixth_address',
        token_name: 'BTC',
        based_asset_weight: 62,
        based_asset_amount: 4,
        based_asset_address: 'sixth_asset_address',
        based_asset_name: 'sixth_asset_name',
        sale: true,
        close_date: new Date('2029-08-18T21:11:54')
    }
];

const tokenOperations = (state = tokenState, action) => {
    switch (action.type) {
        case 'openSale':
            return [
                ...state,
                {
                    token_weight: action.payload.token_weight,
                    token_amount: action.payload.token_amount,
                    token_address: action.payload.token_address,
                    token_name: action.payload.name,
                    based_asset_weight: action.payload.based_asset_weight,
                    based_asset_amount: action.payload.based_asset_amount,
                    based_asset_address: action.payload.based_asset_address,
                    based_asset_name: action.payload.based_asset_name,
                    sale: true,
                    close_date: action.payload.close_date
                }
            ];
        default:
            return state;
    }
};

export default tokenOperations;
