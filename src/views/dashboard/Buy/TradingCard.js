import PropTypes from 'prop-types';
import * as React from 'react';
import { useEffect } from 'react';
import fa12tokensale from '../../../json_files/fa12-latest.json';
import fa2tokensale from '../../../json_files/fa2-latest.json';

// material-ui
import {
    Box,
    Grid,
    OutlinedInput,
    Typography,
    InputAdornment,
    Button,
    ListItem,
    List,
    ListItemText,
    ListItemButton,
    Chip,
    Dialog,
    Divider
} from '@mui/material';

import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';

// project imports
import SkeletonTradingCard from 'ui-component/cards/Skeleton/SkeletonCard';
import store from 'store';
import MainCard from 'ui-component/cards/MainCard';
import Countdown from 'react-countdown';
import { TezosToolkit } from '@taquito/taquito';

import { buyTokenFA12, buyTokenFA2, TokenStandard } from './BuyTokenWrappers';
// ===========================|| DASHBOARD DEFAULT - EARNING CARD ||=========================== //

const C_PRECISION = 10 ** 10;

function ToFloat(value) {
    return Math.floor(value * C_PRECISION);
}
function Mul(a, b) {
    return Math.floor((a * b) / C_PRECISION);
}
function Div(a, b) {
    return Math.floor((a * C_PRECISION) / b);
}
function PowFloatIntoNat(a, power) {
    if (power === 0) {
        return C_PRECISION;
    }
    const root = PowFloatIntoNat(a, Math.floor(power / 2));
    let result = Mul(root, root);
    if (power % 2 === 1) {
        result = Mul(a, result);
    }
    return result;
}
function ApproxPowFloat(base, alpha, steps = 2000) {
    let term = 1 * C_PRECISION;
    let res = 0;
    for (let n = 1; n <= steps; n += 1) {
        res += term;
        let m = Mul(alpha - (n - 1) * C_PRECISION, base - 1 * C_PRECISION);
        m = Div(m, n * C_PRECISION);
        term = Mul(term, m);
    }
    return res;
}

function PowFloats(a, power) {
    const mul1 = PowFloatIntoNat(a, power / C_PRECISION);
    const mul2 = ApproxPowFloat(a, power % C_PRECISION);
    const res = Mul(mul1, mul2);
    return res;
}
// Dublicates the AMM algo
// Returns the recieved by user amount of tokens multiplyed by C_PRECISION
// To get "normal" delta need to use FromFloatToNumber with necessary decimals of issuer's token
function GetTokenAmount(reserveTokenI, reserveTokenO, deltaTokenI, weightI, weightO) {
    if (deltaTokenI === 0) {
        return 0;
    }
    const fraction = Div(reserveTokenI, reserveTokenI + deltaTokenI);
    const power = Div(weightI, weightO);
    const fractionRoot = PowFloats(fraction, power);
    const subRes = 1 * C_PRECISION - fractionRoot;
    const deltaTokenO = Mul(reserveTokenO, subRes);
    return deltaTokenO;
}
function FromFloatToNumber(value, decimals) {
    const multiplyer = 10 ** decimals;
    const num = Math.floor((multiplyer * value) / C_PRECISION);
    return num / multiplyer;
}

const TradingCard = ({ isLoading }) => {
    const [open, setOpen] = React.useState(false);
    const [values, setValues] = React.useState({
        token_input: 0,
        token_amount: 0,
        token_weight: 0,
        token_address: null,
        token_name: null,
        based_asset_input: 0,
        based_asset_amount: 0,
        based_asset_weight: 0,
        based_asset_address: null,
        based_asset_name: null,
        close_date: null,
        exchange_rate: 'N/A'
    });

    const Completionist = () => <span>The tokensale is over!</span>;
    const remainingTime = values.close_date - Date.now();

    const renderer = ({ days, hours, minutes, seconds, completed }) => {
        if (completed) {
            // Render a completed state
            return <Completionist />;
        }
        // Render a countdown
        return (
            <span>
                {days} D {hours} H {minutes} M {seconds} S
            </span>
        );
    };

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const calculateExchangeRate = () => {
        const exchangeRate = FromFloatToNumber(
            GetTokenAmount(
                parseInt(values.based_asset_amount, 10),
                parseInt(values.token_amount, 10),
                ToFloat(1),
                parseInt(values.based_asset_weight, 10),
                parseInt(values.token_weight, 10)
            ),
            parseInt(values.token_dec, 10)
        );
        return exchangeRate;
    };
    const handleClick = async () => {
        console.log('handleClick');
        console.log(values);
        const calculated = GetTokenAmount(
            parseInt(values.based_asset_amount, 10),
            parseInt(values.token_amount, 10),
            ToFloat(values.based_asset_input),
            parseInt(values.based_asset_weight, 10),
            parseInt(values.token_weight, 10)
        );
        const final = FromFloatToNumber(calculated, 20);
        console.log('input:', values.based_asset_input);
        console.log('output:', final);
        const standard = await TokenStandard(values.token_address);
        console.log(standard);
        const wallet = store.getState().wallet.wallet;
        let operationHash = null;
        if (standard === 'FA1.2') {
            operationHash = await buyTokenFA12(wallet, fa12tokensale.address, values.based_asset_input, values.token_address);
        } else if (standard === 'FA2') {
            operationHash = await buyTokenFA2(wallet, fa2tokensale.address, values.based_asset_input, values.token_address);
        } else {
            // alert
        }
        console.log(operationHash);
        // also need to fetch from contract new storage state
    };

    const handleListItemClick = (event, currentToken) => {
        const token = store.getState().tokens.filter((token) => token.token_address === currentToken);
        setValues({
            ...values,
            token_input: 0,
            token_amount: token[0].token_amount,
            token_weight: token[0].token_weight,
            token_address: token[0].token_address,
            token_name: token[0].token_name,
            based_asset_input: 0,
            based_asset_amount: token[0].based_asset_amount,
            based_asset_weight: token[0].based_asset_weight,
            based_asset_address: token[0].based_asset_address,
            based_asset_name: token[0].based_asset_name,
            close_date: token[0].close_date,
            token_dec: token[0].token_dec,
            based_asset_dec: token[0].based_asset_dec
        });
        store.dispatch({
            type: 'setToken',
            payload: {
                token: currentToken
            }
        });
        handleClose();
    };

    const handleChange = (prop) => (event) => {
        const calculated = FromFloatToNumber(
            GetTokenAmount(
                parseInt(values.based_asset_amount, 10),
                parseInt(values.token_amount, 10),
                ToFloat(event.target.value),
                parseInt(values.based_asset_weight, 10),
                parseInt(values.token_weight, 10)
            ),
            parseInt(values.token_dec, 10)
        );
        setValues({ ...values, [prop]: event.target.value, token_input: calculated });
    };
    return (
        <>
            {isLoading ? (
                <SkeletonTradingCard />
            ) : (
                <MainCard>
                    <Grid container direction="column" sx={{ width: '100%' }} spacing={1}>
                        <Grid container direction="row" justifyContent="space-between" alignItems="stretch" sx={{ width: '100%' }}>
                            <Grid item sx={{ m: 1 }}>
                                <Typography variant="h4" align="center">
                                    Buy tokens :
                                </Typography>
                            </Grid>
                            <Grid item sx={{ m: 1 }}>
                                <Typography variant="h4">
                                    <Countdown date={Date.now() + remainingTime} renderer={renderer} />
                                </Typography>
                            </Grid>
                        </Grid>
                        <Grid item sx={{ width: '100%' }}>
                            <Divider dark sx={{ m: 2 }} />
                        </Grid>
                        <Grid container direction="row" justifyContent="center" alignItems="stretch" sx={{ width: '100%' }}>
                            <Grid item sx={{ m: 1, width: '100%' }}>
                                <OutlinedInput
                                    sx={{ width: '100%' }}
                                    id="input-token"
                                    type="number"
                                    value={values.based_asset_input}
                                    onChange={handleChange('based_asset_input')}
                                    endAdornment={
                                        <InputAdornment position="start">
                                            <Chip
                                                label={
                                                    <Typography variant="h4" align="center">
                                                        {values.based_asset_name}
                                                    </Typography>
                                                }
                                                variant="outlined"
                                                sx={{ m: 1, width: '100%' }}
                                            />
                                        </InputAdornment>
                                    }
                                    aria-describedby="outlined-weight-helper-text"
                                    inputProps={{
                                        'aria-label': 'weight'
                                    }}
                                />
                            </Grid>
                        </Grid>
                        <Grid item sx={{ width: '100%' }}>
                            <Divider dark sx={{ m: 1 }}>
                                <Chip
                                    label={
                                        <Typography variant="h4" align="center">
                                            XTZ / {values.token_name} exchange rate : {values.exchange_rate}
                                        </Typography>
                                    }
                                    variant="outlined"
                                />
                            </Divider>
                        </Grid>
                        <Grid container direction="row" justifyContent="center" alignItems="stretch" sx={{ width: '100%' }}>
                            <Grid item sx={{ m: 1, width: '100%' }}>
                                <OutlinedInput
                                    disabled
                                    sx={{ width: '100%' }}
                                    id="input-token"
                                    value={values.token_input}
                                    onChange={handleChange('token_input')}
                                    endAdornment={
                                        <InputAdornment
                                            position="end"
                                            sx={{
                                                borderRadius: '80%',
                                                bgcolor: '#334155'
                                            }}
                                        >
                                            <Chip
                                                icon={<ChangeCircleIcon />}
                                                label={
                                                    <Typography variant="h4" align="center">
                                                        {values.token_name}
                                                    </Typography>
                                                }
                                                onClick={handleClickOpen}
                                                variant="outlined"
                                                sx={{ m: 1, width: '100%' }}
                                            />
                                            <Dialog onClose={handleClose} open={open}>
                                                <MainCard>
                                                    <Box sx={{ p: 1.5, width: '100%' }}>
                                                        <Grid
                                                            container
                                                            direction="column"
                                                            justifyContent="center"
                                                            alignItems="stretch"
                                                            sx={{ width: '100%' }}
                                                        >
                                                            <Grid item sx={{ width: '100%' }}>
                                                                <List
                                                                    sx={{
                                                                        width: '100%',
                                                                        bgcolor: '#334155',
                                                                        position: 'relative',
                                                                        overflow: 'auto',
                                                                        borderRadius: 2,
                                                                        maxHeight: '30.3ch'
                                                                    }}
                                                                >
                                                                    {store.getState().tokens.map((value) => (
                                                                        <ListItemButton
                                                                            onClick={(event) =>
                                                                                handleListItemClick(event, value.token_address)
                                                                            }
                                                                        >
                                                                            <ListItem key={value.token_address} disableGutters>
                                                                                <ListItemText primary={`Token : ${value.token_name}`} />
                                                                            </ListItem>
                                                                        </ListItemButton>
                                                                    ))}
                                                                </List>
                                                            </Grid>
                                                        </Grid>
                                                    </Box>
                                                </MainCard>
                                            </Dialog>
                                        </InputAdornment>
                                    }
                                    aria-describedby="outlined-weight-helper-text"
                                    inputProps={{
                                        'aria-label': 'weight'
                                    }}
                                />
                            </Grid>
                        </Grid>
                        <Grid item sx={{ width: '100%' }}>
                            <Button variant="outlined" sx={{ width: '100%' }} onClick={handleClick} disableElevation>
                                <Typography variant="h4">Exchange Tokens</Typography>
                            </Button>
                        </Grid>
                    </Grid>
                </MainCard>
            )}
        </>
    );
};

TradingCard.propTypes = {
    isLoading: PropTypes.bool
};

export default TradingCard;
