// material-ui
import { Card, CardContent, Grid } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';

// ==============================|| SKELETON - EARNING CARD ||============================== //

const SkeletonCard = () => (
    <Card>
        <CardContent>
            <Grid container direction="column">
                <Grid item>
                    <Grid container>
                        <Grid item>
                            <Skeleton variant="rectangular" sx={{ my: 2 }} height={40} />
                        </Grid>
                        <Grid item>
                            <Skeleton variant="rectangular" sx={{ my: 2 }} height={40} />
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item>
                    <Skeleton variant="rectangular" sx={{ my: 2 }} height={40} />
                </Grid>
                <Grid item>
                    <Skeleton variant="rectangular" sx={{ my: 2 }} height={40} />
                </Grid>
                <Grid item>
                    <Skeleton variant="rectangular" sx={{ my: 2 }} height={40} />
                </Grid>
                <Grid item>
                    <Skeleton variant="rectangular" sx={{ my: 2 }} height={40} />
                </Grid>
                <Grid item>
                    <Skeleton variant="rectangular" sx={{ my: 2 }} height={40} />
                </Grid>
                <Grid item>
                    <Skeleton variant="rectangular" sx={{ my: 2 }} height={40} />
                </Grid>
            </Grid>
        </CardContent>
    </Card>
);

export default SkeletonCard;
