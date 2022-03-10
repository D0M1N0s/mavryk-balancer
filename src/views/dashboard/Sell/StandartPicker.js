import * as React from 'react';

// mui imports
import { Grid, Typography, FormControl, OutlinedInput, FormHelperText } from '@mui/material';

// taquito imports

// project imports
import MainCard from 'ui-component/cards/MainCard';
import store from 'store';

export default function AlertDialogSlide() {
    const [values, setValues] = React.useState({
        id_fa2: -1
    });

    const handleChange = (prop) => (event) => {
        setValues({ ...values, [prop]: event.target.value });
        store.dispatch({
            type: 'changeToken',
            payload: {
                [prop]: event.target.value
            }
        });
        console.log(store.getState().sale);
    };

    return (
        <MainCard>
            <Grid container direction="column" justifyContent="start" alignItems="stretch" spacing={1}>
                <Grid item>
                    <Grid container direction="row" justifyContent="space-between" alignItems="center">
                        <Grid item>
                            <Typography variant="h5" align="start" sx={0}>
                                If your token standart is FA2, then write the id of your token.
                            </Typography>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item>
                    <Grid container direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h4" align="start" sx={0}>
                            FA2 ID:
                        </Typography>
                        <OutlinedInput type="number" value={values.id_fa2} onChange={handleChange('id_fa2')} />
                    </Grid>
                </Grid>
            </Grid>
        </MainCard>
    );
}
