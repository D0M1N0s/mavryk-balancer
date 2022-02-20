import tokenOperations from './tokenOperations';
import walletOperations from './walletOperations';
import customizationReducer from './customizationReducer';
import { combineReducers } from 'redux';

const reducer = combineReducers({
    token: tokenOperations,
    wallet: walletOperations,
    customization: customizationReducer
});

export default reducer;
