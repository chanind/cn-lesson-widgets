/* @flow */

import React, { Component } from 'react';
import './index.css';
import { shuffleArray, times } from '../../utils';
import WordPart from './WordPart';


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
  wordPartBounds: {
    [number]: {
      width: number,
      height: number,
    }
  }
};

const updateWordPartBounds = (itemPos, bounds) => (
  (prevState: State, props: Props) => ({
    wordPartBounds: {...prevState.wordPartBounds, [itemPos]: bounds},
  })
);

// TODO: make this based on measurement
const CHOSEN_ITEMS_WIDTH = 580;
const CHOSEN_ITEMS_HEIGHT = 150;
const WIDGET_PADDING = 10;
const WORD_PART_SPACING = 10;
const LINE_HEIGHT = 50;


class TranslatorWidget extends Component<Props, State> {

  state = {
    chosenItems: [],
    wordBankPositions: [],
    wordPartBounds: {},
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

  onClickWordPart(itemPos: number) {
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
    if (response == '') return;
    const isCorrect = this.props.config.correctAnswers.indexOf(response) >= 0
    if (isCorrect && this.props.onCorrect) {
      this.props.onCorrect(response);
    } else if (!isCorrect && this.props.onMistake) {
      this.props.onMistake(response);
    }
  }

  isChosen(itemPos: number) {
    return this.state.chosenItems.indexOf(itemPos) >= 0;
  }

  getWordBankItems() {
    return this.state.wordBankPositions.filter(item => !this.isChosen(item));
  }

  getPreviousItems(itemPos: number) {
    if (this.isChosen(itemPos)) {
      return this.state.chosenItems.slice(0, this.state.chosenItems.indexOf(itemPos));
    }
    const wordBankItems = this.getWordBankItems();
    return wordBankItems.slice(0, wordBankItems.indexOf(itemPos));
  }

  boundsHaveLoaded() {
    for (let i = 0; i < this.props.config.scrambledParts.length; i++) {
      if (!this.state.wordPartBounds[i]) return false;
    }
    return true;
  }

  getChosenText() {
    return this.state.chosenItems.map(item => this.props.config.scrambledParts[item]).join('');
  }

  getWordPartStyle(itemPos: number) {
    if (!this.boundsHaveLoaded()) {
      return {visibility: 'hidden'};
    }

    const previousItems = this.getPreviousItems(itemPos);
    let row = 0;
    let offset = 0;
    previousItems.forEach(prevItemPos => {
      const bounds = this.state.wordPartBounds[prevItemPos];
      offset += bounds.width;
      if (offset > CHOSEN_ITEMS_WIDTH) {
        // wrap next line
        row += 1;
        offset = bounds.width + WORD_PART_SPACING;
      } else {
        offset += WORD_PART_SPACING;
      }
    });

    const curItemBounds = this.state.wordPartBounds[itemPos];
    if (offset + curItemBounds.width > CHOSEN_ITEMS_WIDTH) {
      row += 1;
      offset = 0;
    }
    return {
      transform: `translate3d(
        ${WIDGET_PADDING + offset}px,
        ${2 * WIDGET_PADDING + row * LINE_HEIGHT + (this.isChosen(itemPos) ? 0 : CHOSEN_ITEMS_HEIGHT)}px,
        0
      )`
    }
  }

  render() {
    return (
      <div className="TranslatorWidget">
        <div className="TranslatorWidget-prompt">{this.props.config.prompt}</div>
        <div className="TranslatorWidget-response">
          <div className="TranslatorWidget-chosenItems" style={{height: CHOSEN_ITEMS_HEIGHT}}>
              <div className="TranslatorWidget-line"></div>
              <div className="TranslatorWidget-line"></div>
          </div>
          <div className="TranslatorWidget-wordBank" />
          {this.state.wordBankPositions.map(itemPos => (
            <div
              className="TranslatorWidget-wordPart"
              key={itemPos}
              style={this.getWordPartStyle(itemPos)}
              onClick={() => this.onClickWordPart(itemPos)}
            >
              <WordPart
                text={this.props.config.scrambledParts[itemPos]}
                onUpdateBounds={bounds => this.setState(updateWordPartBounds(itemPos, bounds))}
              />
            </div>
          ))}
        </div>
        <div className="TranslatorWidget-checkResponse">
          <button
            className="TranslatorWidget-checkResponseButton"
            disabled={this.state.chosenItems.length === 0}
            onClick={() => this.onCheckResponse()}
          >
            Check answer
          </button>
        </div>
      </div>
    );
  }
}

export default TranslatorWidget;