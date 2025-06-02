import React from 'react';
import ReactDOM from 'react-dom';
import 'assets/css/App.css';
import { HashRouter, Route, Switch, Redirect } from 'react-router-dom';
import AuthLayout from 'layouts/auth';
import AdminLayout from 'layouts/admin';
import RtlLayout from 'layouts/rtl';
import { ChakraProvider } from '@chakra-ui/react';
import theme from 'theme/theme';
import { AssignmentProvider } from 'contexts/AssignmentContext';

const accessToken = localStorage.getItem('accessToken');
const initialRoute = accessToken ? '/admin' : '/auth'; // Determine initial route based on access token presence

ReactDOM.render(
    <ChakraProvider theme={theme}>
        <React.StrictMode>
            <AssignmentProvider>
                <HashRouter>
                    <Switch>
                        <Route path={`/auth`} component={AuthLayout} />
                        <Route path={`/admin`} component={AdminLayout} />
                        <Route path={`/rtl`} component={RtlLayout} />
                        <Redirect from='/' to={initialRoute} />
                    </Switch>
                </HashRouter>
            </AssignmentProvider>
        </React.StrictMode>
    </ChakraProvider>,
    document.getElementById('root')
);
