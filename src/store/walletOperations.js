export const walletState = {
    tezos: null,
    wallet: null,
    address: '',
    balance: '',
    connected: false
};

const walletOperations = (state = walletState, action) => {
    switch (action.type) {
        case 'connected':
            return {
                ...state,
                tezos: action.payload.tezos,
                wallet: action.payload.wallet,
                address: action.payload.address,
                balance: action.payload.balance,
                connected: true
            };
        default:
            return {
                ...state
            };
    }
};

export default walletOperations;
