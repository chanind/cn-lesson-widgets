/* @flow */

import React, { Component } from 'react';
import './index.css';
import { shuffleArray, removeArrayItem } from '../../utils';
import WordPart from '../common/WordPart';
import MeasurableDiv from '../common/MeasurableDiv';
import type { bounds } from '../common/MeasurableDiv';
import DraggableDiv from '../common/DraggableDiv';
import type { positionDelta } from '../common/DraggableDiv';
import classNames from 'classnames';

type position = {
  x: number,
  y: number,
};

type Props = {
  config: {
    correctAnswers: string[],
    scrambledParts: string[],
  },
  onCorrect?: (string) => void,
  onMistake?: (string) => void,
};

type State = {
  wordPartPositions: number[],
  containerBounds: ?bounds,
  draggingItem: ?number,
  draggingItemPosDelta: ?positionDelta,
  wordPartBounds: { [number]: bounds },
  scrambledParts: ?string[],
};

const updateWordPartBounds = (itemPos, bounds) => (
  (prevState: State, props: Props) => ({
    wordPartBounds: {...prevState.wordPartBounds, [itemPos]: bounds},
  })
);

// TODO: make this based on measurement
const CHOSEN_ITEMS_HEIGHT = 150;
const WIDGET_PADDING = 10;
const WORD_PART_SPACING = 10;
const LINE_HEIGHT = 50;


class WordOrderWidget extends Component<Props, State> {

  state = {
    wordPartPositions: [],
    containerBounds: null,
    wordPartBounds: {},
    draggingItem: null,
    draggingItemPosDelta: null,
    scrambledParts: null,
  };

  static getDerivedStateFromProps(nextProps: Props, prevState: State) {
    if (prevState.scrambledParts !== nextProps.config.scrambledParts) {
      const wordPartPositions = shuffleArray(nextProps.config.scrambledParts.map((item, index) => index));
      return {
        wordPartPositions,
        wordPartBounds: {},
        scrambledParts: nextProps.config.scrambledParts,
      };
    }
  }

  onCheckResponse = () => {
    const response = this.getChosenText();
    if (response === '') return;
    const isCorrect = this.props.config.correctAnswers.indexOf(response) >= 0
    if (isCorrect && this.props.onCorrect) {
      this.props.onCorrect(response);
    } else if (!isCorrect && this.props.onMistake) {
      this.props.onMistake(response);
    }
  }

  onBeginDragWord = (itemPos: number, posDelta: positionDelta) => {
    this.setState({ draggingItem: itemPos, draggingItemPosDelta: posDelta });
  }

  onContinueDragWord = (posDelta: positionDelta) => {
    this.setState({ draggingItemPosDelta: posDelta });
  }

  onEndDragWord = () => {
    const { containerBounds, draggingItem } = this.state;
    if (draggingItem == null || !containerBounds) return;
    let isDroppedOnChosenArea = false;
    const newWordPartPositions = removeArrayItem(this.state.wordPartPositions, draggingItem);
    for (let i = 0; i < this.state.wordPartPositions.length - 1; i++) {
      if (this.isDraggedItemOnItemNum(i)) {
        newWordPartPositions.splice(i, 0, draggingItem);
        isDroppedOnChosenArea = true;
        break;
      }
    }
    if (!isDroppedOnChosenArea) {
      const draggedItemCenter = this.getDraggedItemCenter();
      if (
        draggedItemCenter.x > 0 &&
        draggedItemCenter.x < containerBounds.width &&
        draggedItemCenter.y > 0 &&
        draggedItemCenter.y < containerBounds.height
      ) {
        newWordPartPositions.push(draggingItem);
      }
    }
    this.setState({
      draggingItem: null,
      draggingItemPosDelta: null,
      wordPartPositions: newWordPartPositions,
    });
  }

  getPreviousItems(itemPos: number, ignorePhantomItem: boolean = false) {
    let items = this.state.wordPartPositions.slice(0, this.state.wordPartPositions.indexOf(itemPos));
    const draggingItem = this.state.draggingItem;
    if (draggingItem != null) {
      items = removeArrayItem(items, draggingItem);

      if (draggingItem !== itemPos && !ignorePhantomItem) {
        for (let i = 0; i < items.length + 1; i++) {
          if (this.isDraggedItemOnItemNum(i)) {
            items.splice(i, 0, draggingItem);
            break;
          }
        }
      }
    }
    return items;
  }

  isDraggedItemOnItemNum(chosenItemNum: number) {
    const draggingItem = this.state.draggingItem;
    if (draggingItem == null) return false;
    const chosenItemAtPos = removeArrayItem(this.state.wordPartPositions, draggingItem)[chosenItemNum];
    const chosenItemPos = this.getItemPos(chosenItemAtPos, true);

    const draggedItemBounds = this.state.wordPartBounds[draggingItem];
    const draggedItemCenter = this.getDraggedItemCenter();
    return (
      draggedItemCenter.x > chosenItemPos.x - WORD_PART_SPACING / 2 &&
      draggedItemCenter.x < chosenItemPos.x + draggedItemBounds.width + WORD_PART_SPACING / 2 &&
      draggedItemCenter.y > chosenItemPos.y - WORD_PART_SPACING / 2 &&
      draggedItemCenter.y < chosenItemPos.y + draggedItemBounds.height + WORD_PART_SPACING / 2
    );
  }

  getDraggedItemCenter():position {
    const draggingItem = this.state.draggingItem;
    if (draggingItem == null) return {x: 0, y: 0};
    const draggedItemBounds = this.state.wordPartBounds[draggingItem];
    const draggedItemPos = this.getItemPos(draggingItem, true);
    return {
      x: draggedItemPos.x + draggedItemBounds.width / 2,
      y: draggedItemPos.y + draggedItemBounds.height / 2,
    };
  }

  boundsHaveLoaded() {
    if (!this.state.containerBounds) return false;
    for (let i = 0; i < this.props.config.scrambledParts.length; i++) {
      if (!this.state.wordPartBounds[i]) return false;
    }
    return true;
  }

  getChosenText() {
    const scrambledParts = this.state.scrambledParts || [];
    return this.state.wordPartPositions.map(item => scrambledParts[item]).join('');
  }

  getItemPos(itemPos: number, ignorePhantomItem: boolean = false) {
    if (!this.boundsHaveLoaded()) return {x: 0, y: 0};

    // this check is just for flow, otherwise it's always going to be set due to the check above.
    const wordPartPositionsWidth = (this.state.containerBounds && this.state.containerBounds.width) || 0;

    const previousItems = this.getPreviousItems(itemPos, ignorePhantomItem);
    let row = 0;
    let offset = 0;
    previousItems.forEach(prevItemPos => {
      const bounds = this.state.wordPartBounds[prevItemPos];
      offset += bounds.width;
      if (offset > wordPartPositionsWidth) {
        // wrap next line
        row += 1;
        offset = bounds.width + WORD_PART_SPACING;
      } else {
        offset += WORD_PART_SPACING;
      }
    });

    const curItemBounds = this.state.wordPartBounds[itemPos];
    if (offset + curItemBounds.width > wordPartPositionsWidth) {
      row += 1;
      offset = 0;
    }

    let dragDelta: positionDelta = {xDelta: 0, yDelta: 0};
    if (this.state.draggingItem === itemPos && this.state.draggingItemPosDelta) {
      dragDelta = this.state.draggingItemPosDelta;
    }

    return {
      x: WIDGET_PADDING + offset + dragDelta.xDelta,
      y: WIDGET_PADDING + row * LINE_HEIGHT + dragDelta.yDelta,
    }
  }

  getWordPartStyle(itemPos: number) {
    if (!this.boundsHaveLoaded()) {
      return {visibility: 'hidden'};
    }
    const {x, y} = this.getItemPos(itemPos);
    return { transform: `translate3d(${x}px, ${y}px, 0)` };
  }

  render() {
    return (
      <div className="WordOrderWidget">
        <div className="WordOrderWidget-response">
          <MeasurableDiv
            className="WordOrderWidget-wordPartPositions"
            style={{height: CHOSEN_ITEMS_HEIGHT}}
            onUpdateBounds={bounds => this.setState({containerBounds: bounds})}
          >
              <div className="WordOrderWidget-line"></div>
              <div className="WordOrderWidget-line"></div>
          </MeasurableDiv>
          {this.state.wordPartPositions.map(itemPos => (
            <DraggableDiv
              className={classNames('WordOrderWidget-wordPart', {'is-dragging': this.state.draggingItem === itemPos})}
              key={itemPos}
              style={this.getWordPartStyle(itemPos)}
              onBeginDrag={(posDelta) => this.onBeginDragWord(itemPos, posDelta)}
              onContinueDrag={(posDelta) => this.onContinueDragWord(posDelta)}
              onEndDrag={this.onEndDragWord}
            >
              <WordPart
                text={this.props.config.scrambledParts[itemPos]}
                onUpdateBounds={bounds => this.setState(updateWordPartBounds(itemPos, bounds))}
              />
            </DraggableDiv>
          ))}
        </div>
        <div className="WordOrderWidget-checkResponse">
          <button
            className="WordOrderWidget-checkResponseButton"
            disabled={this.state.wordPartPositions.length === 0}
            onClick={this.onCheckResponse}
          >
            Check answer
          </button>
        </div>
      </div>
    );
  }
}

export default WordOrderWidget;