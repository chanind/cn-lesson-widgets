/* @flow */

import React, { Component } from 'react';
import TranslatorWidget from '../components/TranslatorWidget';

class TranslatorWidgetDemo extends Component<null> {
  render() {
    return (
      <TranslatorWidget
        config={{
          prompt: 'How is the weather today?',
          correctAnswers: ['今天天气怎么样？', '今天天气怎样？'],
          scrambledParts: ['今','天','天','气','怎','么','样','？','明','田','七'],
        }}
        onCorrect={() => alert('Correct! :D')}
        onMistake={() => alert('Wrong. :X')}
      />
    );
  }
}

export default TranslatorWidgetDemo;