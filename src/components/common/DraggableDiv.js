/* @flow */

import React, { Component } from 'react';
import type { Node } from 'react';

export type positionDelta = {
  xDelta: number,
  yDelta: number,
};

type position = {
  x: number,
  y: number,
};

type Props = {
  onBeginDrag?: (positionDelta) => void,
  onContinueDrag?: (positionDelta) => void,
  onEndDrag?: (positionDelta) => void,
  onClick?: (SyntheticMouseEvent<HTMLDivElement>) => void,
  children?: Node,
};

type State = {
  dragStartTime: ?number,
  dragStartPos: ?position,
};

// If a click is triggered and the element was dragged less than this dist, allow the click to go through
const DRAG_DIST_CLICK_THRESH = 5;
const DRAG_TIME_THRESH = 300;


class DraggableDiv extends Component<Props, State> {

  state = {
    dragStartTime: null,
    dragStartPos: null,
  };

  getPositionDelta = (curX: number, curY: number) => ({
    xDelta: curX - ((this.state.dragStartPos && this.state.dragStartPos.x) || 0),
    yDelta: curY - ((this.state.dragStartPos && this.state.dragStartPos.y) || 0),
  });

  onMouseDown = (evt: SyntheticMouseEvent<HTMLDivElement>) => {
    evt.preventDefault();
    this.setState({
      dragStartTime: global.performance.now(),
      dragStartPos: {
        x: evt.clientX,
        y: evt.clientY,
      },
    });
    this.removeGlobalListeners();
    global.document.body.addEventListener('mousemove', this.onMouseMove);
    global.document.body.addEventListener('mouseup', this.onMouseUp);
    if (this.props.onBeginDrag) this.props.onBeginDrag.call(null, {xDelta: 0, yDelta: 0});
  };

  onMouseMove = (evt: SyntheticMouseEvent<HTMLDivElement>) => {
    if (!this.isDragging()) return;
    evt.preventDefault();
    if (this.props.onContinueDrag) {
      this.props.onContinueDrag.call(null, this.getPositionDelta(evt.clientX, evt.clientY));
    }
  };

  onMouseUp = (evt: SyntheticMouseEvent<HTMLDivElement>) => {
    this.removeGlobalListeners();
    if (!this.isDragging()) return;
    evt.preventDefault();
    const posDelta = this.getPositionDelta(evt.clientX, evt.clientY);
    if (this.props.onEndDrag) {
      this.props.onEndDrag.call(null, posDelta);
    }
    const dragTimeDelta = global.performance.now() - (this.state.dragStartTime || 0);
    if (
      posDelta.xDelta < DRAG_DIST_CLICK_THRESH &&
      posDelta.yDelta < DRAG_DIST_CLICK_THRESH &&
      dragTimeDelta < DRAG_TIME_THRESH
    ) {
      this.props.onClick && this.props.onClick(evt);
    }
    this.setState({
      dragStartTime: null,
      dragStartPos: null,
    });
  };

  isDragging() {
    return this.state.dragStartTime !== null;
  }

  removeGlobalListeners() {
    global.document.body.removeEventListener('mousemove', this.onMouseMove);
    global.document.body.removeEventListener('mouseup', this.onMouseUp);
  }

  render() {
    const { children, onBeginDrag, onContinueDrag, onEndDrag, onClick, ...otherProps } = this.props;
    return (
      <div
        onMouseDown={this.onMouseDown}
        onMouseUp={evt => this.isDragging() ? evt.stopPropagation() : null}
        {...otherProps}
      >
        {children}
      </div>
    );
  }
}

export default DraggableDiv;