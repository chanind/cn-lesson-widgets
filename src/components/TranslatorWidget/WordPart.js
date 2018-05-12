/* @flow */

import React, { Component } from 'react';
import MeasurableDiv from './MeasurableDiv';
import type { onUpdateBounds } from './MeasurableDiv';
import './WordPart.css'

type Props = {
  text: string,
  onUpdateBounds: onUpdateBounds,
};


class WordPart extends Component<Props> {
  render() {
    return (
      <MeasurableDiv onUpdateBounds={this.props.onUpdateBounds} className="WordPart">
        {this.props.text}
      </MeasurableDiv>
    );
  }
}

export default WordPart;