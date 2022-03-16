import PropTypes from 'prop-types';
import * as React from 'react';

import fa12tokensale from '../../../json_files/fa12-latest.json';
import fa2tokensale from '../../../json_files/fa2-latest.json';

// material-ui
import DateTimePicker from '@mui/lab/DateTimePicker';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import DialogContent from '@mui/material/DialogContent';
import LinearProgress from '@mui/material/LinearProgress';
import { styled } from '@mui/material/styles';

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
    ListItemText,
    Popper,
    Divider
} from '@mui/material';

// project imports
import SkeletonTradingCard from 'ui-component/cards/Skeleton/SkeletonCard';
import store from 'store';
import MainCard from 'ui-component/cards/MainCard';

import { openSaleFA12, openSaleFA2, TokenStandard } from './OpenSaleWrappers';

// ===========================|| DASHBOARD DEFAULT - Open Sale ||=========================== //

const OpenSale = ({ isLoading }) => {
    function bytesToString(bytes) {
        const result = [];
        for (let i = 0; i < bytes.length; i += 2) {
            result.push(String.fromCharCode(parseInt(bytes.substr(i, 2), 16)));
        }
        return result.join('');
    }
    async function GetTokenDecimals(tokenAddress, tokenId) {
        const storageUrl = `https://api.hangzhou2net.tzkt.io/v1/contracts/${tokenAddress}/bigmaps/token_metadata/keys`;
        const token = new XMLHttpRequest();
        token.responseType = 'json';
        token.open('GET', storageUrl);
        token.send();
        let res = 0;
        const decimalsPr = new Promise((val) => {
            res = val;
            return res;
        });
        token.onreadystatechange = () => {
            if (token.response !== null) {
                const tokenList = token.response;
                console.log('response:', tokenList);
                let bytes = null;
                for (let i = 0; i < tokenList.length; i += 1) {
                    if (parseInt(tokenList[i].value.token_id, 10) === tokenId) {
                        if (tokenList[i].value.token_info !== undefined) {
                            bytes = tokenList[i].value.token_info.decimals;
                        }
                        console.log(tokenList[i].value.token_info);
                        console.log(bytes);
                    }
                }
                if (bytes != null) {
                    res(parseInt(bytesToString(bytes), 10));
                }
            }
        };
        return decimalsPr;
    }
    const [open, setOpen] = React.useState(false);
    // consts for dialog window with loading bar
    const [disabled, setDisabled] = React.useState(false);
    const [openDialog, setOpenDialog] = React.useState(false);
    const [progressDisabled, setProgressDisabled] = React.useState(false);
    const [operationMessage, setOperationMessage] = React.useState('');
    // consts for popper with errors
    const [anchor, setAnchor] = React.useState(null);
    const [warningMessage, setWarningMessage] = React.useState('');
    const [popperVisibility, setPopperVisibility] = React.useState(false);
    // const for token info
    const [values, setValues] = React.useState({
        token_address: '',
        token_name: '',
        token_amount: 0,
        based_asset_address: '',
        based_asset_name: 'XTZ',
        based_asset_amount: 0,
        close_date: null,
        token_weight: null,
        token_id: -1
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
        store.dispatch({
            type: 'changeToken',
            payload: {
                based_asset_address: currentToken,
                based_asset_name: token[0].token_name
            }
        });
        handleClose();
    };
    const popperChangeState = (currentTarget) => {
        setAnchor(currentTarget);
    };
    const popperChangeVisability = (warningText, visibility) => {
        setWarningMessage(warningText);
        setPopperVisibility(visibility);
    };
    const InvalidOpensaleParams = (standard) => {
        if (values.close_date === undefined || values.close_date === null) {
            return true;
        }
        if (values.token_weight === null || values.token_name === null) {
            return true;
        }
        if (values.token_amount === 0 || values.based_asset_amount === 0) {
            return true;
        }
        if (standard === 'FA2' && values.token_id < 0) {
            return true;
        }
        return false;
    };
    const closeDialog = () => {
        setOpenDialog(false);
    };
    const openSale = async (event) => {
        setProgressDisabled(true);
        setOperationMessage('');
        setDisabled(true);
        popperChangeState(event.currentTarget);
        popperChangeVisability('', false);
        const map = store.getState().tokens.map((x) => x.address);
        console.log('store:', store.getState().sale);
        console.log(values);
        const wallet = store.getState().wallet.wallet;
        console.log('wallet', wallet);
        if (wallet === null) {
            popperChangeVisability('Please, connect your wallet', true);
            return;
        }
        let standard = '';
        try {
            standard = await TokenStandard(values.token_address);
        } catch (exp) {
            popperChangeVisability(exp.message, true);
            return;
        }
        const tokenDecimals = await GetTokenDecimals(values.token_address, 0); // tokenId to get from user...
        let assetDecimals = 6;
        if (values.based_asset_address !== '') {
            assetDecimals = await GetTokenDecimals(values.based_asset_address, 0); // same about tokenId
        }
        values.token_weight = store.getState().sale.input_weight;
        values.token_id = store.getState().sale.id_fa2;
        let opHash = null;
        console.log(standard);
        if (InvalidOpensaleParams(standard)) {
            popperChangeVisability('Invalid params for tokensale', true);
            return;
        }
        if (standard === 'FA2') {
            try {
                setOpenDialog(true);
                opHash = await openSaleFA2(
                    wallet,
                    fa2tokensale.address,
                    values.token_address,
                    values.token_amount,
                    values.based_asset_amount,
                    values.close_date,
                    values.token_weight / 100,
                    values.token_id,
                    tokenDecimals,
                    assetDecimals,
                    values.token_name,
                    values.based_asset_address,
                    values.based_asset_name
                );
            } catch (exp) {
                setOperationMessage(exp.message);
                setDisabled(false);
                setProgressDisabled(true);
                return;
            }
        } else if (standard === 'FA1.2') {
            try {
                setOpenDialog(true);
                opHash = await openSaleFA12(
                    wallet,
                    fa12tokensale.address,
                    values.token_address,
                    values.token_amount,
                    values.based_asset_amount,
                    values.close_date,
                    values.token_weight / 100,
                    tokenDecimals,
                    assetDecimals,
                    values.token_name,
                    values.based_asset_address,
                    values.based_asset_name
                );
            } catch (exp) {
                setOperationMessage(exp.message);
                setDisabled(false);
                setProgressDisabled(true);
                return;
            }
        } else {
            popperChangeVisability('Unexpected token standard: tokensale supports only FA1.2 or FA2 standards', true);
            return;
        }
        console.log(opHash);
        setOperationMessage(`Hash of the operation: ${opHash}`);
        setDisabled(false);
        setProgressDisabled(true);
    };

    const setTime = (time) => {
        setValues({ ...values, close_date: time });
        store.dispatch({
            type: 'changeToken',
            payload: {
                close_date: time
            }
        });
    };
    const handleChange = (prop) => (event) => {
        setValues({ ...values, [prop]: event.target.value });
        store.dispatch({
            type: 'changeToken',
            payload: {
                [prop]: event.target.value
            }
        });
        console.log(store.getState().sale);
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
                                                    setTime(newValue);
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

OpenSale.propTypes = {
    isLoading: PropTypes.bool
};

export default OpenSale;
