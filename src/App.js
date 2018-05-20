/* @flow */

import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";

import TranslatorWidgetDemo from './demo/TranslatorWidgetDemo';
import WordOrderWidgetDemo from './demo/WordOrderWidgetDemo';
import Home from './demo/Home';
import './App.css';

class App extends Component<null> {
  render() {
    return (
      <Router>
        <div className="App">
          <div className="App-widget">
            <Route exact path="/" component={Home} />
            <Route exact path="/demo/word-order" component={WordOrderWidgetDemo} />
            <Route exact path="/demo/translator" component={TranslatorWidgetDemo} />
          </div>
        </div>
      </Router>
    );
  }
}

export default App;
