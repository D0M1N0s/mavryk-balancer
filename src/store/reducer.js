import tokenOperations from './tokenOperations';
import walletOperations from './walletOperations';
import customizationReducer from './customizationReducer';
import saleOperations from './saleOperations';
import buyOperations from './buyOperations';

import { combineReducers } from 'redux';

const reducer = combineReducers({
    tokens: tokenOperations,
    wallet: walletOperations,
    sale: saleOperations,
    buy: buyOperations,
    customization: customizationReducer
});

export default reducer;
