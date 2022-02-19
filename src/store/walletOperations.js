const walletOperations = (state = false, action) => {
    switch (action.type) {
        case 'connected':
            return !state;
        default:
            return state;
    }
};

export default walletOperations;
