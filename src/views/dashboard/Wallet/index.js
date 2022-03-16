import * as React from 'react';

// mui imports
import { Grid, Typography, Divider, FormControl, Button } from '@mui/material';

// taquito imports
import { TezosToolkit } from '@taquito/taquito';
import { BeaconWallet } from '@taquito/beacon-wallet';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import store from 'store';

const Tezos = new TezosToolkit('https://rpc.tzkt.io/hangzhou2net/');

export default function AlertDialogSlide() {
    const [values, setValues] = React.useState({
        tezos: null,
        wallet: null,
        address: '',
        balance: ''
    });

    const connectWallet = async () => {
        const options = {
            name: 'TokensaleWallet'
        };
        try {
            const Wallet = new BeaconWallet(options);
            await Promise.resolve(Wallet.requestPermissions({ network: { type: 'hangzhounet' } }));
            await Promise.resolve(Tezos.setWalletProvider(Wallet));
            const walletAddress = await Promise.resolve(Wallet.getPKH());
            const walletBalance = await Promise.resolve(Tezos.tz.getBalance(walletAddress));
            const walletBalanceNumber = walletBalance.toNumber() / 1000000;
            setValues({ tezos: Tezos, wallet: Wallet, address: walletAddress, balance: walletBalanceNumber });
            store.dispatch({
                type: 'connected',
                payload: {
                    tezos: Tezos,
                    wallet: Wallet,
                    address: walletAddress,
                    balance: walletBalanceNumber
                }
            });
        } catch (exeption) {
            console.log(exeption);
        }
        console.log(values);
        console.log(store.getState().tokens);
    };

    return (
        <MainCard>
            <Grid container direction="column" justifyContent="start" alignItems="stretch" spacing={1}>
                <Grid item>
                    <Grid container direction="row" justifyContent="space-between" alignItems="center">
                        <Grid item>
                            <Typography variant="h4" align="start" sx={0}>
                                Wallet address :
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Typography noWrap variant="h4" align="start" sx={{ width: '10ch' }}>
                                {values.address}
                            </Typography>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item>
                    <Grid container direction="row" justifyContent="space-between" alignItems="center">
                        <Grid item>
                            <Typography variant="h4" align="start" sx={0}>
                                Balance :
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Typography noWrap variant="h4" align="end" sx={{ width: '12ch' }}>
                                {values.balance}
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Typography noWrap variant="h4" align="end" sx={0}>
                                - XTZ
                            </Typography>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item>
                    <Divider dark />
                </Grid>
                <Grid item>
                    <FormControl sx={{ width: '100%' }} variant="outlined">
                        <Button variant="outlined" disableElevation onClick={connectWallet}>
                            <Typography variant="h4">Connect Wallet</Typography>
                        </Button>
                    </FormControl>
                </Grid>
            </Grid>
        </MainCard>
    );
}
