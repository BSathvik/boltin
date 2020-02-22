import React from 'react';

import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";

import SubmitInvoice from './components/SubmitInvoice';
import ViewInvoice from './components/ViewInvoice';

import './App.css';

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
      </header>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <div className="page">
        <Router>
          <div className="container">
            <Switch>
              <Route exact path={"/:id"} component={ViewInvoice}/>
              <Route exact path="/">
                <SubmitInvoice />
              </Route>
              <Route path="/">
                <h1>404 Not Found</h1>
              </Route>
            </Switch>
          </div>
        </Router>
      </div>
    </div>
  );
}

export default App;
