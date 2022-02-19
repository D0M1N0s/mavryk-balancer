import tokenOperations from './tokenOperations';
import walletOperations from './walletOperations';
import { combineReducers } from 'redux';

const reducer = combineReducers({
    token: tokenOperations,
    wallet: walletOperations
});

export default reducer;
