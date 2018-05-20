/* @flow */

import React, { Component } from 'react';
import WordOrderWidget from '../components/WordOrderWidget';

class WordOrderWidgetDemo extends Component<null> {
  render() {
    return (
      <WordOrderWidget
        config={{
          correctAnswers: ['你都不带脑子来上课吗？'],
          scrambledParts: ['你','都','不','带','脑子','来','上课','吗','？'],
        }}
        onCorrect={() => alert('Correct! :D')}
        onMistake={() => alert('Wrong. :X')}
      />
    );
  }
}

export default WordOrderWidgetDemo;