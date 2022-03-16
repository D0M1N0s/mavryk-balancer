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
        token_weight: '',
        token_amount: '',
        token_address: '',
        token_name: '',
        based_asset_weight: '',
        based_asset_amount: '',
        based_asset_address: '',
        based_asset_name: '',
		close_date: '',
    });

	store.subscribe(() => {
		const token = store.getState().tokens.filter((token) => token.token_address === store.getState().buy.token);
		console.log(token[0].close_date)
		setValues({
			token_weight: token[0].token_weight,
			token_amount: token[0].token_amount,
			token_address: token[0].token_address,
			token_name: token[0].token_name,
			based_asset_weight: token[0].based_asset_weight,
			based_asset_amount: token[0].based_asset_amount,
			based_asset_address: token[0].based_asset_address,
			based_asset_name: token[0].based_asset_name,
			close_date: token[0].close_date.toString()
		})
	})

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
										<Typography variant="h4"  gutterBottom noWrap align="start" sx={{ width: '35ch' }}>
											Token address : {values.token_address}
										</Typography>
                                </Grid>
								<Grid item>
									<Divider dark />
								</Grid>
								<Grid item>
										<Typography variant="h4"  gutterBottom noWrap align="start" sx={{ width: '35ch' }}>
											Token tezos balance : {values.based_asset_amount}
										</Typography>
                                </Grid>
								<Grid item>
									<Divider dark />
								</Grid>
								<Grid item>
										<Typography variant="h4"  gutterBottom noWrap align="start" sx={{ width: '35ch' }}>
											Total token amount : {values.token_amount}
										</Typography>
                                </Grid>
								<Grid item>
									<Divider dark />
								</Grid>
								<Grid item>
										<Typography variant="h4"  gutterBottom noWrap align="start" sx={{ width: '35ch' }}>
											Token close date : {values.close_date}
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
