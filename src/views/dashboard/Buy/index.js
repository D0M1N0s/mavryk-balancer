import { useEffect, useState } from 'react';

// material-ui
import { Grid, Box } from '@mui/material';

// project imports
import TradingCard from './TradingCard';
import WalletCard from '../Wallet';
import TradingInformation from './TradingInformation';
import TradingHistory from './TradingHistory';

// ==============================|| DEFAULT DASHBOARD ||============================== //

const Dashboard = () => {
    const [isLoading, setLoading] = useState(true);
    useEffect(() => {
        setLoading(false);
    }, []);

    return (
        <Box m={2} pt={6.5}>
            <Grid container direction="row" justifyContent="space-evenly" alignItems="stretch" spacing={4}>
                <Grid container direction="column" justifyContent="center" alignItems="stretch" spacing={4} lg={3} xs={3}>
                    <Grid item>
                        <WalletCard isLoading={isLoading} />
                    </Grid>
                    <Grid item>
                        <TradingHistory isLoading={isLoading} />
                    </Grid>
                </Grid>
                <Grid item lg={5} xs={5}>
                    <TradingCard isLoading={isLoading} />
                </Grid>
                <Grid item lg={3.5} xs={3}>
                    <TradingInformation />
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;
