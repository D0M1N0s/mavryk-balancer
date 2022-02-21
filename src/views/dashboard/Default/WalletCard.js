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

// project imports
import SkeletonTrends from 'ui-component/cards/Skeleton/SkeletonTrends';

// ==============================|| DASHBOARD - TOTAL INCOME DARK CARD ||============================== //

const WalletCard = ({ isLoading }) => {
    const Input = styled('input')({
        display: 'none'
    });

    const [values, setValues] = React.useState({
        email: '',
        password: '',
        mnemonics: ''
    });

    const handleChange = (prop) => (event) => {
        setValues({ ...values, [prop]: event.target.value });
    };

    const connectWallet = () => {
        console.log(values);
    };

    return (
        <>
            {isLoading ? (
                <SkeletonTrends />
            ) : (
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
                                            'aria-label': 'weight'
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
            )}
        </>
    );
};

WalletCard.propTypes = {
    isLoading: PropTypes.bool
};

export default WalletCard;
