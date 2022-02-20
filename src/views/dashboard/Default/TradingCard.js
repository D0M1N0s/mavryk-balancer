import PropTypes from 'prop-types';
import * as React from 'react';

// material-ui
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
    Button,
    ListItem,
    List,
    ListItemText
} from '@mui/material';

// project imports
import SkeletonTradingCard from 'ui-component/cards/Skeleton/SkeletonTradingCard';

// ===========================|| DASHBOARD DEFAULT - EARNING CARD ||=========================== //

const TradingCard = ({ isLoading }) => {
    const style = {
        width: '100%',
        maxWidth: 360,
        bgcolor: 'background.paper'
    };

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
                <Box sx={{ p: 2.25 }}>
                    <Grid container direction="column">
                        <Grid item>
                            <Typography variant="h4" align="center" sx={0}>
                                Trending tokens to buy.
                            </Typography>
                        </Grid>
                        <Divider />
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
                        <Grid item>
                            <Box sx={{ p: 2 }}>
                                <List sx={style} component="nav" aria-label="mailbox folders">
                                    <ListItem button divider>
                                        <ListItemText primary="Etherium/Tezos" />
                                    </ListItem>
                                    <ListItem button divider>
                                        <ListItemText primary="Tezos/Bitcoin" />
                                    </ListItem>
                                    <ListItem button divider>
                                        <ListItemText primary="Etherium/Bitcoin" />
                                    </ListItem>
                                    <ListItem button divider>
                                        <ListItemText primary="Tezos/USD" />
                                    </ListItem>
                                </List>
                            </Box>
                        </Grid>
                        <FormControl sx={{ m: 1, width: '43ch' }} variant="outlined" />
                        <Button variant="contained" disableElevation>
                            <Typography variant="h4">Exchange Tokens</Typography>
                        </Button>
                        <FormControl />
                    </Grid>
                </Box>
            )}
        </>
    );
};

TradingCard.propTypes = {
    isLoading: PropTypes.bool
};

export default TradingCard;
