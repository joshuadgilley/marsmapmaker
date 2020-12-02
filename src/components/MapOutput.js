///////////////////////////////////////////////////////////////////////////////////////
// MAPOUTPUT.JS /////////////////////////////////////////////////////////////////////////
// This component displays an icon in the center of the toolbar /////////////////////
// This input box recieves 1 or 2 CSVS OR that combination with 1 JS file //////////
///////////////////////////////////////////////////////////////////////////////////

import React from "react";
import { connect } from "react-redux";
import saveAs from "file-saver";
import { formatDate } from "../actions/";

import mars from "../icons/planet.png";
import { isSesarTitlePresent } from "../util/helper.js";
const { license } = require("./license");

class MapOutput extends React.Component {
  state = { functionIDs: [], orderedForcedFields: [] };

  filterSortedPersistent = sorted => {
    let unfiltered = sorted;
    let filtered = [];
    let reference = this.props.ent;

    let checker = 0;
    for (let i = 0; i < reference.length; i++) {
      let count = 0;

      for (let j = 0; j < unfiltered.length; j++) {
        if (unfiltered[j].sesar === reference[i].sesarTitle && count < 1) {
          filtered.push(unfiltered[j]);
          checker++;
          count++;
        }
      }
    }
    return filtered;
  };

  //license information located in license.js
  apacheLicense = () => {
    return license;
  };

  //creates other dynamic metadata file information
  fileMetadataHeader = () => {
    let headerText =
      "//\n// **************************************************\n// Mapping file created with file(s)";
    let arrayContent = "";
    for (let i = 0; i < this.props.fileMeta.length; i++) {
      if (i < this.props.fileMeta.length - 1) {
        arrayContent += this.props.fileMeta[i] + ", ";
      } else {
        arrayContent += this.props.fileMeta[i] + "\n";
      }
    }
    for (let i = 0; i < this.props.ent.length; i++) {
      if (
        this.props.ent[i].sesarTitle === "current_archive" &&
        this.props.ent[i].value !== ""
      ) {
        arrayContent +=
          "// This is a mapping file for the organization " +
          this.props.ent[i].value +
          "\n";
      } else {
        arrayContent += "";
      }
    }

    arrayContent +=
      "//\n// Mars Map Maker was created by  Josh Gilley and Robert Niggebrugge\n// of CIRDLES.org, with help from James Rundle,\n// under the guidance of Principal Investigator Dr. Jim Bowring\n// in coordination with geosamples.org.\n//\n//\n" +
      this.apacheLicense() +
      "//\n// **************************************************\n\n";
    return headerText + arrayContent;
  };

  //creates each METADATA and METADATA_ADD functions
  forceEditFunction = () => {
    let id = 0;
    let functID = "";

    //sortedPersistent are the METADATA and METADATA_ADD fields
    let sortedPersistent = this.props.persist;
    sortedPersistent.sort((a, b) => (a.index > b.index ? 1 : -1));

    let sifted = this.filterSortedPersistent(sortedPersistent);

    this.setState({ orderedForcedFields: sifted });
    for (let i = 0; i < sifted.length; i++) {
      functID =
        functID +
        "const forceEditID" +
        i +
        " = () => {" +
        "\n" +
        "let mapMakerHeader = " +
        '"' +
        sifted[i].header +
        '"' +
        "\n" +
        "let mapMakerIndex = " +
        sifted[i].index +
        "\n  " +
        "return " +
        '"' +
        sifted[i].value +
        '"' +
        ";\n}\n";

      let appendValue = "forceEditID" + i;
      let arr = this.state.functionIDs;
      arr.push(appendValue);
      this.setState(state => ({ functionIDs: arr }));
    }

    return functID;
  };

  //this takes in the chosen date format and creates the text that corresponds to how the user wants the entry to be manipulated
  createDateFormatString = chosenFormat => {
    let letDateString = "";

    if (chosenFormat !== "start") {
      let y = "";
      let d = "";
      let m = "";
      let prefix = "";
      switch (chosenFormat) {
        case "YYYYMMDD":
          y = "0,4";
          d = "6,2";
          m = "4,2";
          break;
        case "YYYYDDMM":
          y = "0,4";
          d = "4,2";
          m = "6,2";
          break;
        case "DDMMYYYY":
          y = "4,4";
          d = "0,2";
          m = "2,2";
          break;
        case "MMDDYYYY":
          y = "4,4";
          d = "2,2";
          m = "0,2";
          break;
        case "YYYY/MM/DD":
          y = "0,4";
          d = "8,2";
          m = "5,2";
          break;
        case "YYYY/DD/MM":
          y = "0,4";
          d = "5,2";
          m = "8,2";
          break;
        case "MM/DD/YYYY":
          y = "6,4";
          d = "3,2";
          m = "0,2";
          break;
        case "DD/MM/YYYY":
          y = "6,4";
          d = "0,2";
          m = "3,2";
          break;
        case "YY/MM/DD":
          prefix = this.props.centuryChosen.substr(0, 2);
          y = "0,2";
          d = "6,2";
          m = "3,2";
          break;
        case "MM/DD/YY":
          prefix = this.props.centuryChosen.substr(0, 2);
          y = "6,2";
          d = "3,2";
          m = "0,2";
          break;
        case "YY/DD/MM":
          prefix = this.props.centuryChosen.substr(0, 2);
          y = "0,2";
          d = "3,2";
          m = "6,2";
          break;
        case "DD/MM/YY":
          prefix = this.props.centuryChosen.substr(0, 2);
          y = "6,2";
          d = "0,2";
          m = "3,2";
          break;
        default:
      }

      letDateString =
        'const scrippsDate = (scrippsValue) => {\n  const y  =  "' +
        prefix +
        '" + ' +
        "scrippsValue.substr(" +
        y +
        ")\n  const d = scrippsValue.substr(" +
        d +
        ")\n  const m = scrippsValue.substr(" +
        m +
        ")\n  return y + '-' + m + '-' + d + 'T00:00:00Z'\n}\n\n";
    } else {
      letDateString = "";
    }
    return letDateString;
  };

  createMulitValueJoins() {
    const keyValueString =
      "const keyValueString = (scrippsValue, scrippsKey) => {\n  return scrippsKey + ' : ' + scrippsValue\n}\n\n";
    const delimit =
      "const delimit = (valueArray) => {\n  return valueArray.join(';')\n}\n\n";

    return keyValueString + delimit;
  }

  //this method loops through the array entries in the store multiple times to append to the string based on corresponding SesarTitles selected that
  createMapString() {
    let letMapString = "let map = {\n";
    let lastIndexOfContent = -1;
    let singleLastIndexOfContent = -1;
    let geological_age_found = -1;
    let sample_found = -1;
    let description_found = -1;
    let field_found = -1;
    let size_found = -1;

    //for formatting need to track the relative last entry of each multivalue and single value and the last entry used

    for (let j = 0; j < this.props.ent.length; j++) {
      //these conditionals track the last occurance of each type of sesarTitle
      if (
        this.props.ent[j].sesarTitle !== "none" &&
        this.props.ent[j].sesarTitle !== "" &&
        this.props.ent[j].value !== "<METADATA_ADD>" &&
        this.props.ent[j].sesarTitle !== "field_name" &&
        this.props.ent[j].sesarTitle !== "sample_comment" &&
        this.props.ent[j].sesarTitle !== "description" &&
        this.props.ent[j].sesarTitle !== "size" &&
        this.props.ent[j].sesarTitle !== "geological_age"
      )
        singleLastIndexOfContent = j;
      else if (this.props.ent[j].sesarTitle === "geological_age")
        geological_age_found = j;
      else if (this.props.ent[j].sesarTitle === "field_name") field_found = j;
      else if (this.props.ent[j].sesarTitle === "sample_comment")
        sample_found = j;
      else if (this.props.ent[j].sesarTitle === "description")
        description_found = j;
      else if (this.props.ent[j].sesarTitle === "size") size_found = j;
    }

    //this finds the overall last occurance of a value in the array
    const findFinalPosition = [
      singleLastIndexOfContent,
      geological_age_found,
      sample_found,
      description_found,
      field_found,
      size_found
    ];
    lastIndexOfContent = Math.max(...findFinalPosition);

    let singlesAppendingString = "";
    for (let i = 0; i < this.props.ent.length; i++) {
      if (
        this.props.ent[i].sesarTitle !== "none" &&
        this.props.ent[i].sesarTitle !== "" &&
        this.props.ent[i].value !== "<METADATA_ADD>" &&
        this.props.ent[i].sesarTitle !== "geological_age" &&
        this.props.ent[i].sesarTitle !== "field_name" &&
        this.props.ent[i].sesarTitle !== "sample_comment" &&
        this.props.ent[i].sesarTitle !== "description" &&
        this.props.ent[i].sesarTitle !== "size"
      ) {
        if (
          i === lastIndexOfContent &&
          geological_age_found < 0 &&
          field_found < 0 &&
          sample_found < 0 &&
          size_found < 0 &&
          description_found < 0
        )
          singlesAppendingString +=
            "  " +
            this.props.ent[i].sesarTitle +
            ': "' +
            this.props.ent[i].header +
            '"\n';
        else
          singlesAppendingString +=
            "  " +
            this.props.ent[i].sesarTitle +
            ': "' +
            this.props.ent[i].header +
            '",\n';
      }
    }

    let multiAppendingString = "";
    if (geological_age_found > -1) {
      multiAppendingString += "  geological_age: [";
      for (let z = 0; z < this.props.ent.length; z++) {
        if (this.props.ent[z].sesarTitle === "geological_age") {
          if (
            z === geological_age_found &&
            (field_found < 0 &&
              sample_found < 0 &&
              size_found < 0 &&
              description_found < 0)
          )
            multiAppendingString += ' "' + this.props.ent[z].header + '" ]\n';
          else if (
            z === geological_age_found &&
            (field_found > -1 ||
              sample_found > -1 ||
              size_found > -1 ||
              description_found > -1)
          )
            multiAppendingString += ' "' + this.props.ent[z].header + '" ],\n';
          else multiAppendingString += ' "' + this.props.ent[z].header + '", ';
        }
      }
    }

    if (field_found > -1) {
      multiAppendingString += "  field_name: [";
      for (let z = 0; z < this.props.ent.length; z++) {
        if (this.props.ent[z].sesarTitle === "field_name") {
          if (
            z === field_found &&
            (sample_found < 0 && size_found < 0 && description_found < 0)
          )
            multiAppendingString += ' "' + this.props.ent[z].header + '" ]\n';
          else if (
            z === field_found &&
            (sample_found > -1 || size_found > -1 || description_found > -1)
          )
            multiAppendingString += ' "' + this.props.ent[z].header + '" ],\n';
          else multiAppendingString += ' "' + this.props.ent[z].header + '", ';
        }
      }
    }
    if (sample_found > -1) {
      multiAppendingString += "  sample_comment: [";
      for (let z = 0; z < this.props.ent.length; z++) {
        if (this.props.ent[z].sesarTitle === "sample_comment") {
          if (z === sample_found && (size_found < 0 && description_found < 0))
            multiAppendingString += ' "' + this.props.ent[z].header + '" ]\n';
          else if (
            z === sample_found &&
            (size_found > -1 || description_found > -1)
          )
            multiAppendingString += ' "' + this.props.ent[z].header + '" ],\n';
          else if (z < lastIndexOfContent && z < sample_found)
            multiAppendingString += ' "' + this.props.ent[z].header + '", ';
        }
      }
    }

    if (description_found > -1) {
      multiAppendingString += "  description: [";
      for (let z = 0; z < this.props.ent.length; z++) {
        if (this.props.ent[z].sesarTitle === "description") {
          if (z === description_found && size_found < 0)
            multiAppendingString += ' "' + this.props.ent[z].header + '" ]\n';
          else if (z === description_found && size_found > -1)
            multiAppendingString += ' "' + this.props.ent[z].header + '" ],\n';
          else if (z < lastIndexOfContent && z < description_found)
            multiAppendingString += ' "' + this.props.ent[z].header + '", ';
        }
      }
    }

    if (size_found > -1) {
      multiAppendingString += "  size: [";
      for (let z = 0; z < this.props.ent.length; z++) {
        if (this.props.ent[z].sesarTitle === "size") {
          if (z === size_found)
            multiAppendingString += ' "' + this.props.ent[z].header + '" ]\n';
          else if (z < lastIndexOfContent && z < size_found)
            multiAppendingString += ' "' + this.props.ent[z].header + '", ';
        }
      }
    }

    let appendingString =
      singlesAppendingString + multiAppendingString + "}\n\n";

    letMapString = letMapString.concat(appendingString);

    return letMapString;
  }

  logicFunctionAppend() {
    let logicID = "";

    for (let i = 0; i < this.state.orderedForcedFields.length; i++) {
      if (this.state.functionIDs[i] === undefined) {
      } else {
        logicID =
          logicID +
          "  " +
          this.state.orderedForcedFields[i].sesar +
          ": forceEditID" +
          i +
          ",\n";
      }
    }
    return logicID;
  }

  createLogicAndCombination() {
    alert("Mapping Accepted!");
    const logic =
      "let logic = { " +
      "\n" +
      this.logicFunctionAppend() +
      "  collection_start_date: scrippsDate,\n  collection_end_date: scrippsDate,\n  geological_age: keyValueString,\n  field_name: keyValueString,\n  description: keyValueString,\n  sample_comment: keyValueString,\n  size: keyValueString\n  }\n\n";

    const combination = `let combinations = {
  field_name: delimit,
  description: delimit,
  geological_age: delimit,
  sample_comment: delimit,
  size: delimit
\}\n\n`;

    const endOfFile = "return {map, logic, combinations}\n";

    return logic + combination + endOfFile;
  }

  finalAppend = () => {
    let dateDoubleCheck = "start";
    for (let i = 0; i < this.props.ent.length; i++) {
      if (
        this.props.ent[i].sesarTitle === "collection_start_date" ||
        this.props.ent[i].sesarTitle === "collection_end_date"
      ) {
        dateDoubleCheck = this.props.dateFormat;
        break;
      }
    }

    let today = new Date();
    let year = today.getFullYear();
    let month = today.getMonth() + 1;
    let day = today.getDate();
    let currentDate = " " + year + "-" + month + "-" + day;

    let fileString =
      "// Mapping file created by Mars Map Maker on" + currentDate + "\n";
    fileString = fileString + this.fileMetadataHeader();
    fileString = fileString + this.forceEditFunction();
    fileString = fileString + this.createMulitValueJoins();
    fileString = fileString + this.createDateFormatString(dateDoubleCheck);
    fileString = fileString + this.createMapString();
    fileString = fileString + this.createLogicAndCombination();
    return fileString;
  };

  createMapFile = () => {
    if (isSesarTitlePresent("user_code", this.props.ent)) {
      const fileOutput = new Blob([this.finalAppend()], {
        type: "text/javascript;charset=utf-8"
      });
      saveAs(fileOutput, "test.js");
    } else {
      alert("Sesar Selection 'user_code' must be set before file output");
    }
  };

  render() {
    return (
      <div className="marsOutput">
        <img
          className="mars--icon"
          src={mars}
          alt="marsIcon"
          onClick={() => this.createMapFile()}
        ></img>
        <h4 style={{ padding: "0%", margin: "0%" }}>Click to Map</h4>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    ent: state.entries,
    fileMeta: state.fileMetadata,
    persist: state.persistingMetaData,
    multiValue: state.multiValues,
    singleMeasure: state.singleMeasureArr,
    dateFormat: state.substringDateFormat,
    centuryChosen: state.century
  };
};

export default connect(
  mapStateToProps,
  { formatDate }
)(MapOutput);
