export function connectWallet(email, password, mnemonics) {
    return {
        type: 'connectWallet',
        payload: {
            email,
            password,
            mnemonics
        }
    };
}

export function openSale(address, closeDate, weights, totalTokenAmount, totalTezosAmount, tokenSaleIsOpen) {
    return {
        type: 'openSale',
        payload: {
            address,
            closeDate,
            weights,
            totalTokenAmount,
            totalTezosAmount,
            tokenSaleIsOpen
        }
    };
}

export function buyToken(tezosAmount, tokenAddress) {
    return {
        type: 'buyToken',
        payload: {
            tezosAmount,
            tokenAddress
        }
    };
}

export function walletConnected() {
    return {
        type: 'connected'
    };
}
