export const buyState = {
    token: null
};

const buyOperations = (state = buyState, action) => {
    switch (action.type) {
        case 'setToken':
            return {
                token: action.payload.token
            };
        default:
            return {
                ...state
            };
    }
};

export default buyOperations;
