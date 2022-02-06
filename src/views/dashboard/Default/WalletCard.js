import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

// material-ui
import { styled, useTheme } from '@mui/material/styles';
import { Avatar, Box, Chip, Stack, Typography, Popper, Paper, Divider, ClickAwayListener } from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import SkeletonTrends from 'ui-component/cards/Skeleton/SkeletonTrends';
import Transitions from 'ui-component/extended/Transitions';
import Tezos from 'assets/images/tezos.svg';

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

// ==============================|| DASHBOARD - TOTAL INCOME DARK CARD ||============================== //

const WalletCard = ({ isLoading }) => {
    const theme = useTheme();

    const [open, setOpen] = useState(false);
    /**
     * anchorRef is used on different componets and specifying one type leads to other components throwing an error
     * */
    const anchorRef = useRef(null);

    const handleClose = (event) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return;
        }
        setOpen(false);
    };

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const prevOpen = useRef(open);
    useEffect(() => {
        if (prevOpen.current === true && open === false) {
            anchorRef.current.focus();
        }

        prevOpen.current = open;
    }, [open]);

    return (
        <>
            {isLoading ? (
                <SkeletonTrends />
            ) : (
                <CardWrapper border={false} content={false}>
                    <Chip
                        sx={{
                            height: '48px',
                            alignItems: 'center',
                            borderRadius: '27px',
                            transition: 'all .2s ease-in-out',
                            borderColor: theme.palette.primary,
                            backgroundColor: theme.palette.primary,
                            '&[aria-controls="menu-list-grow"], &:hover': {
                                borderColor: theme.palette.primary.main,
                                background: `${theme.palette.primary.main}!important`,
                                color: theme.palette.primary.light,
                                '& svg': {
                                    stroke: theme.palette.primary
                                }
                            },
                            '& .MuiChip-label': {
                                lineHeight: 0
                            }
                        }}
                        icon={
                            <Avatar
                                src={Tezos}
                                sx={{
                                    ...theme.typography.mediumAvatar,
                                    margin: '8px 0 8px 8px !important',
                                    cursor: 'pointer'
                                }}
                                ref={anchorRef}
                                aria-controls={open ? 'menu-list-grow' : undefined}
                                aria-haspopup="true"
                                color="inherit"
                            />
                        }
                        label={
                            <Typography variant="h4" sx={0}>
                                Connect your wallet
                            </Typography>
                        }
                        variant="outlined"
                        ref={anchorRef}
                        aria-controls={open ? 'menu-list-grow' : undefined}
                        aria-haspopup="true"
                        onClick={handleToggle}
                        color="primary"
                    />
                    <Popper
                        placement="bottom-end"
                        open={open}
                        anchorEl={anchorRef.current}
                        role={undefined}
                        transition
                        disablePortal
                        popperOptions={{
                            modifiers: [
                                {
                                    name: 'offset',
                                    options: {
                                        offset: [0, 14]
                                    }
                                }
                            ]
                        }}
                    >
                        {({ TransitionProps }) => (
                            <Transitions in={open} {...TransitionProps}>
                                <Paper>
                                    <ClickAwayListener onClickAway={handleClose}>
                                        <MainCard border={false} elevation={16} content={false} boxShadow shadow={theme.shadows[16]}>
                                            <Box sx={{ p: 2 }}>
                                                <Stack>
                                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                                        <Typography variant="h4">Connect your wallet : </Typography>
                                                        <Typography component="span" variant="h4" sx={{ fontWeight: 400 }}>
                                                            x14y53uiy2i4h2i23
                                                        </Typography>
                                                    </Stack>
                                                </Stack>
                                                <Divider />
                                            </Box>
                                        </MainCard>
                                    </ClickAwayListener>
                                </Paper>
                            </Transitions>
                        )}
                    </Popper>
                </CardWrapper>
            )}
        </>
    );
};

WalletCard.propTypes = {
    isLoading: PropTypes.bool
};

export default WalletCard;
