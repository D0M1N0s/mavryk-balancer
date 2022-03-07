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


// graphs imports

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
// taquito imports

// project imports
import SkeletonTradingCard from 'ui-component/cards/Skeleton/SkeletonCard';
import MainCard from 'ui-component/cards/MainCard';
import store from 'store';

// ==============================|| DASHBOARD - Wallet Card ||============================== //

const Statistics = ({ isLoading }) => {


	ChartJS.register(ArcElement, Tooltip, Legend);	

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

	const data = {
		labels: ['Input Token', 'Output Token'],
		datasets: [
		  {
			label: 'Liquidity pool for tokens.',
			data: [54, 46],
			backgroundColor: [
			  'rgba(255, 99, 132, 0.2)',
			  'rgba(54, 162, 235, 0.2)',
			],
			borderColor: [
			  'rgba(255, 99, 132, 1)',
			  'rgba(54, 162, 235, 1)',
			],
			borderWidth: 1,
		  },
		],
	  };

    return (
        <>
            {isLoading ? (
                <SkeletonTradingCard />
            ) : (
                <MainCard>
						<Grid
						container
						direction="column"
						alignItems="center"
						>
						<Grid item>
						<Typography variant="h3" align="center">
							Token information 
						</Typography>
						</Grid>
						<Grid item sx={{ width: "100%" }}>
						<Doughnut data={data} />
						</Grid>
						</Grid>
                </MainCard>
            )}
        </>
    );
};

Statistics.propTypes = {
    isLoading: PropTypes.bool
};

export default Statistics;
