/*!

=========================================================
* Material Dashboard React - v1.10.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2021 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/material-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'



import 'assets/css/material-dashboard-react.css?v=1.10.0'
import { ThemeProvider } from '@material-ui/core'
import theme from 'theme'

//redux
import { store } from './store'
import { Provider } from 'react-redux'
import { createBrowserHistory } from "history";
import Router from 'router'
import "./styles.css"

export const history = createBrowserHistory();

window.process = {}

ReactDOM.render(
    <Provider store={store}>
        <ThemeProvider theme={theme}>
            <BrowserRouter history={history}>
                <Router />
            </BrowserRouter>
        </ThemeProvider>
    </Provider>,
    document.getElementById('root')
)
