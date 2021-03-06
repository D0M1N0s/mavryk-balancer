import { useEffect, useState } from 'react';

// material-ui
import { Grid, Box } from '@mui/material';

// project imports
import TradingCard from './OpenSale';
import WalletCard from '../Wallet';
import Statistics from './Statistics';
import StandartPicker from './StandartPicker';

// ==============================|| DEFAULT DASHBOARD ||============================== //

const Dashboard = () => {
    const [isLoading, setLoading] = useState(true);
    useEffect(() => {
        setLoading(false);
    }, []);

    return (
        <Box m={2} pt={6.5}>
            <Grid container direction="row" justifyContent="space-evenly" alignItems="stretch" spacing={4}>
                <Grid container direction="column" justifyContent="center" alignItems="stretch" spacing={3} lg={3} xs={3}>
                    <Grid item>
                        <WalletCard isLoading={isLoading} />
                    </Grid>
                    <Grid item>
                        <StandartPicker isLoading={isLoading} />
                    </Grid>
                </Grid>
                <Grid item lg={5} xs={5}>
                    <TradingCard isLoading={isLoading} />
                </Grid>
                <Grid item lg={3} xs={3}>
                    <Statistics isLoading={isLoading} />
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;
