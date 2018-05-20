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
  onEndDrag?: () => void,
  onClick?: () => void,
  children?: Node,
};

type State = {
  dragStartTime: ?number,
  dragStartPos: ?position,
};

const DRAG_TIME_THRESH = 300;

const extractMouseEvtPos = (handler: (clientX: number, clientY: number) => void, preventDefault = false) => {
  return (evt: SyntheticMouseEvent<HTMLDivElement>) => {
    if (preventDefault) evt.preventDefault();
    handler(evt.clientX, evt.clientY);
  }
};

const extractTouchEvtPos = (handler: (clientX: number, clientY: number) => void, preventDefault = false) => {
  return (evt: SyntheticTouchEvent<HTMLDivElement>) => {
    if (preventDefault) evt.preventDefault();
    handler(evt.touches[0].clientX, evt.touches[0].clientY);
  }
};


class DraggableDiv extends Component<Props, State> {

  elm = React.createRef();

  state = {
    dragStartTime: null,
    dragStartPos: null,
  };

  getPositionDelta = (curX: number, curY: number) => ({
    xDelta: curX - ((this.state.dragStartPos && this.state.dragStartPos.x) || 0),
    yDelta: curY - ((this.state.dragStartPos && this.state.dragStartPos.y) || 0),
  });

  onDragDown = (clientX: number, clientY: number) => {
    this.setState({
      dragStartTime: global.performance.now(),
      dragStartPos: {
        x: clientX,
        y: clientY,
      },
    });
    this.removeGlobalListeners();
    global.document.body.addEventListener('mousemove', this.onMouseMove);
    global.document.body.addEventListener('touchmove', this.onTouchMove);
    global.document.body.addEventListener('mouseup', this.onDragEnd);
    global.document.body.addEventListener('touchend', this.onDragEnd);
    if (this.props.onBeginDrag) this.props.onBeginDrag.call(null, {xDelta: 0, yDelta: 0});
  };

  onDragMove = (clientX: number, clientY: number) => {
    if (!this.isDragging()) return;
    if (this.props.onContinueDrag) {
      this.props.onContinueDrag.call(null, this.getPositionDelta(clientX, clientY));
    }
  };

  onDragEnd = (evt: SyntheticEvent<HTMLDivElement>) => {
    evt.preventDefault();
    this.removeGlobalListeners();
    if (!this.isDragging()) return;
    if (this.props.onEndDrag) {
      this.props.onEndDrag.call(null);
    }
    const dragTimeDelta = global.performance.now() - (this.state.dragStartTime || 0);
    if (dragTimeDelta < DRAG_TIME_THRESH) {
      this.props.onClick && this.props.onClick();
    }
    this.setState({
      dragStartTime: null,
      dragStartPos: null,
    });
  };

  onMouseDown = extractMouseEvtPos(this.onDragDown, true)
  onTouchStart = extractTouchEvtPos(this.onDragDown, true)
  onMouseMove = extractMouseEvtPos(this.onDragMove);
  onTouchMove = extractTouchEvtPos(this.onDragMove);

  isDragging() {
    return this.state.dragStartTime !== null;
  }

  removeGlobalListeners() {
    global.document.body.removeEventListener('mousemove', this.onMouseMove);
    global.document.body.removeEventListener('touchmove', this.onTouchMove);
    global.document.body.removeEventListener('mouseup', this.onDragEnd);
    global.document.body.removeEventListener('touchend', this.onDragEnd);
  }

  componentDidMount() {
    // need to attach touchstart here because of https://github.com/facebook/react/issues/8968
    if (this.elm.current) {
      this.elm.current.addEventListener('touchstart', this.onTouchStart, {passive: false});
    }
  }

  render() {
    const { children, onBeginDrag, onContinueDrag, onEndDrag, onClick, ...otherProps } = this.props;
    return (
      <div
        ref={this.elm}
        onMouseDown={this.onMouseDown}
        onMouseUp={evt => this.isDragging() ? evt.stopPropagation() : null}
        onTouchEnd={evt => this.isDragging() ? evt.stopPropagation() : null}
        {...otherProps}
      >
        {children}
      </div>
    );
  }
}

export default DraggableDiv;