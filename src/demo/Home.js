/* @flow */

import React, { Component } from 'react';
import { Link } from "react-router-dom";
import './Home.css';

class Home extends Component<null> {
  render() {
    return (
      <div className="Home">
        <h2>Demos</h2>
        <ul className="Home-links">
          <li className="Home-link"><Link to="/demo/translator">Translator Widget</Link></li>
          <li className="Home-link"><Link to="/demo/word-order">Word Order Widget</Link></li>
        </ul>
      </div>
    );
  }
}

export default Home;