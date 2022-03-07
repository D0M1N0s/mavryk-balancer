// material-ui
import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/material';

// project imports
import LogoSection from '../LogoSection';
import RouterTab from './RouterTab';
// import WalletSection from './WalletSection';

// ==============================|| MAIN NAVBAR / HEADER ||============================== //

const Header = () => {
    const theme = useTheme();

    return (
        <>
            {/* logo */}
            <Box
                sx={{
                    width: 228,
                    display: 'flex',
                    [theme.breakpoints.down('md')]: {
                        width: 'auto'
                    }
                }}
            >
                <Box component="span" sx={{ display: { xs: 'none', md: 'block' }, flexGrow: 0 }}>
                    <LogoSection />
                </Box>
            </Box>
            {/* wallet */}
            <RouterTab />
            {/* header space */}
            <Box sx={{ flexGrow: 2 }} />
        </>
    );
};

export default Header;
