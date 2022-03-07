import PropTypes from 'prop-types';
import * as React from 'react';

// material-ui
import {
    Divider,
    Box,
    Grid,
    Select,
    FormControl,
    OutlinedInput,
    Typography,
    MenuItem,
    InputAdornment,
    FormHelperText,
    Button,
    ListItem,
    List,
    ListItemText,
    ListItemButton,
    Chip
} from '@mui/material';

// project imports
import SkeletonTradingCard from 'ui-component/cards/Skeleton/SkeletonCard';
import store from 'store';
import MainCard from 'ui-component/cards/MainCard';
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
    const [values, setValues] = React.useState({
        input: 0,
        input_token: '',
        output: 0
    });

    const handleListItemClick = (event, currentToken) => {
        setValues({ ...values, input_token: currentToken });
        console.log(values);
    };

    const handleChange = (prop) => (event) => {
        setValues({ ...values, [prop]: event.target.value });
    };

    return (
        <>
            {isLoading ? (
                <SkeletonTradingCard />
            ) : (
                <MainCard>
                    <Box sx={{ p: 1.5 }}>
                        <Grid container direction="column">
                            <Grid item sx={{ m: 1.6, width: '43ch' }}>
                                <Chip
                                    label={
                                        <Typography variant="h4" align="center" sx={0}>
                                            Buy tokens :
                                        </Typography>
                                    }
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid container direction="row" justifyContent="center" alignItems="stretch">
                                <Grid item>
                                    <Select
                                        labelId="input-token-select-label"
                                        id="input-token-select"
                                        value={values.input_token}
                                        label="Input Token"
                                        onChange={handleChange('input_token')}
                                    >
                                        {store.getState().token.tokens.map((value) => (
                                            <MenuItem key={value.token_address} value={value.token_address}>
                                                {value.token_address}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    <FormControl sx={{ width: '25ch' }} variant="outlined">
                                        <OutlinedInput
                                            id="input-token"
                                            value={values.input}
                                            onChange={handleChange('input')}
                                            endAdornment={<InputAdornment position="end">Tezos</InputAdornment>}
                                            aria-describedby="outlined-weight-helper-text"
                                            inputProps={{
                                                'aria-label': 'weight'
                                            }}
                                        />
                                        <FormHelperText id="input-token">Tezos</FormHelperText>
                                    </FormControl>
                                </Grid>
                                <Grid item>
                                    <Select
                                        labelId="input-token-select-label"
                                        id="input-token-select"
                                        value={values.input_token}
                                        label="Input Token"
                                        onChange={handleChange('input_token')}
                                    >
                                        {store.getState().token.tokens.map((value) => (
                                            <MenuItem key={value.token_address} value={value.token_address}>
                                                {value.token_address}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    <FormControl sx={{ width: '25ch' }} variant="outlined">
                                        <OutlinedInput
                                            id="input-token"
                                            value={values.input}
                                            onChange={handleChange('input')}
                                            endAdornment={<InputAdornment position="end">Token</InputAdornment>}
                                            aria-describedby="outlined-weight-helper-text"
                                            inputProps={{
                                                'aria-label': 'weight'
                                            }}
                                        />
                                        <FormHelperText id="input-token">Token</FormHelperText>
                                    </FormControl>
                                </Grid>
                            </Grid>
                            <Grid item>
                                <Box sx={{ p: 1.5 }}>
                                    <List
                                        sx={{
                                            width: '100%',
                                            maxWidth: 360,
                                            bgcolor: '#334155',
                                            position: 'relative',
                                            overflow: 'auto',
                                            maxHeight: 300,
                                            '& ul': { padding: 1 }
                                        }}
                                    >
                                        {store.getState().token.tokens.map((value) => (
                                            <ListItemButton onClick={(event) => handleListItemClick(event, value.token_address)}>
                                                <ListItem key={value.token_address} disableGutters>
                                                    <ListItemText primary={`Token : ${value.token_address}`} />
                                                </ListItem>
                                            </ListItemButton>
                                        ))}
                                    </List>
                                </Box>
                            </Grid>
                            <FormControl sx={{ m: 0.6, width: '43ch' }} variant="outlined" />
                            <Button variant="outlined" disableElevation>
                                <Typography variant="h4">Exchange Tokens</Typography>
                            </Button>
                            <FormControl />
                        </Grid>
                    </Box>
                </MainCard>
            )}
        </>
    );
};

TradingCard.propTypes = {
    isLoading: PropTypes.bool
};

export default TradingCard;
