### This folder contains tests for tokensale smart contracts in Hangzhou2net

The tests for contracts are similar:
- Test to throw an error if a token sale for an existing token is opened for the second time
- Test to throw an error if a token sale for an existing token is closed for the second time
- Test for the correctness of buying a token
- Test for throwing an error in case of opening a token sale for a non-existent token
- Test for issuing an error in case of buying a token without an open token sale
- Test for throwing an error in case of attemption to buy token after tokensale closure
- Test for correct automated maker work