/* eslint-disable prettier/prettier */
import PropTypes from 'prop-types';
import * as React from 'react';

// material-ui
import {
    Box,
    Grid,
    Typography,
    Paper,
	Chip
} from '@mui/material';
// taquito imports

// project imports
import SkeletonTradingCard from 'ui-component/cards/Skeleton/SkeletonCard';
import MainCard from 'ui-component/cards/MainCard';

// ==============================|| DASHBOARD - Wallet Card ||============================== //

const WalletCard = ({ isLoading }) => {

	const [Tokens, setTokens] = React.useState([
		{ key: 0, label: 'Doge' },
		{ key: 1, label: 'Btc' },
		{ key: 2, label: 'TezWrap' },
		{ key: 3, label: 'ExCoin' },
		{ key: 4, label: 'VsCoin' },
	  ]);

	const handleClick = (tokenToPick) => () => {
		setTokens((tokens) => tokens.filter((token) => token.key !== tokenToPick.key));
	  };
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
											Hot tokens to buy !!!
										</Typography>
                                </Grid>
								<Grid item>
								<Paper
									elevation={12}
									sx={{
										display: 'flex',
										justifyContent: 'center',
										flexWrap: 'wrap',
										listStyle: 'none',
										p: 0.5,
										m: 0,
									}}
									component="ul"
									>
									{Tokens.map((data) => (
											<Chip
												label={
														<Typography variant="h4" align="center">
															{data.label}
														</Typography>
													}
												variant="outlined"
												sx={{ m: 1 }}
												onClick={handleClick(data)}
											/>
										))}
									</Paper>
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
