### This folder contains smart contracts for tokensale of FA1.2 and FA2 tokens.

Each smart-contract has three entrypoints:
- OpenSale
- BuyToken
- CloseSale

At the OpenSale entrypoint the new token and the necessary information are added to the contract storage.

At the BuyToken entrypoint an exchange takes place between Tezos base asset/XTZ and issuer token. The amount of outcome token is calculated via automated market maker.

At CloseSale the the tokensale becomes closed and the token is removed from the list of selling tokens.