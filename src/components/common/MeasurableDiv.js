/* @flow */

import React from 'react';
import type { Node } from 'react';
import Measure from 'react-measure';

export type bounds = {
  width: number,
  height: number,
};

export type onUpdateBounds = (bounds) => void;

type Props = {
  onUpdateBounds?: onUpdateBounds,
  children?: Node,
};


export default (props: Props) => {
  const { children, onUpdateBounds, ...otherProps} = props;
  return (
    <Measure bounds onResize={(contentRect) => onUpdateBounds && onUpdateBounds(contentRect.bounds)}>
      {({ measureRef }) => (
        <div ref={measureRef} {...otherProps}>
          {children}
        </div>
      )}
    </Measure>
  );
}