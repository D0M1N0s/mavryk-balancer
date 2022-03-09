import PropTypes from 'prop-types';
import * as React from 'react';

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

// ===========================|| DASHBOARD DEFAULT - EARNING CARD ||=========================== //

const C_PRECISION = 10 ** 10;
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
        token_amount: store.getState().tokens[0].token_amount,
        token_weight: store.getState().tokens[0].token_weight,
        token_address: store.getState().tokens[0].token_address,
        token_name: store.getState().tokens[0].token_name,
        based_asset_input: 0,
        based_asset_amount: store.getState().tokens[0].based_asset_amount,
        based_asset_weight: store.getState().tokens[0].based_asset_weight,
        based_asset_address: store.getState().tokens[0].based_asset_name,
        based_asset_name: store.getState().tokens[0].based_asset_name,
        close_date: store.getState().tokens[0].close_date
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

    const handleClick = () => {
        console.log(
            GetTokenAmount(
                values.token_amount,
                values.based_asset_amount,
                values.token_input,
                values.token_weight,
                values.based_asset_weight
            )
        );
    };

    const handleListItemClick = (event, currentToken) => {
        console.log(currentToken);
        const token = store.getState().tokens.filter((token) => token.token_address === currentToken);
        setValues({
            ...values,
            token_weight: token[0].token_weight,
            token_address: token[0].token_address,
            token_name: token[0].token_name,
            based_asset_weight: token[0].based_asset_weight,
            based_asset_address: token[0].based_asset_address,
            based_asset_name: token[0].based_asset_name,
            close_date: token[0].close_date
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
        if (prop === 'input_token_address') {
            const token = store.getState().tokens.filter((token) => token.token_address === event.target.value);
            setValues({
                ...values,
                token_address: event.target.value,
                token_name: token[0].token_name,
                close_date: token[0].close_date
            });
        } else {
            const token = store.getState().tokens.filter((token) => token.token_address === values.input_token_address);
            setValues({ ...values, [prop]: event.target.value });
        }
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
                                    value={values.token_input}
                                    onChange={handleChange('token_input')}
                                    endAdornment={
                                        <InputAdornment position="start">
                                            <Chip
                                                icon={<ChangeCircleIcon />}
                                                label={
                                                    <Typography variant="h4" align="center">
                                                        Tezos
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
                                            XTZ / {values.token_name} exchange rate : 3.4
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
                                    value={values.based_asset_input}
                                    onChange={handleChange('based_asset_input')}
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
