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
    Divider,
    Popper,
    FormControl
} from '@mui/material';

import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import DialogContent from '@mui/material/DialogContent';
import LinearProgress from '@mui/material/LinearProgress';

// project imports
import SkeletonTradingCard from 'ui-component/cards/Skeleton/SkeletonCard';
import store from 'store';
import MainCard from 'ui-component/cards/MainCard';
import Countdown from 'react-countdown';

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
    // consts for dialog window with loading bar
    const [disabled, setDisabled] = React.useState(false);
    const [openDialog, setOpenDialog] = React.useState(false);
    const [operationMessage, setOperationMessage] = React.useState('');
    const [progressDisabled, setProgressDisabled] = React.useState(false);
    // consts for popper with errors
    const [anchor, setAnchor] = React.useState(null);
    const [warningMessage, setWarningMessage] = React.useState('');
    const [popperVisibility, setPopperVisibility] = React.useState(false);
    // consts for token info
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

    useEffect(() => {
        /**
         *  This section updates token list.
         *  Taking fa12 and fa2 tokens and pushing them to token list
         */

        const storage = [];

        const fa12Http = new XMLHttpRequest();
        const fa2Http = new XMLHttpRequest();

        const fa12Address = fa12tokensale.address; // 'KT1DovnD5m5yZsBns4AwDK2NdZMo7PCsz2oG';
        const fa2Address = fa2tokensale.address; // 'KT1C7nJaJooKYY3E7XY2rLa1jKnQBqSx1SFQ';

        const fa12StorageUrl = `https://api.hangzhou2net.tzkt.io/v1/contracts/${fa12Address}/bigmaps/token_list/keys`;
        const fa2StorageUrl = `https://api.hangzhou2net.tzkt.io/v1/contracts/${fa2Address}/bigmaps/token_list/keys`;

        fa12Http.responseType = 'json';
        fa2Http.responseType = 'json';

        fa12Http.open('GET', fa12StorageUrl);
        fa2Http.open('GET', fa2StorageUrl);

        fa12Http.send();
        fa2Http.send();

        fa12Http.onreadystatechange = () => {
            if (fa12Http.response !== null) {
                const tokenList = fa12Http.response;
                console.log(tokenList);
                for (let i = 0; i < tokenList.length; i += 1) {
                    const token = {
                        token_weight: tokenList[i].value.weights.token_weight,
                        token_amount: tokenList[i].value.token_amount,
                        token_address: tokenList[i].value.token_address,
                        token_name: tokenList[i].value.token_name,
                        token_dec: tokenList[i].value.token_dec,
                        based_asset_weight: tokenList[i].value.weights.based_asset_weight,
                        based_asset_amount: tokenList[i].value.based_asset_amount,
                        based_asset_address: tokenList[i].value.based_asset_address,
                        based_asset_name: tokenList[i].value.based_asset_name,
                        based_asset_dec: tokenList[i].value.based_asset_dec,
                        id_fa2: null,
                        sale: tokenList[i].value.sale,
                        close_date: tokenList[i].value.close_date
                    };
                    storage.push(token);
                }
            }
        };

        fa2Http.onreadystatechange = () => {
            if (fa2Http.response !== null) {
                const tokenList = fa2Http.response;
                console.log(tokenList);
                for (let i = 0; i < tokenList.length; i += 1) {
                    const token = {
                        token_weight: tokenList[i].value.weights.token_weight,
                        token_amount: tokenList[i].value.token_amount,
                        token_address: tokenList[i].value.token_address,
                        token_name: tokenList[i].value.token_name,
                        token_dec: tokenList[i].value.token_dec,
                        based_asset_weight: tokenList[i].value.weights.based_asset_weight,
                        based_asset_amount: tokenList[i].value.based_asset_amount,
                        based_asset_address: tokenList[i].value.based_asset_address,
                        based_asset_name: tokenList[i].value.based_asset_name,
                        based_asset_dec: tokenList[i].value.based_asset_dec,
                        id_fa2: tokenList[i].value.id_fa2,
                        sale: tokenList[i].value.sale,
                        close_date: tokenList[i].value.close_date
                    };
                    storage.push(token);
                }
            }
        };

        if (values.token_address === null) {
            setValues({
                ...values
            });
        } else {
            const token = storage.filter((token) => token.token_address === values.token_address);
            setValues({
                ...values,
                token_amount: token.token_amount,
                based_asset_amount: token.based_asset_amount
            });
        }
    }, []);

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
    const popperChangeState = (currentTarget) => {
        setAnchor(currentTarget);
    };
    const popperChangeVisability = (warningText, visibility) => {
        setWarningMessage(warningText);
        setPopperVisibility(visibility);
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
    const closeDialog = () => {
        setOpenDialog(false);
    };
    const handleClick = async (event) => {
        setOperationMessage('');
        setDisabled(true);
        popperChangeState(event.currentTarget);
        popperChangeVisability('', false);
        console.log('handleClick');
        console.log(values);
        if (parseInt(values.token_amount, 10) === 0) {
            popperChangeVisability('Purchuasing amount should be positive', true);
            return;
        }
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
        const wallet = store.getState().wallet.wallet;
        if (wallet === null) {
            popperChangeVisability('Please connect your wallet', true);
            return;
        }
        const standard = await TokenStandard(values.token_address);
        console.log(standard);
        let operationHash = null;
        if (standard === 'FA1.2') {
            try {
                setOpenDialog(true);
                operationHash = await buyTokenFA12(wallet, fa12tokensale.address, values.based_asset_input, values.token_address);
            } catch (exp) {
                popperChangeVisability(exp.message, true);
                return;
            }
        } else if (standard === 'FA2') {
            try {
                setOpenDialog(true);
                operationHash = await buyTokenFA2(wallet, fa2tokensale.address, values.based_asset_input, values.token_address);
            } catch (exp) {
                setOperationMessage(exp.message);
                setDisabled(false);
                return;
            }
        } else {
            setDisabled(false);
            popperChangeVisability('Unexpected token standard: tokensale supports only FA1.2 or FA2 standards', true);
            return;
        }
        console.log(operationHash);
        setOperationMessage(`Hash of the operation: ${operationHash}`);
        setDisabled(false);
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
        if (values.token_address === null) {
            popperChangeVisability('Pick your token', true);
        } else {
            const exchangeRate = calculateExchangeRate();
            popperChangeState(event.currentTarget);
            popperChangeVisability('', false);
            if (parseInt(event.target.value, 10) <= 0) {
                popperChangeVisability('Purchasing amount should be positive', true);
                return;
            }
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
            setValues({ ...values, [prop]: event.target.value, exchange_rate: exchangeRate, token_input: calculated });
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
                    <Popper open={popperVisibility} anchorEl={anchor}>
                        <Box sx={{ border: 1, p: 1, bgcolor: 'background.paper' }}>{warningMessage}</Box>
                    </Popper>
                    <Dialog open={openDialog} aria-describedby="alert-dialog-slide-description">
                        <DialogContent>
                            <Box sx={{ p: 1.5 }}>
                                <Grid container direction="row" spacing={1}>
                                    <Grid container direction="column" justifyContent="start" alignItems="stretch" spacing={0}>
                                        <Grid item>
                                            <Typography variant="h4" align="center" sx={0}>
                                                Please, wait for the operation to be applied.
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <FormControl sx={{ m: 2, width: '42ch' }} variant="outlined">
                                                <LinearProgress />
                                            </FormControl>
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="h4" align="center" sx={0}>
                                                {operationMessage}
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <FormControl sx={{ m: 2, width: '42ch' }} variant="outlined">
                                                <Button disableElevation onClick={closeDialog} disabled={disabled}>
                                                    <Typography variant="h4">OK</Typography>
                                                </Button>
                                            </FormControl>
                                        </Grid>
                                    </Grid>
                                    <Divider />
                                </Grid>
                            </Box>
                        </DialogContent>
                    </Dialog>
                </MainCard>
            )}
        </>
    );
};

TradingCard.propTypes = {
    isLoading: PropTypes.bool
};

export default TradingCard;
