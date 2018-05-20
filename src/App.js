/* @flow */

import React, { Component } from 'react';
// import TranslatorWidget from './components/TranslatorWidget';
import WordOrderWidget from './components/WordOrderWidget';
import './App.css';

class App extends Component<null> {
  render() {
    return (
      <div className="App">
        <div className="App-widget">
          <WordOrderWidget
            config={{
              correctAnswers: ['你好吗？'],
              scrambledParts: ['你', '好', '吗', '？'],
            }}
            onCorrect={() => alert('Correct! :D')}
            onMistake={() => alert('Wrong. :X')}
          />
        </div>
      </div>
    );
  }
}

export default App;
