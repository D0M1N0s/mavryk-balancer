import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';

export default function CustomizedTabs() {
    return (
        <Box sx={{ width: '100%' }}>
            <Tabs indicatorColor="primary" variant="fullWidth">
                <Tab
                    label={
                        <Chip
                            sx={{ width: '100%' }}
                            label={
                                <Typography variant="h4" align="center" sx={1}>
                                    Buy token
                                </Typography>
                            }
                            variant="outlined"
                        />
                    }
                    href="/buy"
                />
                <Tab
                    label={
                        <Chip
                            sx={{ width: '100%' }}
                            label={
                                <Typography variant="h4" align="center" sx={1}>
                                    Open Sale
                                </Typography>
                            }
                            variant="outlined"
                        />
                    }
                    href="/sell"
                />
            </Tabs>
        </Box>
    );
}
