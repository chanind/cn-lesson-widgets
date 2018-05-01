/* @flow */

import React, { Component } from 'react';
import Measure from 'react-measure';
import './WordPart.css'

type dimensions = {
  width: number,
  height: number,
};

type Props = {
  text: string,
  onUpdateBounds: (dimensions) => void
};


class WordPart extends Component<Props> {
  render() {
    return (
      <Measure bounds onResize={(contentRect) => this.props.onUpdateBounds(contentRect.bounds)}>
        {({ measureRef }) => (
          <div ref={measureRef} className="WordPart">
            {this.props.text}
          </div>
        )}
      </Measure>
    );
  }
}

export default WordPart;