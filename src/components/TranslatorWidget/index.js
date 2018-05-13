/* @flow */

import React, { Component } from 'react';
import './index.css';
import { shuffleArray, removeArrayItem } from '../../utils';
import WordPart from './WordPart';
import MeasurableDiv from './MeasurableDiv';
import type { positionDelta } from './DraggableDiv';
import DraggableDiv from './DraggableDiv';
import type { bounds } from './MeasurableDiv';
import classNames from 'classnames';

type position = {
  x: number,
  y: number,
};

type Props = {
  config: {
    prompt: string,
    correctAnswers: string[],
    scrambledParts: string[],
  },
  onCorrect?: (string) => void,
  onMistake?: (string) => void,
};

type State = {
  wordBankPositions: number[],
  chosenItems: number[],
  chosenItemsBounds: ?bounds,
  draggingItem: ?number,
  draggingItemPosDelta: ?positionDelta,
  wordPartBounds: { [number]: bounds },
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


class TranslatorWidget extends Component<Props, State> {

  state = {
    chosenItems: [],
    wordBankPositions: [],
    wordPartBounds: {},
    chosenItemsBounds: null,
    draggingItem: null,
    draggingItemPosDelta: null,
  };

  static getDerivedStateFromProps(nextProps: Props, prevState: State) {
    if (prevState.wordBankPositions.length !== nextProps.config.scrambledParts.length) {
      const wordBankPositions = shuffleArray(nextProps.config.scrambledParts.map((item, index) => index));
      return {
        chosenItems: [],
        wordBankPositions,
        wordPartBounds: {},
      };
    }
  }

  onClickWordPart = (itemPos: number) => {
    const chosenItemsCopy = this.state.chosenItems.slice(0);
    if (this.isChosen(itemPos)) {
      const chosenIndex = this.state.chosenItems.indexOf(itemPos);
      chosenItemsCopy.splice(chosenIndex, 1);
    } else {
      // add to the end of the list
      chosenItemsCopy.push(itemPos);

    }
    this.setState({chosenItems: chosenItemsCopy});
  }

  onCheckResponse() {
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

  onEndDragWord = (posDelta: positionDelta) => {
    const { chosenItemsBounds, draggingItem } = this.state;
    if (draggingItem == null || !chosenItemsBounds) return;
    let isDroppedOnChosenArea = false;
    const newChosenItems = removeArrayItem(this.state.chosenItems, draggingItem);
    for (let i = 0; i < this.state.chosenItems.length - 1; i++) {
      if (this.isDraggedItemOnChosenItemNum(i)) {
        newChosenItems.splice(i, 0, draggingItem);
        isDroppedOnChosenArea = true;
        break;
      }
    }
    if (!isDroppedOnChosenArea) {
      const draggedItemCenter = this.getDraggedItemCenter();
      if (
        draggedItemCenter.x > 0 &&
        draggedItemCenter.x < chosenItemsBounds.width &&
        draggedItemCenter.y > 0 &&
        draggedItemCenter.y < chosenItemsBounds.height
      ) {
        newChosenItems.push(draggingItem);
      }
    }
    this.setState({
      draggingItem: null,
      draggingItemPosDelta: null,
      chosenItems: newChosenItems,
    });
  }

  isChosen(itemPos: number) {
    return this.state.chosenItems.indexOf(itemPos) >= 0;
  }

  getWordBankItems() {
    return this.state.wordBankPositions.filter(item => !this.isChosen(item));
  }

  getPreviousItems(itemPos: number, ignorePhantomItem: boolean = false) {
    let items;
    const isItemChosen = this.isChosen(itemPos);

    if (isItemChosen) {
      items = this.state.chosenItems.slice(0, this.state.chosenItems.indexOf(itemPos));
    } else {
      const wordBankItems = this.getWordBankItems();
      items = wordBankItems.slice(0, wordBankItems.indexOf(itemPos));
    }
    const draggingItem = this.state.draggingItem;
    if (draggingItem != null) {
      items = removeArrayItem(items, draggingItem);

      if (isItemChosen && draggingItem !== itemPos && !ignorePhantomItem) {
        for (let i = 0; i < items.length + 1; i++) {
          if (this.isDraggedItemOnChosenItemNum(i)) {
            items.splice(i, 0, draggingItem);
            break;
          }
        }
      }
    }
    return items;
  }

  isDraggedItemOnChosenItemNum(chosenItemNum: number) {
    console.log(`is dragged on ${chosenItemNum}?`);
    const draggingItem = this.state.draggingItem;
    if (draggingItem == null) return false;
    const chosenItemAtPos = removeArrayItem(this.state.chosenItems, draggingItem)[chosenItemNum];
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
    if (!this.state.chosenItemsBounds) return false;
    for (let i = 0; i < this.props.config.scrambledParts.length; i++) {
      if (!this.state.wordPartBounds[i]) return false;
    }
    return true;
  }

  getChosenText() {
    return this.state.chosenItems.map(item => this.props.config.scrambledParts[item]).join('');
  }

  getItemPos(itemPos: number, ignorePhantomItem: boolean = false) {
    if (!this.boundsHaveLoaded()) return {x: 0, y: 0};

    // this check is just for flow, otherwise it's always going to be set due to the check above.
    const chosenItemsHeight = (this.state.chosenItemsBounds && this.state.chosenItemsBounds.height) || 0;
    const chosenItemsWidth = (this.state.chosenItemsBounds && this.state.chosenItemsBounds.width) || 0;

    const previousItems = this.getPreviousItems(itemPos, ignorePhantomItem);
    let row = 0;
    let offset = 0;
    previousItems.forEach(prevItemPos => {
      const bounds = this.state.wordPartBounds[prevItemPos];
      offset += bounds.width;
      if (offset > chosenItemsWidth) {
        // wrap next line
        row += 1;
        offset = bounds.width + WORD_PART_SPACING;
      } else {
        offset += WORD_PART_SPACING;
      }
    });

    const curItemBounds = this.state.wordPartBounds[itemPos];
    if (offset + curItemBounds.width > chosenItemsWidth) {
      row += 1;
      offset = 0;
    }

    let dragDelta: positionDelta = {xDelta: 0, yDelta: 0};
    if (this.state.draggingItem === itemPos && this.state.draggingItemPosDelta) {
      dragDelta = this.state.draggingItemPosDelta;
    }

    return {
      x: WIDGET_PADDING + offset + dragDelta.xDelta,
      y: 2 * WIDGET_PADDING + row * LINE_HEIGHT + (this.isChosen(itemPos) ? 0 : chosenItemsHeight) + dragDelta.yDelta,
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
      <div className="TranslatorWidget">
        <div className="TranslatorWidget-prompt">{this.props.config.prompt}</div>
        <div className="TranslatorWidget-response">
          <MeasurableDiv
            className="TranslatorWidget-chosenItems"
            style={{height: CHOSEN_ITEMS_HEIGHT}}
            onUpdateBounds={bounds => this.setState({chosenItemsBounds: bounds})}
          >
              <div className="TranslatorWidget-line"></div>
              <div className="TranslatorWidget-line"></div>
          </MeasurableDiv>
          <div className="TranslatorWidget-wordBank" />
          {this.state.wordBankPositions.map(itemPos => (
            <DraggableDiv
              className={classNames('TranslatorWidget-wordPart', {'is-dragging': this.state.draggingItem === itemPos})}
              key={itemPos}
              style={this.getWordPartStyle(itemPos)}
              onClick={() => this.onClickWordPart(itemPos)}
              onBeginDrag={(posDelta) => this.onBeginDragWord(itemPos, posDelta)}
              onContinueDrag={(posDelta) => this.onContinueDragWord(posDelta)}
              onEndDrag={(posDelta) => this.onEndDragWord(posDelta)}
            >
              <WordPart
                text={this.props.config.scrambledParts[itemPos]}
                onUpdateBounds={bounds => this.setState(updateWordPartBounds(itemPos, bounds))}
              />
            </DraggableDiv>
          ))}
        </div>
        <div className="TranslatorWidget-checkResponse">
          <button
            className="TranslatorWidget-checkResponseButton"
            disabled={this.state.chosenItems.length === 0}
            onClick={this.onCheckResponse}
          >
            Check answer
          </button>
        </div>
      </div>
    );
  }
}

export default TranslatorWidget;