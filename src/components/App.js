////////////////////////////////////////////////////////////////////////////////
// APP.JS /////////////////////////////////////////////////////////////////////
// This component sets the stage for Mars Map Maker///////////////////////////
// It renders our three main components (FileIn.js, Dialog.js, CardList.js)//
// Which act as the entire application itself //////////////////////////////
///////////////////////////////////////////////////////////////////////////

import React from "react";
import mars from "../icons/mars.png";
import classNames from "classnames";
// COMPONENTS
import CardList from "./CardList";
import FileIn from "./FileIn";
import Dialog from "./Dialog";
// REDUX
import { connect } from "react-redux";
import { changeInit, initToggle } from "../actions/";

/////////////////////////////////////////////////////////
////////////////////////////////////////////////////////

export class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      toggleValueLength: 0,
      emptyCards: [],
      toggleValuesArr: null,
      mapPreview: null,
      isOpened: props.hasBeenOpened,
      jsFile: undefined,
      fieldNames: [],
      fieldValues: [],
      continue: false,
      forceTitles: [],
      forceValues: []
    };
  }

  // removes duplicates in an array
  findDuplicates = names => {
    let arr = [];
    let final;
    let i;
    let j;

    for (i = 0; i < names.length; i++) {
      for (j = 0; j < names.length; j++) {
        if (i !== j && !arr.includes(names[i])) {
          if (names[i] === names[j]) {
            arr = arr.concat(names[i]);
          }
        }
      }
    }
    final = arr;
    return final;
  };

  // removes duplicates from array
  removeDuplicates = (nameArr, valueArr) => {
    let names = nameArr;
    let values = valueArr;
    let i;
    let duplicateArr;
    let final;

    duplicateArr = this.findDuplicates(nameArr, valueArr);

    for (i = nameArr.length - 1; i >= 0; i--) {
      if (duplicateArr.includes(nameArr[i])) {
        duplicateArr.splice(duplicateArr.indexOf(nameArr[i]), 1);
        names.splice(i, 1);
        values.splice(i, 1);
      }
    }

    final = [names, values];

    return final;
  };

  // callback function that retrieves data from file, passed through FileIn.js
  // sets state of the the fieldNames, and fieldValues arrays used throughout program
  fileCallback = (
    datafromFile,
    totalSize,
    toggleValues,
    jsFile,
    numOfEmptyCards,
    forceTitles,
    forceValues
  ) => {
    let newCardObj = {};
    let tValues = toggleValues;

    for (let j = 0; j < numOfEmptyCards; j++) {
      newCardObj[j + "<METADATA_ADD>"] = "";
    }
    console.log(newCardObj);
    for (let i = 0; i < tValues.length; i++) {
      tValues[i] = { ...newCardObj, ...tValues[i] };
    }

    this.setState({
      emptyCards: Array(numOfEmptyCards).fill("<METADATA_ADD>")
    });
    let currentComponent = this;
    let newNames;
    let newValues;
    let processedValues;
    const toggleObj = {
      arr: tValues
    };
    const obj = {
      bool: true
    };

    this.setState({ jsFile: jsFile });

    this.props.initToggle(toggleObj);

    newNames = this.state.fieldNames.slice();
    newNames = newNames.concat(datafromFile[0]);

    newValues = this.state.fieldValues;
    newValues = newValues.concat(datafromFile[1]);

    processedValues = this.removeDuplicates(newNames, newValues);

    currentComponent.setState({
      toggleValueLength: tValues.length,
      fieldNames: processedValues[0],
      fieldValues: processedValues[1],
      continue: true,
      forceTitles: forceTitles,
      forceValues: forceValues
    });

    if (
      this.state.fieldNames.length -
        this.findDuplicates(newNames, newValues).length ===
      totalSize - this.findDuplicates(newNames, newValues).length
    ) {
      this.props.changeInit(obj);
    } else this.props.changeInit(obj);
  };

  // Displays "Preview Pop Up function from cardList, when the Preview Map button is clicked"
  isOpenCallback = data => {
    let currentComponent = this;
    currentComponent.setState({
      isOpened: true,
      mapPreview: data.join("\n")
    });
  };

  createSquiggleArray = () => {
    let arr = [];
    for (let i = 0; i < this.state.emptyCards.length; i++) {
      let placeHolderValue = "_";
      if (i === 0) {
        placeHolderValue = "Required Field";
      }
      arr.push(placeHolderValue);
    }
    return arr;
  };

  // React says we have to define render!! You have to display JSX!
  render() {
    let readerClass = classNames({
      "mars-photo": this.state.continue === false,
      "mars-photo_hide": this.state.continue === true
    });

    return (
      <div style={{ height: "100vh", position: "relative" }}>
        <div className={readerClass}>
          <FileIn testID="FileIn" callbackFromParent={this.fileCallback} />
        </div>
        {this.state.isOpened ? (
          <Dialog
            isOpen={this.state.isOpened}
            onClose={e => this.setState({ isOpened: false })}
          >
            {this.state.mapPreview.split("\n").map(mapping => {
              return <div>{mapping}</div>;
            })}
          </Dialog>
        ) : null}
        {this.state.continue ? (
          <CardList
            tValLength={this.state.toggleValueLength}
            jsFileValues={this.state.jsFile}
            callback={this.isOpenCallback}
            fields={[...this.state.emptyCards, ...this.state.fieldNames]}
            toggleVals={this.state.toggleValuesArr}
            fieldVal={[
              ...this.createSquiggleArray(),
              ...this.state.fieldValues
            ]}
            forceTitles={this.state.forceTitles}
            forceValues={this.state.forceValues}
          />
        ) : null}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    ent: state.entries,
    hasBeenOpened: state.isOpen,
    toggleArr: state.toggleArr
  };
};

export default connect(
  mapStateToProps,
  { changeInit, initToggle }
)(App);
