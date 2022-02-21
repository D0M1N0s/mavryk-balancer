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

// ===========================|| DASHBOARD DEFAULT - EARNING CARD ||=========================== //

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
                <Box sx={{ p: 1.5 }}>
                    <Grid container direction="column">
                        <Grid item>
                            <Chip
                                label={
                                    <Typography variant="h4" align="center" sx={0}>
                                        Buy tokens :
                                    </Typography>
                                }
                                variant="outlined"
                            />
                        </Grid>
                        <Divider />
                        <Divider />
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
                                        bgcolor: 'background.paper',
                                        position: 'relative',
                                        overflow: 'auto',
                                        maxHeight: 300,
                                        '& ul': { padding: 0 }
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
            )}
        </>
    );
};

TradingCard.propTypes = {
    isLoading: PropTypes.bool
};

export default TradingCard;
