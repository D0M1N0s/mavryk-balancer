import PropTypes from 'prop-types';
import * as React from 'react';

// material-ui
import { styled, useTheme } from '@mui/material/styles';
import {
    Divider,
    Box,
    Grid,
    InputLabel,
    Select,
    FormControl,
    OutlinedInput,
    Typography,
    MenuItem,
    InputAdornment,
    FormHelperText,
    Button
} from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import SkeletonTradingCard from 'ui-component/cards/Skeleton/SkeletonTradingCard';

const CardWrapper = styled(MainCard)(({ theme }) => ({
    backgroundColor: theme.palette.primary.dark,
    color: theme.palette.primary.light,
    overflow: 'hidden',
    position: 'relative',
    '&:after': {
        content: '""',
        position: 'absolute',
        width: 210,
        height: 210,
        background: `linear-gradient(210.04deg, ${theme.palette.primary[200]} -50.94%, rgba(144, 202, 249, 0) 83.49%)`,
        borderRadius: '50%',
        top: -30,
        right: -180
    },
    '&:before': {
        content: '""',
        position: 'absolute',
        width: 210,
        height: 210,
        background: `linear-gradient(140.9deg, ${theme.palette.primary[200]} -14.02%, rgba(144, 202, 249, 0) 77.58%)`,
        borderRadius: '50%',
        top: -160,
        right: -130
    }
}));

// ===========================|| DASHBOARD DEFAULT - EARNING CARD ||=========================== //

const TradingCard = ({ isLoading }) => {
    const theme = useTheme();
    const [inputToken, setInputToken] = React.useState('');
    const [values, setValues] = React.useState({
        input: '',
        output: ''
    });

    const handleChange = (prop) => (event) => {
        setValues({ ...values, [prop]: event.target.value });
        setInputToken(event.target.value);
    };

    return (
        <>
            {isLoading ? (
                <SkeletonTradingCard />
            ) : (
                <CardWrapper border={false} content={false}>
                    <Box sx={{ p: 2.25 }}>
                        <Grid container direction="column">
                            <Grid item>
                                <Grid container direction="row" justifyContent="center" alignItems="stretch">
                                    <Grid item>
                                        <InputLabel id="input-token-select-label">Token</InputLabel>
                                        <Select
                                            labelId="input-token-select-label"
                                            id="input-token-select"
                                            value={inputToken}
                                            label="Input Token"
                                            onChange={handleChange}
                                        >
                                            <MenuItem value={10}>Etherium</MenuItem>
                                            <MenuItem value={20}>Tezos</MenuItem>
                                            <MenuItem value={30}>Bitcoin</MenuItem>
                                        </Select>
                                    </Grid>
                                    <Grid item>
                                        <FormControl sx={{ m: 1, width: '25ch' }} variant="outlined">
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
                            </Grid>
                            <Divider />
                            <Grid container direction="row" justifyContent="center" alignItems="stretch">
                                <Grid item>
                                    <InputLabel id="input-token-select-label">Token</InputLabel>
                                    <Select
                                        labelId="input-token-select-label"
                                        id="input-token-select"
                                        value={inputToken}
                                        label="Input Token"
                                        onChange={handleChange}
                                    >
                                        <MenuItem value={10}>Etherium</MenuItem>
                                        <MenuItem value={20}>Tezos</MenuItem>
                                        <MenuItem value={30}>Bitcoin</MenuItem>
                                    </Select>
                                </Grid>
                                <Grid item>
                                    <FormControl sx={{ m: 1, width: '25ch' }} variant="outlined">
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
                            <Divider />
                            <Grid container direction="row" justifyContent="center" alignItems="stretch">
                                <Grid item>
                                    <Button variant="contained" disableElevation>
                                        <Typography variant="h4">Exchange Tokens</Typography>
                                    </Button>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Box>
                </CardWrapper>
            )}
        </>
    );
};

TradingCard.propTypes = {
    isLoading: PropTypes.bool
};

export default TradingCard;
