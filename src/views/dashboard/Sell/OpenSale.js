import PropTypes from 'prop-types';
import * as React from 'react';

// material-ui
import DateTimePicker from '@mui/lab/DateTimePicker';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';

import {
    Box,
    Grid,
    FormControl,
    OutlinedInput,
    Typography,
    TextField,
    InputAdornment,
    FormHelperText,
    Button,
    Chip,
    Dialog,
    List,
    ListItemButton,
    ListItem,
    ListItemText
} from '@mui/material';

// project imports
import SkeletonTradingCard from 'ui-component/cards/Skeleton/SkeletonCard';
import store from 'store';
import MainCard from 'ui-component/cards/MainCard';

// ===========================|| DASHBOARD DEFAULT - Open Sale ||=========================== //

const OpenSale = ({ isLoading }) => {
    const [open, setOpen] = React.useState(false);
    const [values, setValues] = React.useState({
        token_address: '',
        token_name: '',
        token_amount: 0,
        based_asset_address: 'XTZ',
        based_asset_name: 'XTZ',
        based_asset_amount: 0,
        close_date: null
    });

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleListItemClick = (event, currentToken) => {
        console.log(currentToken);
        const token = store.getState().tokens.filter((token) => token.token_address === currentToken);
        setValues({
            ...values,
            based_asset_address: currentToken,
            based_asset_name: token[0].token_name
        });
        handleClose();
    };

    const openSale = () => {
        const map = store.getState().tokens.map((x) => x.address);
        console.log(map);
    };

    const handleChange = (prop) => (event) => {
        if (prop === 'token_amount') {
            setValues({ ...values, [prop]: event.target.value });
        } else {
            setValues({ ...values, [prop]: event.target.value });
        }
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
                                <Grid item>
                                    <Typography variant="h3" align="center">
                                        Proportions of tokens.
                                    </Typography>
                                </Grid>
                                <Grid container direction="row" justifyContent="center" alignItems="stretch">
                                    <Grid item>
                                        <FormControl sx={{ m: 1, width: '21ch' }} variant="outlined">
                                            <OutlinedInput
                                                id="outlined-adornment-token"
                                                type="number"
                                                value={values.total_token_amount}
                                                onChange={handleChange('token_amount')}
                                                endAdornment={<InputAdornment position="end">Tokens</InputAdornment>}
                                                inputProps={{
                                                    'aria-label': 'weight'
                                                }}
                                            />
                                            <FormHelperText id="outlined-token-helper-text">Token amount.</FormHelperText>
                                        </FormControl>
                                    </Grid>
                                    <Grid item>
                                        <FormControl sx={{ m: 1, width: '21ch' }} variant="outlined">
                                            <OutlinedInput
                                                disabled
                                                id="outlined-adornment-token"
                                                type="number"
                                                value={values.based_asset_amount}
                                                onChange={handleChange('based_asset_amount')}
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
                                                                    {values.based_asset_name}
                                                                </Typography>
                                                            }
                                                            onClick={handleClickOpen}
                                                            variant="outlined"
                                                            sx={{ width: '100%' }}
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
                                                                                            <ListItemText
                                                                                                primary={`Token : ${value.token_name}`}
                                                                                            />
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
                                                inputProps={{
                                                    'aria-label': 'weight'
                                                }}
                                            />
                                            <FormHelperText id="outlined-token-helper-text">Stablecoin.</FormHelperText>
                                        </FormControl>
                                    </Grid>
                                    <Grid item>
                                        <FormControl sx={{ width: '43ch' }} variant="outlined">
                                            <OutlinedInput
                                                id="outlined-adornment-tezos"
                                                type="string"
                                                value={values.output_token_address}
                                                onChange={handleChange('token_address')}
                                            />
                                            <FormHelperText id="outlined-tezos-helper-text">Input token address.</FormHelperText>
                                        </FormControl>
                                    </Grid>
                                    <Grid item>
                                        <FormControl sx={{ width: '43ch' }} variant="outlined">
                                            <OutlinedInput
                                                id="outlined-adornment-tezos"
                                                type="string"
                                                value={values.output_token_address}
                                                onChange={handleChange('token_name')}
                                            />
                                            <FormHelperText id="outlined-tezos-helper-text">Input token name.</FormHelperText>
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
