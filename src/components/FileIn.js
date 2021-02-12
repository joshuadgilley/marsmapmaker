///////////////////////////////////////////////////////////////////////////////////////
// FILEIN.JS /////////////////////////////////////////////////////////////////////////
// This component displays a file input box on the first screen /////////////////////
// This input box recieves 1 or 2 CSVS OR that combination with 1 JS file //////////
///////////////////////////////////////////////////////////////////////////////////

import React from "react";
import { connect } from "react-redux";
import Papa from "papaparse";
import "./App.scss";
import classNames from "classnames";

import {
  formatDate,
  century,
  setFileMetadata,
  persistingDataConcat
} from "../actions/";

///////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////

class FileIn extends React.Component {
  constructor() {
    super();
    this.state = {
      numberOfEmptyCards: 0,
      toggleValues: [],
      fieldNames: [],
      fieldValues: [],
      num: -1,
      readyToInit: false,
      totalFileSize: 0,
      includesJsFile: false,
      isJsFile: false,
      jsFile: undefined,
      files: undefined,
      csvfile: undefined,
      csvfile2: undefined,
      csvfile3: undefined,
      loaded: false,
      forceEditTitles: [],
      forceEditValues: [],
      dualFileLoadInArr: [],
      loadedInFirstFile: false,
      validNumOfFiles: true
    };
    this.updateData = this.updateData.bind(this);
  }

  // this function reads in from both "choose files" to get both events before running handle change
  // preHandleChange = event => {
  //     console.log(event.target.files[0])
  //     let arr = this.state.dualFileLoadInArr;
  //     arr.push(event.target.files[0]);
  //     console.log(arr)

  //     if (this.state.loadedInFirstFile === true) {
  //         this.handleChange(this.state.dualFileLoadInArr)
  //     }

  //     if (this.state.loadedInFirstFile === false) {
  //         this.setState({
  //             dualFileLoadInArr: true
  //         })
  //     }

  // }

  // method to make sure that 0 < # of CSV's < 3 && # of mapping files < 2
  validateFiles = file => {
    let valid = false;
    let numCsv = 0;
    let numJs = 0;

    if (file.type === "text/javascript") {
      numJs += 1;
    } else if (file.type === "text/csv") {
      numCsv += 1;
    }

    if (numCsv > 0 && numCsv < 3 && numJs < 2) {
      valid = true;
      this.setState({
        validNumOfFiles: true
      });
    }

    return valid;
  };

  // helper method for selected CSV to read information from the file
  handleChange = event => {
    console.log(event.target.files);
    let arr = this.state.dualFileLoadInArr;
    for (let i = 0; i < event.target.files.length; i++) {
      arr.push(event.target.files[i]);
    }

    console.log(event.target.files);
    this.setState({ files: arr });
    if (event.target.files[1] === undefined) {
      this.setState({
        csvfile: event.target.files[0]
      });
    } else if (event.target.files[2] === undefined) {
      this.setState({
        csvfile: event.target.files[0],
        csvfile2: event.target.files[1]
      });
    } else {
      this.setState({
        csvfile: event.target.files[0],
        csvfile2: event.target.files[1],
        csvfile3: event.target.files[2]
      });
    }
  };

  refreshFileIn = () => {
    setTimeout(() => {
      this.setState({ loaded: !this.state.loaded, dualFileLoadInArr: [] });
    }, 0); // ------------------------------> timeout 0

    setTimeout(() => {
      this.setState({ loaded: !this.state.loaded });
    }, 10);
  };

  // onclick helper function to parse the CSV with PapaParse
  importCSV = () => {
    let jscount = 0;
    let csvcount = 0;
    let fileName = [];
    if (this.state.files !== undefined) {
      for (let i = 0; i < this.state.files.length; i++) {
        fileName.push(this.state.files[i].name);

        if (this.state.files[i].type.includes("javascript")) jscount += 1;
        else if (this.state.files[i].type.includes("text/csv") || this.state.files[i].type.includes("excel")) csvcount += 1;
      }

      const obj = {
        files: fileName
      };
      this.props.setFileMetadata(obj);

      console.log(fileName);
      console.log("JSCOUNT: " + jscount);
      console.log("CSVCOUNT: " + csvcount);
    }

    if (csvcount > 3) {
      console.log("csv count stuff correct");
      this.refreshFileIn();
      alert("You have selected more that 3 files, try again!");
      return;
    }

    if (csvcount === 0) {
      console.log("csv count stuff correct");
      this.refreshFileIn();
      alert("Please select a CSV file");
      return;
    }

    if (csvcount > 2 || jscount > 1) {
      this.refreshFileIn();
      alert("You have either selected too many CSV or too many mapping files!");
      return;
    }

    for (let i = 0; i < this.state.files.length; i++) {
      let numOfJsFiles = 0;
      if (this.state.files[i].type === "text/javascript") {
        numOfJsFiles += 1;
      }
      if (!(numOfJsFiles < 2)) {
        this.refreshFileIn();
        alert("Too many Mapping files....");
        return;
      }

      Papa.parse(this.state.files[i], {
        complete: this.updateData,
        header: true
      });
    }

    this.setState({ loaded: true });
  };

  removeBrackets = arr => {
    let newArr = [];
    for (let i = 0; i < arr.length; i++) {
      if (i !== 3) newArr.push(arr[i]);
    }
    return newArr;
  };
  //iStart is beginning of map array
  startPushingHelper = (result, i, jsArr, iStart, metaDataAddValue) => {
    //let findout = (JSON.stringify(Object.values(result.data[i])[0]).replace(/(\r\n|\n|\r)/gm, ""))
    //console.log("this is i right after being called: " + i + " and findout is this: " + findout)

    if (
      !JSON.stringify(Object.values(result.data[i])[0])
        .replace(/(\r\n|\n|\r)/gm, "")
        .includes("[")
    ) {
      //make function to identify Metadata or metadata add inside and add sesar value to persistmetadata in store
      //this splits each line of the map into an array of [sesarTitle, mappedHeader]
      let cleaned = Object.values(result.data[i])[0]
        .replace(/(\r\n|\n|\r)/gm, "")
        .replace(" ", "")
        .split(":");
      if (!(cleaned[0].includes("return") || cleaned[0].includes("}"))) {
        let indexCleaned = cleaned[0].split(" ")[2];
        let addToStore = false;
        //console.log(indexCleaned) 
        addToStore = cleaned[0].includes("mapMakerIndex");

        if (addToStore) {
          
          //scrubs mapMakerHeader line for header value
          let headerCleaned = Object.values(result.data[i - 1])[0]
          .replace(/(\r\n|\n|\r)/gm, "")
          .replace(" ", "")
          .split(" ")[2].replace(/\"/g, "");

          //scrubs return of forceEditFunctions for return value to replace value
          let ses = Object.values(result.data[i+1])[0]
          .replace(/(\r\n|\n|\r)/gm, "")
          .replace(/\\|"|;/g, "")
          .split(" ")[3];

          let findSesar = Object.values(result.data[i-2])[0]
          .replace(/(\r\n|\n|\r)/gm, "")
          .replace(/\\|"|;/g, "")
          .split(" ")[1];
          console.log(findSesar)          

          let sesarFound = ""
          for(let i = 0; i < result.data.length; i++) {
            if(Object.values(result.data[i])[0].includes(": " + findSesar)){
              sesarFound = Object.values(result.data[i])[0].split(":")[0].trim();
              break;
            }
          }
          console.log(sesarFound)

          let persistObj = {
            sesar: sesarFound,
            value: ses,
            isMetaData: !headerCleaned.includes("<METADATA_ADD>"),
            isMetaDataAdd: headerCleaned.includes("<METADATA_ADD>"),
            header: headerCleaned,
            forceID: this.props.persist.length,
            index: parseInt(indexCleaned)
          };
          console.log("this is obj we add to persist "+ persistObj.sesar + " " + persistObj.header)
          this.props.persistingDataConcat(persistObj);

          //put object in store with only the sesar value to persistmetadata
        }
      }
      jsArr.push(
        JSON.stringify(Object.values(result.data[i])[0])
          .replace(/(\r\n|\n|\r)/gm, "")
          .replace(" ", "")
      );
    } else {
      let firstIndexFormat;
      // where we handle multivalue selections
      firstIndexFormat = JSON.stringify(Object.values(result.data[i])[0]).split(
        " "
      );
      // BANDAID
      // One of the multivalue selections has an extra space in the mapOutput, this is a quick fix
      // However, when mars reads in mapping file, space may still need to be taken care of
      if (firstIndexFormat.length === 5 || firstIndexFormat.length === 6) {
        //firstIndexFormat[4] = firstIndexFormat[4]
        firstIndexFormat = this.removeBrackets(firstIndexFormat);
      }

      if (firstIndexFormat.length === 4)
        firstIndexFormat[3] = firstIndexFormat[3].substring(
          0,
          firstIndexFormat[3].length - 3
        );
      else if (firstIndexFormat.length === 5)
        firstIndexFormat[3] = firstIndexFormat[3].substring(
          2,
          firstIndexFormat[3].length - 1
        );
      jsArr.push(firstIndexFormat[2] + firstIndexFormat[3]);
      if (
        (
          Object.values(result.data[i])[1] !== undefined &&
          Object.values(result.data[i])[1]
        ).length >= 1
      ) {
        for (let j = 0; j < Object.values(result.data[i])[1].length; j++) {
          if (Object.values(result.data[i])[1][j] !== "")
            jsArr.push(
              firstIndexFormat[2] +
                Object.values(result.data[i])[1][j].substring(
                  2,
                  Object.values(result.data[i])[1][j].length - 1
                )
            );
        }
      }
    }
  };



  // uses function from App.js (callbackFromParent) to retrieve the result/data from FileIn.js
  updateData(result) {
    let removeIndex = [];
    let mapIndex = -1;

    // checks to see if the file "result" is a JS mapping file, this file always starts with Start::::
    if (
      Object.keys(result.data[0])[0].includes(
        "Mapping file created by Mars Map Maker"
      )
    ) {
      let finalStr = "";
      let needsCenturyPrefix = false;

      // JS mapping file has a section "let map..." which is where we want to retrieve our sesar selections and clean the data
      let jsArr = [];
      let prefix = "";
      let dateIdArr = [];
      let dateIdentified = false;
      // start pushing is where we find "let map..." and start reading
      let startPushing = false;
      let addToForceEdit = false;
      let forceEditValueTitleArr = [];
      let forceEditValueContentArr = [];

      if (JSON.stringify(Object.values(result.data[0])).includes("forceEdit")) {
        addToForceEdit = true;
      }

      // parsing out a javascript file
      for (let i = 1; i < result.data.length - 1; i++) {
        //console.log(Object.values(result.data[i]))
        if (
          JSON.stringify(Object.values(result.data[i])).includes("forceEdit") &&
          JSON.stringify(Object.values(result.data[i])).includes("const")
        ) {
          addToForceEdit = true;
        }

        if (addToForceEdit === true) {
          if (
            JSON.stringify(Object.values(result.data[i])).includes(
              "mapMakerHeader"
            )
          ) {
            let forceEditValue = JSON.stringify(
              Object.values(result.data[i])
            ).split(" ");
            forceEditValueTitleArr.push(
              forceEditValue[forceEditValue.length - 1].substring(
                2,
                forceEditValue[3].length - 4
              )
            );
          }
          if (
            JSON.stringify(Object.values(result.data[i])).includes("return")
          ) {
            let forceEditValue = JSON.stringify(
              Object.values(result.data[i])
            ).split(" ");
            let trimmedForceEditValue = forceEditValue.slice(3).join(" ");
            forceEditValueContentArr.push(
              trimmedForceEditValue.substring(
                2,
                trimmedForceEditValue.length - 5
              )
            );
            addToForceEdit = false;
          }
        }

        if (
          JSON.stringify(Object.values(result.data[i - 1])[0])
            .replace(/(\r\n|\n|\r)/gm, "")
            .includes("let map")
        ) {
          if (
            !(
              JSON.stringify(Object.values(result.data[i - 1])[0])
                .replace(/(\r\n|\n|\r)/gm, "")
                .includes("}") ||
              JSON.stringify(Object.values(result.data[i - 1])[0])
                .replace(/(\r\n|\n|\r)/gm, "")
                .includes("return")
            )
          )
            mapIndex = i;
          startPushing = true;
        } else if (
          JSON.stringify(Object.values(result.data[i - 1])[0])
            .replace(/(\r\n|\n|\r)/gm, "")
            .includes("const scrippsDate")
        ) {
          dateIdentified = true;
        } else if (
          JSON.stringify(Object.values(result.data[i - 1])[0])
            .replace(/(\r\n|\n|\r)/gm, "")
            .includes("}")
        ) {
          startPushing = false;
        } else if (
          JSON.stringify(Object.values(result.data[i])[0])
            .replace(/(\r\n|\n|\r)/gm, "")
            .includes("return y")
        ) {
          dateIdentified = false;
        }

        let arr;
        
        if (startPushing === true) {
          //console.log("This is indexSet before startpush: " + "  " + mapIndex + "   " + JSON.stringify(Object.values(result.data[i])[0]).replace(/(\r\n|\n|\r)/gm, ""))
          this.startPushingHelper(result, i, jsArr, mapIndex, forceEditValueContentArr);
        } else if (dateIdentified === true) {
          if (Object.values(result.data[i])[0].includes("y")) {
            arr = Object.values(result.data[i])[0].split(" ");
            prefix = arr[7];
          }
          // create array of the JS mapping file already selected date numbers
          if (Object.values(result.data[i])[0].includes("y")) {
            arr = Object.values(result.data[i])[0].split(" ");
            dateIdArr.push(arr[arr.length - 1].match(/[0-9]+/g)[0]);
            dateIdArr.push(
              Object.values(result.data[i])[1][0].match(/[0-9]+/g)[0]
            );
          } else {
            dateIdArr.push(
              Object.values(result.data[i])[0].match(/[0-9]+/g)[0]
            );
            dateIdArr.push(
              Object.values(result.data[i])[1][0].match(/[0-9]+/g)[0]
            );
          }
        }

        if (dateIdArr.length === 6) {
          // create a string of the date number array above
          // use that string to identify the finalStr to display automatically in the date dropdown

          let dateFormatStr = dateIdArr.join("");
          switch (dateFormatStr) {
            case "046242":
              finalStr = "YYYYMMDD";
              break;
            case "044262":
              finalStr = "YYYYDDMM";
              break;
            case "440222":
              finalStr = "DDMMYYYY";
              break;
            case "442202":
              finalStr = "MMDDYYYY";
              break;
            case "048252":
              finalStr = "YYYY/MM/DD";
              break;
            case "045282":
              finalStr = "YYYY/DD/MM";
              break;
            case "643202":
              finalStr = "MM/DD/YYYY";
              break;
            case "640232":
              finalStr = "DD/MM/YYYY";
              break;
            case "026232":
              //prefix = this.props.centuryChosen.substr(0, 2)
              finalStr = "YY/MM/DD or YY-MM-DD";
              needsCenturyPrefix = true;
              break;
            case "623202":
              finalStr = "MM/DD/YY or MM-DD-YY";
              needsCenturyPrefix = true;
              //prefix = this.props.centuryChosen.substr(0, 2)
              break;
            case "023262":
              //prefix = this.props.centuryChosen.substr(0, 2)
              finalStr = "MM/DD/YY or MM-DD-YY";
              needsCenturyPrefix = true;
              break;
            case "620232":
              finalStr = "DD/MM/YY or DD-MM-YY";
              needsCenturyPrefix = true;
              //prefix = this.props.centuryChosen.substr(0, 2)
              break;
            default:
          }
        }

        if (needsCenturyPrefix === true) {
          const newValue = prefix + "00";
          const obj = {
            chosenCentury: newValue
          };

          this.props.century(obj);
        }

        let newJSArr = [];
        // any identical elements in jsArr, only append them once into newJSArr

        for (let i = 0; i < jsArr.length; i++) {
          if (!newJSArr.includes(jsArr[i])) {
            newJSArr.push(jsArr[i]);
          }
        }
        jsArr = newJSArr;
      }
      // call dateFormat
      const obj = {
        dateFormat: finalStr,
        hasTwoYs: needsCenturyPrefix
      };
      this.props.formatDate(obj);

      // more string cleaning
      // some of the cleaning in the code could be a little smoother with one regex, but some of the symbols we're a little more complicating so handled as strings
      for (let i = 0; i < jsArr.length; i++) {
        jsArr[i] = jsArr[i].replace(/(|\r\n|\s|})/gm, "");
        jsArr[i] = jsArr[i].replace("}", "");
        jsArr[i] = jsArr[i].replace(/\\/g, "");
        jsArr[i] = jsArr[i].replace(/"/g, "");
        jsArr[i] = jsArr[i].replace(" ", "");
        if (jsArr[i] !== "") {
          jsArr[i] = jsArr[i].split(":");
          jsArr[i][0] = jsArr[i][0].replace(" ", "");
          if (jsArr[i][1] !== undefined)
            jsArr[i][1] = jsArr[i][1].replace(" ", "");
        } else removeIndex.push(i);
      }
      // removes any empty strings as elements in the jsArr
      for (let i = 0; i < removeIndex.length; i++) {
        jsArr.splice(removeIndex[i], 1);
      }

      let addForceEditValues = jsArr;
      let forceEditValuesCount = 0;
      for (let i = 0; i < addForceEditValues.length; i++) {
        if (
          addForceEditValues[i][1] === "<METADATA_ADD>" ||
          addForceEditValues[i][1] === "<METADATA>"
        ) {
          //  console.log("is this something?: "+ forceEditValueTitleArr[forceEditValuesCount])
          addForceEditValues[i][1] =
            forceEditValueTitleArr[forceEditValuesCount];
          forceEditValuesCount++;
        }
      }

      //   console.log("LOOKING HERE TITLE ARR: " + forceEditValueTitleArr)
      //   console.log("LOOKING HERE VALUE ARR: " + forceEditValueContentArr)
      // establish state that we have a jsArr
      this.setState({
        jsFile: addForceEditValues,
        includesJsFile: true,
        isJsFile: true,
        forceEditTitles: forceEditValueTitleArr,
        forceEditValues: forceEditValueContentArr
      });
    }

    // this is where we combine objects if there are multiple csv's for the purpose of being able to toggle through tuples of both files
    // we limit the number of toggles but the minimum size of the files (Ex: CSV1.length = 3 && CSV2.length = 10, then user can toggle through 3 times)
    var data = result;
    let finalToggleArray = [];
    let toggleArr = this.state.toggleValues;
    let minimum = Math.min(data.data.length, toggleArr.length);
    if (this.state.isJsFile === false) {
      if (
        toggleArr.length !== 0 &&
        (this.state.files[1] !== undefined || this.state.files[2] !== undefined)
      ) {
        if (minimum < 10) {
          for (let i = 0; i < minimum % 10; i++) {
            const finalObj = { ...toggleArr[i], ...data.data[i] };
            finalToggleArray.push(finalObj);
          }
        } else {
          for (let i = 0; i < (minimum % 10) + (10 - (minimum % 10)); i++) {
            const finalObj = { ...toggleArr[i], ...data.data[i] };
            finalToggleArray.push(finalObj);
          }
        }
        toggleArr = finalToggleArray;
      } else if (toggleArr.length === 0) {
        toggleArr = toggleArr.concat(data.data);
      }

      this.setState({
        toggleValues: toggleArr,
        totalFileSize:
          this.state.totalFileSize + Object.keys(data.data[0]).length,
        fieldNames: this.state.fieldNames.concat(Object.keys(data.data[0])),
        fieldValues: this.state.fieldValues.concat(Object.values(data.data[0]))
      });
    }

    let arr = [this.state.fieldNames, this.state.fieldValues];

    // we want to make sure that we have handled all CSV's and JS files before we use the callback function
    this.setState({ num: this.state.num + 1 });
    if (this.state.num === this.state.files.length - 1) {
      //change totalAddedCards to change how many entries of METADATA_ADD/missing field are in the store
      let totalAddedCards = 4 

      this.props.callbackFromParent(
        arr,
        this.state.totalFileSize,
        this.state.toggleValues,
        this.state.jsFile,
        totalAddedCards,
        this.state.forceEditTitles,
        this.state.forceEditValues
      );
    }

    // this function checks every file to see if it is a JS or CSV file, if JS certain parts of the code are ignored, if CSV the same applies
    this.setState({ isJsFile: false });
  }
  /*force card edit */
  // numOfCards = (event) => {
  //     console.log("HERE HERE HERE : " + event.target.value)
  //     console.log("function: " + parseInt(event.target.value))
  //     this.setState({ numberOfEmptyCards: parseInt(event.target.value) })

  // }

  render() {
    // CSS flipflop for loaded or non-loaded file
    let readerClass = classNames({
      fileReaderUnloaded: this.state.loaded === false,
      fileReaderLoaded: this.state.loaded === true
    });

    return (
      <div className={readerClass}>
      <h2>Load File(s)!</h2>
      
      <label>Load JS Mapping File (optional)</label>
      <div>
        <input
          className="csv__input"
          type="file"
          accept=".js"
          ref={input => {
            this.filesInput = input;
          }}
          name="file"
          placeholder={null}
          onChange={this.handleChange}
          multiple="multiple"
        />
      </div>  
      <br></br>
        <div>
          <label>Choose CSV File(s)</label>
          <input
            className="csv__input"
            type="file"
            accept=".csv"
            ref={input => {
              this.filesInput = input;
            }}
            name="file"
            placeholder={null}
            onChange={this.handleChange}
            multiple="multiple"
          />
        </div>
      <br></br>


        {/*force card edit */}
        {/* <div style={{ padding: "0px", margin: "0px", paddingTop: "10px" }}>
                    
                    <select onChange={this.numOfCards} style={{ paddingTop: "10px", width: "120px" }} class="ui search dropdown">
                        <option value="">Extra Cards</option>
                        <option value="0">0</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                    </select>
                </div> */}

        <p />
        <button onClick={this.importCSV}> Load now!</button>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    hasChosenDropdown: state.hasChosenDropdownOption,
    hasChosenDateFormat: state.hasChosenDateFormat,
    persist: state.persistingMetaData,
    dateFormatSelected: state.chosenDateFormat
  };
};

export default connect(
  mapStateToProps,
  { formatDate, century, setFileMetadata, persistingDataConcat }
)(FileIn);
