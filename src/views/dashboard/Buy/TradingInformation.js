/* eslint-disable prettier/prettier */
import PropTypes from 'prop-types';
import * as React from 'react';

// material-ui
import {
    Box,
    Grid,
    Typography,
    Divider
} from '@mui/material';

// taquito imports

// project imports
import SkeletonTradingCard from 'ui-component/cards/Skeleton/SkeletonCard';
import MainCard from 'ui-component/cards/MainCard';
import store from 'store';

// ==============================|| DASHBOARD - Wallet Card ||============================== //

const WalletCard = ({ isLoading }) => {

    const [values, setValues] = React.useState({
        address: '',
        balance: -1,
        tokens: -1,
        wallet: null,
        email: '',
        password: '',
        mnemonics: '',
        secret: ''
    });

    return (
        <>
            {isLoading ? (
                <SkeletonTradingCard />
            ) : (
                <MainCard>
                    <Box sx={{ p: 1.5 }}>
                        <Grid container direction="row" spacing={1}>
                            <Grid container direction="column" justifyContent="start" alignItems="stretch" spacing={2}>
                                <Grid item>
										<Typography variant="h3" align="center" sx={0}>
											Token information 
										</Typography>
                                </Grid>
								<Grid item>
									<Divider dark />
								</Grid>
								<Grid item>
										<Typography variant="h4"  gutterBottom align="start" sx={0}>
											Token address : {values.address}
										</Typography>
                                </Grid>
								<Grid item>
									<Divider dark />
								</Grid>
								<Grid item>
										<Typography variant="h4"  gutterBottom align="start" sx={0}>
											Token tezos balance : {values.balance}
										</Typography>
                                </Grid>
								<Grid item>
									<Divider dark />
								</Grid>
								<Grid item>
										<Typography variant="h4"  gutterBottom align="start" sx={0}>
											Total token amount : {values.tokens}
										</Typography>
                                </Grid>
								<Grid item>
									<Divider dark />
								</Grid>
								<Grid item>
										<Typography variant="h4"  gutterBottom align="start" sx={0}>
											Token close date : {values.tokens}
										</Typography>
                                </Grid>
								<Grid item>
									<Divider dark />
								</Grid>
                            </Grid>
                        </Grid>
                    </Box>
                </MainCard>
            )}
        </>
    );
};

WalletCard.propTypes = {
    isLoading: PropTypes.bool
};

export default WalletCard;
