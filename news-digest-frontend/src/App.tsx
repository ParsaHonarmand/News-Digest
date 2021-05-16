import React from 'react';
import logo from './logo.svg';
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

const history = createBrowserHistory();
function App() {
  return (
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
  );
}

export default App;
