import PropTypes from 'prop-types';

// material-ui
import { styled } from '@mui/material/styles';
import { Divider, Box, List, ListItem, ListItemText, Typography } from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import SkeletonTrends from 'ui-component/cards/Skeleton/SkeletonTrends';

// styles
const CardWrapper = styled(MainCard)(({ theme }) => ({
    backgroundColor: theme.palette.primary.dark,
    color: theme.palette.primary.light,
    overflow: 'hidden',
    position: 'relative',
    '&:after': {
        content: '""',
        position: 'absolute',
        width: 210,
        height: 210,
        background: `linear-gradient(210.04deg, ${theme.palette.primary[200]} -50.94%, rgba(144, 202, 249, 0) 83.49%)`,
        borderRadius: '50%',
        top: -30,
        right: -180
    },
    '&:before': {
        content: '""',
        position: 'absolute',
        width: 210,
        height: 210,
        background: `linear-gradient(140.9deg, ${theme.palette.primary[200]} -14.02%, rgba(144, 202, 249, 0) 77.58%)`,
        borderRadius: '50%',
        top: -160,
        right: -130
    }
}));

// ==============================|| DASHBOARD - TOTAL INCOME LIGHT CARD ||============================== //

const Trends = ({ isLoading }) => (
    <>
        {isLoading ? (
            <SkeletonTrends />
        ) : (
            <CardWrapper border={false} content={false}>
                <Box sx={{ p: 2 }}>
                    <Typography variant="h4" sx={0}>
                        Trending pairs of tokens
                    </Typography>
                    <List aria-label="currencies">
                        <Divider light />
                        <ListItem button>
                            <ListItemText primary="Etherium/Tezos" />
                        </ListItem>
                        <Divider light />
                        <ListItem button divider>
                            <ListItemText primary="Tezos/Bitcoin" />
                        </ListItem>
                        <Divider light />
                        <ListItem button>
                            <ListItemText primary="Etherium/Bitcoin" />
                        </ListItem>
                        <Divider light />
                        <ListItem button>
                            <ListItemText primary="Tezos/USD" />
                        </ListItem>
                        <Divider light />
                    </List>
                </Box>
            </CardWrapper>
        )}
    </>
);

Trends.propTypes = {
    isLoading: PropTypes.bool
};

export default Trends;
