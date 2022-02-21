import PropTypes from 'prop-types';
import * as React from 'react';

// style

import { styled } from '@mui/material/styles';

// material-ui
import {
    Box,
    Grid,
    Alert,
    AlertTitle,
    Typography,
    OutlinedInput,
    Divider,
    FormControl,
    InputAdornment,
    Button,
    Chip,
    IconButton
} from '@mui/material';

import UploadFileIcon from '@mui/icons-material/UploadFile';

// taquito imports

import { TezosToolkit } from '@taquito/taquito';
import { importKey } from '@taquito/signer';

// project imports
import SkeletonTradingCard from 'ui-component/cards/Skeleton/SkeletonCard';
import MainCard from 'ui-component/cards/MainCard';

// ==============================|| DASHBOARD - TOTAL INCOME DARK CARD ||============================== //

const WalletCard = ({ isLoading }) => {
    const Input = styled('input')({
        display: 'none'
    });

    const [values, setValues] = React.useState({
        address: '',
        balance: -1,
        tokens: -1,
        wallet: null,
        email: '',
        password: '',
        mnemonics: '',
        secret: ''
    });

    const handleChange = (prop) => (event) => {
        setValues({ ...values, [prop]: event.target.value });
    };

    const connectWallet = () => {
        const Tezos = new TezosToolkit('https://rpc.tzkt.io/hangzhou2net/');
        setValues({ ...values, wallet: Tezos });
        importKey(values.wallet, values.email, values.password, values.mnemonic.join(' '), values.secret).catch((e) => console.error(e));
        console.log(values);
    };

    return (
        <>
            {isLoading ? (
                <SkeletonTradingCard />
            ) : (
                <MainCard>
                    <Box sx={{ p: 1.5 }}>
                        <Grid container direction="row" spacing={1}>
                            <Grid container direction="row" justifyContent="start" alignItems="stretch" spacing={0}>
                                <Grid item>
                                    <Chip
                                        label={
                                            <Typography variant="h4" align="center" sx={0}>
                                                Wallet information :
                                            </Typography>
                                        }
                                        variant="outlined"
                                    />
                                    <Alert severity="info" sx={{ width: '43ch' }}>
                                        <AlertTitle>
                                            <Typography sx={{ m: 0.2 }} variant="h4">
                                                Balance : 3453 ꜩ
                                            </Typography>
                                        </AlertTitle>
                                    </Alert>
                                </Grid>
                                <Grid item>
                                    <Alert severity="info" sx={{ width: '43ch' }}>
                                        <AlertTitle>
                                            <Typography sx={{ m: 0.2 }} variant="h4">
                                                Token Balance : 34
                                            </Typography>
                                        </AlertTitle>
                                    </Alert>
                                </Grid>
                                <Grid item>
                                    <Chip
                                        label={
                                            <Typography variant="h4" align="center" sx={0}>
                                                Wallet information :
                                            </Typography>
                                        }
                                        variant="outlined"
                                    />
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
                                        <Chip
                                            label={
                                                <Typography variant="h4" align="center" sx={0}>
                                                    OR
                                                </Typography>
                                            }
                                            variant="outlined"
                                        />
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
                                        <Button variant="outlined" disableElevation onClick={connectWallet}>
                                            <Typography variant="h4">Connect Wallet</Typography>
                                        </Button>
                                    </FormControl>
                                </Grid>
                            </Grid>
                            <Divider />
                        </Grid>
                    </Box>
                </MainCard>
            )}
        </>
    );
};

WalletCard.propTypes = {
    isLoading: PropTypes.bool
};

export default WalletCard;
