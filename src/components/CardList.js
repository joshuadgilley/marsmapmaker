///////////////////////////////////////////////////////////////////////////////////
// CARDLIST.JS ///////////////////////////////////////////////////////////////////
// This component takes data from App.js and creates the cards displayed in UI //
// Renders and creates the toolbar and the fieldCards displayed in UI //////////
///////////////////////////////////////////////////////////////////////////////

import React, { useState, useEffect } from "react";
import { connect } from "react-redux";

// COMPONENTS
import MapOutput from "./MapOutput";
import DateDropdown from "./DateDropdown";
import CenturyDropDown from "./CenturyDropDown";
import FieldCard from "./FieldCard";

// CSS & Style
import "./App.scss";

// REDUX
import { firstState, toggleInUse } from "../actions/";
import * as helpers from "../util/helper";
///////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////

// there is a particular relationship between checked value and available option in dropdown

const CardList = props => {
  // global variables for the Object Array the Redux Store is built on along with the id accumulator

  const objArray = [];
  const useOnce = [];
  let newKey = -1;

  // an array of date option objects to choose from in the date dropdown
  const { dateFormatOption } = require("./sesarOptions");

  const [lastMetaDataAdd, incrementMetaDataAdd] = useState(3);
  const [fieldsState, addAFieldCardHead] = useState(props.fields);

  const [fieldValState, addAFieldCardVal] = useState(props.fieldVal);

  // used to hide 'non-green / non-checked fields in the UI (hides field and checks)
  const [hide, setHide] = useState(false);

  // used to toggle between the tuples of the csv loaded in
  const [toggleIndex, addToToggleIndex] = useState(1);

  const [addingCard, clickingAddCard] = useState(false);

  // helper function to dicide the the contents of dropdowns for specific fieldcards
  // if fieldValue contains "0-9 or symbols" it's 'type' will be numbers, else, the type is text

  // maps through fields and creates unique field card entry for each
  // hiding: value to hide entry or not
  // fieldTitle: column attribute of an entry
  // fieldType: defines if content is number or text
  // fieldValue: the content of an column attribute
  // hasContent: for initial filtering of checked cards
  // goes to the next row of content in the csv

  const rightArrowToggle = () => {
    if (toggleIndex < props.tValLength) {
      addToToggleIndex((toggleIndex + 1) % props.tValLength);
      let obj = {
        bool: true
      };
      props.toggleInUse(obj);
    }
  };

  // goes to the previous row of content in the csv
  const leftArrowToggle = () => {
    if (toggleIndex > 1) {
      addToToggleIndex((toggleIndex - 1) % props.toggleArr.length);
      let obj = {
        bool: true
      };
      props.toggleInUse(obj);
    }
    console.log(props.jsFileValues);
  };

  // returns to the first row of content in the csv
  const refreshButton = () => {
    addToToggleIndex(1);
    let obj = {
      bool: true
    };
    props.toggleInUse(obj);
  };

  // if a map (js) file is passed in, it searches for previous selections made to update the Redux store accordingly
  const findSesarPassIn = field => {
    let sesarPassIn = "";
    if (props.jsFileValues !== undefined) {
      for (let i = 0; i < props.jsFileValues.length; i++) {
        if (
          props.jsFileValues[i][1] !== undefined &&
          field === props.jsFileValues[i][1].replace(" ", "")
        ) {
          sesarPassIn = props.jsFileValues[i][0];
        }
      }
    }

    return sesarPassIn;
  };

  const valueIsInJsMappingFile = field => {
    let valid = false;
    if (props.jsFileValues !== undefined) {
      for (let i = 0; i < props.jsFileValues.length; i++) {
        if (props.jsFileValues[i][1] === field) valid = true;
      }
    }

    return valid;
  };

  // maps content to separate fieldcards on the screen
  const fields = fieldsState.map(field => {
    newKey += 1;
    let storedValue = {};
    let sesarFind = findSesarPassIn(field);
    let fieldContentValue;
    let forcedIndex = -1;

    //hardcoded <METADATA_ADD> number 4
    //if metadata add else find where metadata index is
    if (newKey < 4 && props.jsFileValues !== undefined) {
      sesarFind = props.forceValues[newKey];
      forcedIndex = newKey;
    } else {
      forcedIndex = props.forceTitles.indexOf(field);
    }

    //if not metadata or metadata add
    if (forcedIndex === -1) {
      storedValue = {
        id: newKey,
        sesarTitle: sesarFind,
        oldValue: fieldValState[newKey],
        value: fieldValState[newKey],
        // this used to be id
        header: field,
        isDate: false,
        isMeasurement: false,
        isGreen: fieldValState[newKey] !== "" || valueIsInJsMappingFile(field)
      };
      fieldContentValue = fieldValState[newKey];
    } else {
      //if metadata
      if (newKey > lastMetaDataAdd) {
        storedValue = {
          id: newKey,
          sesarTitle: sesarFind,
          oldValue: fieldValState[newKey],
          value: props.forceValues[forcedIndex],
          header: "<METADATA>",
          isDate: false,
          isMeasurement: false,
          isGreen: fieldValState[newKey] !== "" || valueIsInJsMappingFile(field)
        };
        fieldContentValue = props.forceValues[forcedIndex];
      } else {
        if (
          newKey < props.persist.length &&
          props.persist[newKey].isMetaDataAdd
        ) {
          storedValue = {
            id: newKey,
            sesarTitle: props.persist[newKey].sesar,
            oldValue: fieldValState[newKey],
            value: props.forceValues[forcedIndex],
            header: "<METADATA_ADD>",
            isDate: false,
            isMeasurement: false,
            isGreen:
              fieldValState[newKey] !== "" || valueIsInJsMappingFile(field)
          };
        } else {
          storedValue = {
            id: newKey,
            sesarTitle: "",
            oldValue: fieldValState[newKey],
            value: props.forceValues[forcedIndex],
            header: "<METADATA_ADD>",
            isDate: false,
            isMeasurement: false,
            isGreen:
              fieldValState[newKey] !== "" || valueIsInJsMappingFile(field)
          };
        }
        fieldContentValue = props.forceValues[forcedIndex];
      }
    }

    //create an object and add it to store

    // after object is created, append it to the object array & add one to the ID
    useOnce.push("");
    objArray.push(storedValue);

    const findOneToTwo = () => {
      if (props.hasInit) {
        let objects = [
          "size",
          "description",
          "sample_comment",
          "geological_age",
          "field_name"
        ];
        for (let j = 0; j < objects.length; j++) {
          let count = 0;
          if (objects[j] === props.ent[newKey].sesarTitle) {
            for (let i = 0; i < props.ent.length; i++) {
              if (props.ent[i].sesarTitle === objects[j]) {
                count += 1;
              }
            }

            return count;
          }
        }
      }
    };

    // create the FieldCard that you see in the UI
    // If toggleIndex is 0 then we're on the 1st row so give it raw input
    // Else give it the object.values..
    // Meaning refer to Sample Row array created in store
    if (toggleIndex === 1) {
      return (
        <FieldCard
          multiCount={props.multiCount}
          jsFileValues={props.jsFileValues}
          toggleInUse={props.usingToggle}
          key={newKey}
          hiding={hide}
          fieldTitle={field}
          oneOfTwoID={findOneToTwo()}
          id={newKey}
          fieldType={helpers.typeField(newKey, lastMetaDataAdd)}
          fieldValue={Object.values(props.toggleArr[toggleIndex])[newKey]}
          hasContent={
            props.fieldVal[newKey] !== "" || valueIsInJsMappingFile(field)
          }
        />
      );
    } else {
      return (
        <FieldCard
          multiCount={props.multiCount}
          jsFileValues={props.jsFileValues}
          toggleInUse={props.usingToggle}
          key={newKey}
          hiding={hide}
          fieldTitle={Object.keys(props.toggleArr[toggleIndex])[newKey]}
          oneOfTwoID={findOneToTwo()}
          id={newKey}
          fieldType={helpers.typeField(newKey, lastMetaDataAdd)}
          fieldValue={Object.values(props.toggleArr[toggleIndex])[newKey]}
          hasContent={
            props.fieldVal[newKey] !== "" ||
            valueIsInJsMappingFile(
              Object.keys(props.toggleArr[toggleIndex])[newKey]
            )
          }
        />
      );
    }
  });

  // uses the action "firstState" with the argument "objArray" to create the Redux Store ***ONE TIME***
  useEffect(() => {
    const initObj = {
      objArr: objArray,
      useOnce: useOnce
    };
    props.firstState(initObj);
  }, []);

  // shows contents of the store if you click the "help" button in the console (FOR NOW)
  const checkStore = () => {
    console.log(props.fileMeta);
    console.log(props.persist);
    console.log(props.multiCount);
    console.log(props.ent);
    console.log(props.toggleArr);
    valueIsInJsMappingFile();
  };

  // This helper function fills the multiValueArray where each index represents the "field_name", "description", or "sample_comment" selections
  const multiValueArrHelper = (options, index, multiArr) => {
    let j;
    for (j = 0; j < 3; j++) {
      if (options.indexOf(props.ent[index].sesarTitle) !== -1) {
        if (props.ent[index].value !== "") {
          multiArr[options.indexOf(props.ent[index].sesarTitle)].push(
            props.ent[index].header + ":" + props.ent[index].value
          );
          break;
        } else {
          multiArr[options.indexOf(props.ent[index].sesarTitle)].push(
            props.ent[index].header + ":NO_DATA"
          );
          break;
        }
      }
    }
  };

  // Helper function add the "field_name", "description", "sample_comment" title to the beginning of the join(";") array index
  const appendTitleToFront = (multiValueArr, options) => {
    let i;
    for (i = 0; i < 5; i++) {
      if (multiValueArr[i] !== "" && multiValueArr[i] !== undefined)
        multiValueArr[i] = options[i] + " ==> " + multiValueArr[i];
    }
  };

  ////////// Shows (Map Preview / Size Selection Preview / Multi-Value Selections )
  const previewPopUp = () => {
    ////////////////
    // POP-UP LOCAL VARIABLES
    let options = [
      "size",
      "description",
      "sample_comment",
      "geological_age",
      "field_name"
    ];
    let multiValueArr = [[], [], [], [], []];
    let mapPreviewArr = [];
    let fieldIndex = -1;
    let descripIndex = -1;
    let sampleIndex = -1;
    let geoIndex = -1;
    let sizeIndex = -1;
    let finalMap;
    let finalArray;
    let arr = [];
    let i;

    /////////////////////////////////////////////////////////
    /////////// Display Preview of Multi-Value Selections
    for (i = 0; i < props.ent.length; i++) {
      if (
        props.ent[i].sesarTitle !== "" &&
        props.ent[i].sesarTitle !== "none"
      ) {
        mapPreviewArr.push(
          String(props.ent[i].sesarTitle + ":" + props.ent[i].header)
        );
      }
      multiValueArrHelper(options, i, multiValueArr);
    }
    for (i = 0; i < 5; i++) {
      multiValueArr[i] = multiValueArr[i].join("; ");
    }
    appendTitleToFront(multiValueArr, options);

    finalMap = mapPreviewArr;

    for (i = 0; i < finalMap.length; i++) {
      if (finalMap[i].includes(options[0])) {
        finalMap[i] = multiValueArr[0];
        if (fieldIndex === -1) {
          fieldIndex = i;
        }
      } else if (finalMap[i].includes(options[1])) {
        finalMap[i] = multiValueArr[1];
        if (descripIndex === -1) {
          descripIndex = i;
        }
      } else if (finalMap[i].includes(options[2])) {
        finalMap[i] = multiValueArr[2];
        if (sampleIndex === -1) {
          sampleIndex = i;
        }
      } else if (finalMap[i].includes(options[3])) {
        finalMap[i] = multiValueArr[3];
        if (geoIndex === -1) {
          geoIndex = i;
        }
      } else if (finalMap[i].includes(options[4])) {
        finalMap[i] = multiValueArr[4];
        if (sizeIndex === -1) {
          sizeIndex = i;
        }
      }
    }
    for (i = 0; i < finalMap.length; i++) {
      if (!arr.includes(finalMap[i])) {
        if (!(finalMap[i].includes(options[0]) && i !== fieldIndex))
          arr.push(finalMap[i]);
        else if (!(finalMap[i].includes(options[1]) && i !== descripIndex))
          arr.push(finalMap[i]);
        else if (!(finalMap[i].includes(options[2]) && i !== sampleIndex))
          arr.push(finalMap[i]);
        else if (!(finalMap[i].includes(options[3]) && i !== geoIndex))
          arr.push(finalMap[i]);
        else if (!(finalMap[i].includes(options[4]) && i !== sizeIndex))
          arr.push(finalMap[i]);
      }
    }

    finalArray = arr;

    return finalArray;
  };

  const hideOrShow = () => {
    let final = "";
    if (hide === true) {
      final = "Show Unused Fields";
    } else {
      final = "Hide Unused Fields";
    }
    return final;
  };

  // checks the redux store to see if any of the fieldCards have selected a date
  const dateSelected = () => {
    let found = false;
    for (let i = 0; i < props.ent.length; i++) {
      if (
        props.ent[i].sesarTitle === "collection_start_date" ||
        props.ent[i].sesarTitle === "collection_end_date"
      ) {
        found = true;
      }
    }
    return found;
  };

  return (
    /////////////////////////
    // TOOLBAR /////////////
    ///////////////////////
    // Field Cards ///////
    /////////////////////

    <div>
      <div className="label">
        <div className="container-fluid">
          <div className="row">
            <div
              className="text-center order-md-3 col-md-3"
              style={{ padding: "20px" }}
            >
              <MapOutput />
            </div>
            <div className="col-sm-4 col-md-3 order-md-1 align-self-center">
              <div
                className="card border-0 mx-auto text-center"
                style={{ maxWidth: "300px" }}
              >
                <div className="card-body">
                  <div className="card-title border-0 bg-white">
                    Change Displayed Sample
                  </div>
                  <div className="card-text">
                    Current Sample Row: {toggleIndex}
                  </div>
                  <div className="btn-group-vertical text-center btn-margin">
                    <button
                      className="btn btn-outline-dark"
                      onClick={() => refreshButton()}
                    >
                      Refresh
                    </button>
                    <div className="btn-group">
                      <button
                        className="btn btn-outline-dark"
                        onClick={() => leftArrowToggle()}
                      >
                        <i class="fa fa-arrow-up"></i>
                      </button>
                      <button
                        className="btn btn-outline-dark"
                        onClick={() => rightArrowToggle()}
                      >
                        <i class="fa fa-arrow-down"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-sm-4 col-md-3 order-md-3 align-self-center">
              <div
                className="card border-0 mx-auto text-center"
                style={{ maxWidth: "200px" }}
              >
                <div className="card-body">
                  {props.hasDateFormat === false || dateSelected() === false ? (
                    <div>Select Date Format</div>
                  ) : (
                    <div
                      style={{
                        visibility: "hidden",
                        width: "100%",
                        maxWidth: "400px",
                        textAlign: "center"
                      }}
                    >
                      Select Date Format
                    </div>
                  )}

                  {props.hasDateFormat === false || dateSelected() === false ? (
                    <div
                      className="toolbar__date__format"
                      style={{ borderColor: "red" }}
                    >
                      <DateDropdown list={dateFormatOption} />
                      <CenturyDropDown />
                    </div>
                  ) : (
                    <div className="toolbar__date__format">
                      <DateDropdown list={dateFormatOption} />
                      <CenturyDropDown />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-sm-4 col-md-3 order-md-4 align-self-center text-center">
              <div
                className="card border-0 mx-auto text-center"
                style={{ maxWidth: "175px" }}
              >
                <div className="card-body">
                  <div class="btn-group-vertical">
                    <button
                      className="btn btn-outline-dark"
                      onClick={() => setHide(!hide)}
                    >
                      {" "}
                      {hideOrShow()}{" "}
                    </button>
                    <button
                      className="btn btn-outline-dark"
                      onClick={() => {
                        props.callback(previewPopUp());
                      }}
                    >
                      {" "}
                      Preview Map{" "}
                    </button>
                    <button
                      className="btn btn-outline-dark"
                      onClick={checkStore}
                    >
                      {" "}
                      Help{" "}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="description">
            <div>
              <object className="fieldWidget">
                <div
                  style={{ fontFamily: "Lucida Grande" }}
                  className="description__checkbox"
                >
                  Use
                </div>
                <div
                  style={{ fontFamily: "Lucida Grande" }}
                  dir="rtl"
                  className="description__title"
                >
                  {"Field"}
                </div>
                <div
                  className="description__value"
                  style={{ fontFamily: "Lucida Grande", width: "23.8%" }}
                >
                  {" "}
                  {": Content"}
                </div>
              </object>
              <object
                style={{
                  fontFamily: "Lucida Grande",
                  display: "inline-block",
                  paddingLeft: "4.2em"
                }}
              >
                <div style={{ fontFamily: "Lucida Grande", fontSize: "18px" }}>
                  Maps To
                </div>
              </object>
              <object className="descriptionKeyMapped" align="right">
                <div
                  style={{ fontFamily: "Lucida Grande", whiteSpace: "nowrap" }}
                  className="description__mapped__content"
                >
                  {"Content : [Field]"}
                </div>
              </object>
            </div>
          </div>
        </div>

        <div class="container-fluid">{fields}</div>
      </div>
      <div>
        Icons made by{" "}
        <a href="https://www.flaticon.com/authors/freepik" title="Freepik">
          Freepik
        </a>{" "}
        from{" "}
        <a href="https://www.flaticon.com/" title="Flaticon">
          www.flaticon.com
        </a>
      </div>
    </div>
  );
};

const mapStateToProps = state => {
  return {
    hasInit: state.hasInit,
    ent: state.entries,
    persist: state.persistingMetaData,
    toggleArr: state.toggleArr,
    toggleIndex: state.toggleIndex,
    usingToggle: state.toggleInUse,
    hasDateFormat: state.hasChosenDateFormat,
    storeJsFile: state.jsFile,
    multiCount: state.totalMultiCount,
    fileMeta: state.fileMetadata
  };
};

export default connect(
  mapStateToProps,
  { firstState, toggleInUse }
)(CardList);
