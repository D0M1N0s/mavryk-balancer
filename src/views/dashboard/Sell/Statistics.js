/* eslint-disable prettier/prettier */
import PropTypes from 'prop-types';
import * as React from 'react';

// material-ui
import {
    Grid,
    Typography,
	FormControl,
	Select,
	MenuItem,
	FormHelperText,

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

	const inputRange = [...Array(101).keys()];
    const [values, setValues] = React.useState({
        input_weight: 38,
        output_weight: 62
    });

    const handleChange = (prop) => (event) => {
        if (prop === 'input_weight') {
            const output = 100 - event.target.value;
            setValues({ [prop]: event.target.value, output_weight: output });
        } else {
            setValues({ ...values, [prop]: event.target.value });
        }
        console.log('This is output weight');
        console.log(values.output_weight);
    };

	const data = {
		labels: ['Input Token', 'Output Token'],
		datasets: [
		  {
			label: 'Liquidity pool for tokens.',
			data: [values.input_weight, values.output_weight],
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
							Proportions of tokens.
						</Typography>
						</Grid>
						<Grid item sx={{ width: "100%" }}>
						<Doughnut data={data} />
						</Grid>
						<Grid container direction="row" justifyContent="center" alignItems="stretch">
                                        <Grid item>
                                            <FormControl sx={{ m: 1, width: '20ch' }} variant="outlined">
                                                <Select
                                                    labelId="demo-simple-select-label"
                                                    id="demo-simple-select"
                                                    value={values.input_weight}
                                                    label="Age"
                                                    onChange={handleChange('input_weight')}
                                                >
                                                    {inputRange.map((number) => (
                                                        <MenuItem key={number} value={number}>
                                                            {number}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                                <FormHelperText id="outlined-tezos-helper-text">Input token weight.</FormHelperText>
                                            </FormControl>
                                        </Grid>
                                        <Grid item>
                                            <FormControl sx={{ m: 1, width: '20ch' }} variant="outlined">
                                                <Select
                                                    labelId="demo-simple-select-label"
                                                    id="demo-simple-select"
                                                    disabled
                                                    value={values.output_weight}
                                                    label="Age"
                                                    onChange={handleChange('output_weight')}
                                                >
                                                    {inputRange.map((number) => (
                                                        <MenuItem key={number} value={number}>
                                                            {number}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                                <FormHelperText id="outlined-tezos-helper-text">Output token weight.</FormHelperText>
                                            </FormControl>
                                        </Grid>
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
