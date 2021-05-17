import React from 'react';
import './App.css';
import Login from './components/Login'
import SignUp from './components/SignUp'
import Home from './components/home/Home'
import AddDigest from './components/home/AddDigest'
import ViewDigest from './components/home/ViewDigest'
import {
  Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import { createBrowserHistory } from "history";

import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme({
  typography: {
    fontFamily: [
      'Lora',
      'sans-serif',
    ].join(','),
  },});

const history = createBrowserHistory();
function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router history={history}>
        <div>
          <header className="App-header">
            <Switch>
              <Route path="/login">
                <Login />
              </Route>
              <Route path="/home">
                <Home />
              </Route>
              <Route path="/signup">
                <SignUp />
              </Route>
              <Route path="/addDigest">
                <AddDigest />
              </Route>
              <Route 
                path="/digest/:id" 
                render={(props) => <ViewDigest {...props} />} 
              />
              <Route path="/">
                <Login />
              </Route>
            </Switch>
          </header>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
