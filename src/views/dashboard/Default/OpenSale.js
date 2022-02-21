import PropTypes from 'prop-types';
import * as React from 'react';

// material-ui
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import DateTimePicker from '@mui/lab/DateTimePicker';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';

import {
    Divider,
    Box,
    Grid,
    FormControl,
    OutlinedInput,
    Typography,
    TextField,
    InputAdornment,
    FormHelperText,
    Button,
    Chip
} from '@mui/material';

// project imports
import SkeletonTradingCard from 'ui-component/cards/Skeleton/SkeletonCard';
import store from 'store';
import MainCard from 'ui-component/cards/MainCard';

// ===========================|| DASHBOARD DEFAULT - EARNING CARD ||=========================== //

const OpenSale = ({ isLoading }) => {
    const inputRange = [...Array(101).keys()];
    const [values, setValues] = React.useState({
        sender: '',
        token_address: 'first_address',
        close_date: new Date('2014-08-18T21:11:54'),
        input_weight: 38,
        output_weight: 62,
        total_token_amount: 23,
        total_tezos_amount: 4,
        token_sale_is_open: true
    });

    const openSale = () => {
        console.log(values);
        const map = store.getState().token.tokens.map((x) => x.address);
        console.log(map);
    };

    const handleChange = (prop) => (event) => {
        if (prop === 'input_weight') {
            console.log(prop);
            console.log(event.target.value);
            const output = 100 - event.target.value;
            console.log(output);
            setValues({ ...values, [prop]: event.target.value, output_weight: output });
            console.log(values.output_weight);
        } else {
            console.log(event);
            console.log(event.target);
            setValues({ ...values, [prop]: event.target.value });
        }
        console.log('This is output weight');
        console.log(values.output_weight);
    };

    return (
        <>
            {isLoading ? (
                <SkeletonTradingCard />
            ) : (
                <MainCard>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <Box sx={{ p: 1.5 }}>
                            <Grid container direction="column">
                                <Grid container direction="row" justifyContent="start" alignItems="stretch">
                                    <Grid item>
                                        <Chip
                                            label={
                                                <Typography variant="h4" align="center" sx={0}>
                                                    Open sale for your token :
                                                </Typography>
                                            }
                                            variant="outlined"
                                        />
                                    </Grid>
                                    <Divider />
                                    <Grid item>
                                        <FormControl sx={{ m: 1, width: '43ch' }} variant="outlined">
                                            <OutlinedInput
                                                id="outlined-adornment-token"
                                                type="number"
                                                value={values.total_token_amount}
                                                onChange={handleChange('total_token_amount')}
                                                endAdornment={<InputAdornment position="end">Tokens</InputAdornment>}
                                                inputProps={{
                                                    'aria-label': 'weight'
                                                }}
                                            />
                                            <FormHelperText id="outlined-token-helper-text">
                                                Input token amount you want to provide.
                                            </FormHelperText>
                                        </FormControl>
                                    </Grid>
                                    <Grid item>
                                        <FormControl sx={{ m: 1, width: '43ch' }} variant="outlined">
                                            <OutlinedInput
                                                id="outlined-adornment-token"
                                                type="number"
                                                value={values.total_tezos_amount}
                                                onChange={handleChange('total_tezos_amount')}
                                                endAdornment={<InputAdornment position="end">Tezos</InputAdornment>}
                                                inputProps={{
                                                    'aria-label': 'weight'
                                                }}
                                            />
                                            <FormHelperText id="outlined-token-helper-text">
                                                Input tezos amount you want to provide.
                                            </FormHelperText>
                                        </FormControl>
                                    </Grid>
                                    <Grid container direction="row" justifyContent="center" alignItems="stretch">
                                        <Grid item>
                                            <FormControl sx={{ m: 1, width: '20ch' }} variant="outlined">
                                                <Select
                                                    labelId="demo-simple-select-label"
                                                    id="demo-simple-select"
                                                    value={values.input_weight}
                                                    label="Age"
                                                    onChange={handleChange('input_weight')}
                                                >
                                                    {inputRange.map((number) => (
                                                        <MenuItem key={number} value={number}>
                                                            {number}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                                <FormHelperText id="outlined-tezos-helper-text">Input token weight.</FormHelperText>
                                            </FormControl>
                                        </Grid>
                                        <Grid item>
                                            <FormControl sx={{ m: 1, width: '20ch' }} variant="outlined">
                                                <Select
                                                    labelId="demo-simple-select-label"
                                                    id="demo-simple-select"
                                                    disabled
                                                    value={values.output_weight}
                                                    label="Age"
                                                    onChange={handleChange('output_weight')}
                                                >
                                                    {inputRange.map((number) => (
                                                        <MenuItem key={number} value={number}>
                                                            {number}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                                <FormHelperText id="outlined-tezos-helper-text">Output token weight.</FormHelperText>
                                            </FormControl>
                                        </Grid>
                                    </Grid>
                                    <Grid item>
                                        <FormControl sx={{ m: 1, width: '43ch' }} variant="outlined">
                                            <OutlinedInput
                                                id="outlined-adornment-tezos"
                                                type="string"
                                                value={values.token_address}
                                                onChange={handleChange('token_address')}
                                                inputProps={{
                                                    'aria-label': 'weight'
                                                }}
                                            />
                                            <FormHelperText id="outlined-tezos-helper-text">Input token address.</FormHelperText>
                                        </FormControl>
                                    </Grid>
                                    <Grid item>
                                        <FormControl sx={{ m: 1, width: '43ch' }} variant="outlined">
                                            <DateTimePicker
                                                renderInput={(props) => <TextField {...props} />}
                                                value={values.close_date}
                                                onChange={(newValue) => {
                                                    setValues({ ...values, close_date: newValue });
                                                }}
                                            />
                                            <FormHelperText id="outlined-tezos-helper-text">Pick close date of the auction.</FormHelperText>
                                        </FormControl>
                                    </Grid>
                                    <Grid item>
                                        <FormControl sx={{ width: '42ch' }} variant="outlined">
                                            <Button variant="outlined" disableElevation onClick={openSale}>
                                                <Typography variant="h4">Open Sale</Typography>
                                            </Button>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                                <Divider />
                            </Grid>
                        </Box>
                    </LocalizationProvider>
                </MainCard>
            )}
        </>
    );
};

OpenSale.propTypes = {
    isLoading: PropTypes.bool
};

export default OpenSale;
