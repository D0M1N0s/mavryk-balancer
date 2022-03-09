import * as React from 'react';

// mui imports
import { Grid, Typography, Divider, FormControl, Button } from '@mui/material';

// taquito imports
import { TezosToolkit } from '@taquito/taquito';
<<<<<<< HEAD
=======
import { importKey } from '@taquito/signer';
>>>>>>> baecfaddc571033d735e96643d6e091b81a92aef
import { BeaconWallet } from '@taquito/beacon-wallet';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import store from 'store';

<<<<<<< HEAD
export default function AlertDialogSlide() {
    const Tezos = new TezosToolkit('https://rpc.tzkt.io/hangzhou2net/');
=======
const Transition = React.forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);
const Tezos = new TezosToolkit('https://rpc.tzkt.io/hangzhou2net/');

export default function AlertDialogSlide() {
    const Input = styled('input')({
        display: 'none'
    });
    // const updateBalance = async () => {
    // };
>>>>>>> baecfaddc571033d735e96643d6e091b81a92aef

    const [values, setValues] = React.useState({
        tezos: null,
        wallet: null,
        address: '',
        balance: ''
    });

<<<<<<< HEAD
=======
    const handleChange = (prop) => (event) => {
        setValues({ ...values, [prop]: event.target.value });
    };
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

>>>>>>> baecfaddc571033d735e96643d6e091b81a92aef
    const connectWallet = async () => {
        const options = {
            name: 'TokensaleWallet'
        };
        try {
<<<<<<< HEAD
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
=======
            const wallet = new BeaconWallet(options);
            await wallet.requestPermissions({ network: { type: 'hangzhounet' } });
            await Tezos.setWalletProvider(wallet);
            values.wallet = wallet;
            values.address = await wallet.getPKH();
            console.log(wallet);
        } catch (exeption) {
            console.log(exeption);
        }
>>>>>>> baecfaddc571033d735e96643d6e091b81a92aef
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
                            <Typography noWrap variant="h4" align="end" sx={{ width: '10ch' }}>
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
<<<<<<< HEAD
=======
            <Dialog
                open={open}
                TransitionComponent={Transition}
                keepMounted
                onClose={handleClose}
                aria-describedby="alert-dialog-slide-description"
            >
                {/* <DialogContent>
                    <Box sx={{ p: 1.5 }}>
                        <Grid container direction="row" spacing={1}>
                            <Grid container direction="column" justifyContent="start" alignItems="stretch" spacing={0}>
                                <Grid item>
                                    <Typography variant="h4" align="center" sx={0}>
                                        Connect your wallet :
                                    </Typography>
                                </Grid>
                                <Grid item>
                                    <FormControl sx={{ m: 1, width: '43ch' }} variant="outlined">
                                        <OutlinedInput
                                            id="outlined-adornment-token"
                                            type="string"
                                            value={values.token_amount}
                                            onChange={handleChange('email')}
                                            startAdornment={<InputAdornment position="start">Enter email :</InputAdornment>}
                                            inputProps={{
                                                'aria-label': 'email'
                                            }}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item>
                                    <FormControl sx={{ m: 1, width: '43ch' }} variant="outlined">
                                        <OutlinedInput
                                            id="outlined-adornment-token"
                                            type="string"
                                            value={values.password}
                                            onChange={handleChange('password')}
                                            startAdornment={<InputAdornment position="start">Enter password :</InputAdornment>}
                                            inputProps={{
                                                'aria-label': 'password'
                                            }}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item>
                                    <FormControl sx={{ m: 1, width: '43ch' }} variant="outlined">
                                        <OutlinedInput
                                            id="outlined-adornment-tezos"
                                            type="string"
                                            value={values.mnemonics}
                                            onChange={handleChange('mnemonics')}
                                            startAdornment={<InputAdornment position="start">Enter mnemonics :</InputAdornment>}
                                            inputProps={{
                                                'aria-label': 'mnemonics'
                                            }}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item>
                                    <FormControl sx={{ m: 1, width: '43ch' }} variant="outlined">
                                        <OutlinedInput
                                            id="outlined-adornment-token"
                                            type="string"
                                            value={values.secret}
                                            onChange={handleChange('secret')}
                                            startAdornment={<InputAdornment position="start">Enter secret key :</InputAdornment>}
                                            inputProps={{
                                                'aria-label': 'secret'
                                            }}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item justifyContent="center">
                                    <FormControl sx={{ m: 1, width: '42ch' }} variant="outlined">
                                        <Divider>
                                            <Chip
                                                label={
                                                    <Typography variant="h4" align="center" sx={0}>
                                                        OR
                                                    </Typography>
                                                }
                                                variant="outlined"
                                            />
                                        </Divider>
                                    </FormControl>
                                </Grid>
                                <Grid item>
                                    <FormControl sx={{ m: 1, width: '42ch' }} variant="outlined">
                                        <Input accept="image/*" id="icon-button-file" type="file" />
                                        <IconButton color="primary" aria-label="upload picture" component="span">
                                            <UploadFileIcon />
                                        </IconButton>
                                    </FormControl>
                                </Grid>
                                <Grid item>
                                    <FormControl sx={{ m: 2, width: '42ch' }} variant="outlined">
                                        <Button disableElevation onClick={connectWallet}>
                                            <Typography variant="h4">Connect Wallet</Typography>
                                        </Button>
                                    </FormControl>
                                </Grid>
                            </Grid>
                            <Divider />
                        </Grid>
                    </Box>
                </DialogContent> */}
            </Dialog>
>>>>>>> baecfaddc571033d735e96643d6e091b81a92aef
        </MainCard>
    );
}
