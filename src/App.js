import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, StyledEngineProvider } from '@mui/material';

// routing
import Routes from 'routes';

// defaultTheme
import themes from 'themes';
import store from 'store';

// project imports
import NavigationScroll from 'layout/NavigationScroll';

// ==============================|| APP ||============================== //

const App = () => {
    const customization = useSelector((state) => state.customization);

    useEffect(() => {
        /**
         *  This section updates token list.
         *  Taking fa12 and fa2 tokens and pushing them to token list
         */

        const storage = [];

        const fa12Http = new XMLHttpRequest();
        const fa2Http = new XMLHttpRequest();

        const fa12Address = 'KT1DovnD5m5yZsBns4AwDK2NdZMo7PCsz2oG';
        const fa2Address = 'KT1C7nJaJooKYY3E7XY2rLa1jKnQBqSx1SFQ';

        const fa12StorageUrl = `https://api.hangzhou2net.tzkt.io/v1/contracts/${fa12Address}/bigmaps/token_list/keys`;
        const fa2StorageUrl = `https://api.hangzhou2net.tzkt.io/v1/contracts/${fa2Address}/bigmaps/token_list/keys`;

        fa12Http.responseType = 'json';
        fa2Http.responseType = 'json';

        fa12Http.open('GET', fa12StorageUrl);
        fa2Http.open('GET', fa2StorageUrl);

        fa12Http.send();
        fa2Http.send();

        fa12Http.onreadystatechange = () => {
            if (fa12Http.response !== null) {
                const tokenList = fa12Http.response;
                console.log(tokenList);
                for (let i = 0; i < tokenList.length; i += 1) {
                    const token = {
                        token_weight: tokenList[i].value.weights.token_weight,
                        token_amount: tokenList[i].value.token_amount,
                        token_address: tokenList[i].value.token_address,
                        token_name: tokenList[i].value.token_name,
                        token_dec: tokenList[i].value.token_dec,
                        based_asset_weight: tokenList[i].value.weights.based_asset_weight,
                        based_asset_amount: tokenList[i].value.based_asset_amount,
                        based_asset_address: tokenList[i].value.based_asset_address,
                        based_asset_name: tokenList[i].value.based_asset_name,
                        based_asset_dec: tokenList[i].value.based_asset_dec,
                        id_fa2: null,
                        sale: tokenList[i].value.sale,
                        close_date: tokenList[i].value.close_date
                    };
                    storage.push(token);
                }
            }
        };

        fa2Http.onreadystatechange = () => {
            if (fa2Http.response !== null) {
                const tokenList = fa2Http.response;
                console.log(tokenList);
                for (let i = 0; i < tokenList.length; i += 1) {
                    const token = {
                        token_weight: tokenList[i].value.weights.token_weight,
                        token_amount: tokenList[i].value.token_amount,
                        token_address: tokenList[i].value.token_address,
                        token_name: tokenList[i].value.token_name,
                        token_dec: tokenList[i].value.token_dec,
                        based_asset_weight: tokenList[i].value.weights.based_asset_weight,
                        based_asset_amount: tokenList[i].value.based_asset_amount,
                        based_asset_address: tokenList[i].value.based_asset_address,
                        based_asset_name: tokenList[i].value.based_asset_name,
                        based_asset_dec: tokenList[i].value.based_asset_dec,
                        id_fa2: tokenList[i].value.id_fa2,
                        sale: tokenList[i].value.sale,
                        close_date: tokenList[i].value.close_date
                    };
                    storage.push(token);
                }
            }
        };

        console.log(storage);

        store.dispatch({
            type: 'initialiseTokenState',
            payload: storage
        });
    }, []);

    return (
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={themes(customization)}>
                <CssBaseline />
                <NavigationScroll>
                    <Routes />
                </NavigationScroll>
            </ThemeProvider>
        </StyledEngineProvider>
    );
};

export default App;
