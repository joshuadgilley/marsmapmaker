///////////////////////////////////////////////////////////////////////////////////////
// DROPDOWN.JS ///////////////////////////////////////////////////////////////////////
// This component displays a dropdown of sesar header choices in every field card ///
// These choices are filter based on the incoming content as a string or a number //
// When clicked, the store is updated with the selection //////////////////////////
//////////////////////////////////////////////////////////////////////////////////

import React from "react";
import { connect } from "react-redux";

//CSS & Styling
import "semantic-ui-react";

// REDUX
import {
  dropdownUpdate,
  multiValueCreate,
  multiValueCreateFinish,
  removeContent,
  setSubstringDateFormat,
  toggleInUse,
  totalMultiValueCount,
  setForcedOldToNew
} from "../actions/";

import { dropdownSet, isSesarTitlePresent } from "../util/helper.js";
//////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////

export class DropDown extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      list: this.props.list,
      value: "select",
      selectedValue: "",
      sesarMulti: this.props.multiList,
      sesarOneToOne: this.props.one2one,
      alreadyInArray: []
    };
  }

  // helper function that removes delimiters from date entry and formats the content into a sesar accepted string
  // if the user makes an error (Ex: selected a YY format but selects a YYYY value) the field card refreshes
  // and the user is notified with an Alert() that they have done the wrong thing
  logicHelper = (fS, fA, dS) => {
    if (fS.includes("YYYY")) {
      for (let i = 0; i < 3; i++) {
        if (fS[i] === "YYYY" && dS[i].length !== 4 && !isNaN(dS[i])) {
          alert(
            "fS errors if any index is YYYY: " +
              fS +
              "\nFA " +
              fA +
              " \nds errors if any index length is not 4: " +
              dS +
              "\nalso dS length"
          );
          alert("YYYY instead of YY error");
          this.props.refresh();
          console.log(
            "You have selected a format that doesn't match the data provided from the file... please try another format (YYYY format for YY)"
          );
          return null;
        }
        if (isNaN(dS[i])) {
          //needs to populate field card with not provided here
          return null;
        }
      }
    }

    for (let j = 0; j < 3; j++) {
      if (dS[j].includes("/") || dS[j].includes("-")) {
        dS[j] = dS[j].toLowerCase().replace(/[/-]/g, "");

        for (let i = 0; i < 3; i++) {
          if (fS[i].length !== dS[i].length) {
            alert("Length error");
            this.props.refresh();
            console.log(
              "You have selected a format that doesn't match the data provided from the file... please try another format (Length error)"
            );
            return null;
          }
        }
      }
    }

    if (fS.includes("/") && !dS.includes("/")) {
      console.log("Delimiter error");

      alert("Delimiter error");
      this.props.refresh();
      return null;
    } else if (fS[0] === "MM" && dS[0] > 12) {
      console.log(
        "You have selected a format that doesn't match the data provided from the file... please try another format (Date error)"
      );

      alert(
        "You have selected a format that doesnt match the data provided from the file... please try another format (Date error)"
      );
      this.props.refresh();
      return null;
    } else if (fS[1] === "MM" && dS[1] > 12) {
      alert("Date error");
      this.props.refresh();
      console.log(
        "You have selected a format that doesn't match the data provided from the file... please try another format (Date error)"
      );
      return null;
    } else if (fS[2] === "MM" && dS[2] > 12) {
      alert("Date error");
      this.props.refresh();
      console.log(
        "You have selected a format that doesn't match the data provided from the file... please try another format (Date error)"
      );
      return null;
    }

    if (fS[0] === "DD") {
      fA[2] = dS[0];
      fA[1] = dS[1];
      fA[0] = dS[2];
    } else if (fS[0] === "MM") {
      fA[1] = dS[0];
      fA[2] = dS[1];
      fA[0] = dS[2];
    } else if (fS[2] === "MM") {
      fA[1] = dS[2];
      fA[0] = dS[0];
      fA[2] = dS[1];
    } else if (fS[2] === "DD") {
      fA[2] = dS[2];
      fA[0] = dS[0];
      fA[1] = dS[1];
    }

    let returnString = fA[0] + "-" + fA[1] + "-" + fA[2] + " 00:00:00";

    return returnString;
  };

  // further date formatting, user error checking, deciding if selection needs a century selection as well
  // if a valid selection is made, the store is updated with the format selected
  // and the store ent[i].sesarTitle is updated with the selection
  detectNonDateCharacters = value => {
    //needs more robust detection
    const regexCheck = /([^0-9/-]|[]|[?@!#$%\^&*\(\)_\=+{}[]"])+/g;
    return regexCheck.test(value);
  };

  formatDate = (value, format, title) => {
    let finalArray = ["", "", ""];
    let update;

    // makes sure a format has been chosen!
    if (format === null) {
      alert("PLEASE SELECT A FORMAT!!!");
      this.props.refresh();
      console.log("PLEASE SELECT A FORMAT!!!");
      return;
    }

    if (
      value.length !== 8 &&
      value.length !== 10 &&
      value.length !== 0 &&
      !this.detectNonDateCharacters(value)
    ) {
      alert(value);
      alert("You have not selected a date, try again...");
      this.props.refresh();
      console.log("You have not selected a date, try again...");
      return;
    }

    // if format chosen contains delimiters
    if (format.includes("/") || format.includes("-")) {
      //substring to identify dateFunction to its unique format in cases of dates structured with delimiters in differing lengths
      if (format[2] === "/") {
        const dateObj = { substringDateFormat: format.substring(0, 8) };

        this.props.setSubstringDateFormat(dateObj);
      } else {
        const dateObj = { substringDateFormat: format.substring(0, 10) };

        this.props.setSubstringDateFormat(dateObj);
      }

      let dateSplit = value.split(/[-/]/);
      let formatSplit = format.split(/[-/ ]/);
      if (
        !this.props.hasChosenCentury &&
        (format[2] !== "Y" && format[3] !== "Y")
      ) {
        alert("You have not selected a century!");
        this.props.refresh();
        console.log("You have not selected a century!");
        return;
      } else if (dateSplit[2].length === 2 && formatSplit[2] === "YY") {
        dateSplit[2] = this.props.century.slice(0, 2) + dateSplit[2];

        update = this.logicHelper(formatSplit, finalArray, dateSplit);
      } else if (dateSplit[0].length === 2 && formatSplit[0] === "YY") {
        if (this.props.century === "2000") {
          dateSplit[0] = "20" + dateSplit[0];
        } else dateSplit[0] = "19" + dateSplit[0];

        update = this.logicHelper(formatSplit, finalArray, dateSplit);
      }
      // if DD-MM-YYYY is selected instead of just DD-MM-YY
      else {
        update = this.logicHelper(formatSplit, finalArray, dateSplit);
      }

      if (update === null) {
        return;
      }

      const obj = {
        id: this.props.id,
        sesarSelected: title,
        oldValue: this.props.value,
        value: update,
        header: this.props.title
      };

      this.props.dropdownUpdate(obj);

      return update;
    }

    // if format chosen comes in the form of yyyymmdd etc...
    if (format.length === 8) {
      const dateObj = { substringDateFormat: format.substring(0, 8) };

      this.props.setSubstringDateFormat(dateObj);
    }

    let dateSplit = value.split("");
    let formatSplit = format.split("");
    let newDateSplit = ["", "", ""];
    let newFormatSplit = ["", "", ""];
    //work with if newDateSplit === "start"
    if (
      (formatSplit[0] === "M" && formatSplit[1] === "M") ||
      (formatSplit[0] === "M" && formatSplit[1] === "M")
    ) {
      newDateSplit[0] = dateSplit[0] + dateSplit[1];
      newFormatSplit[0] = formatSplit[0] + formatSplit[1];
      newDateSplit[1] = dateSplit[2] + dateSplit[3];
      newFormatSplit[1] = formatSplit[2] + formatSplit[3];
      newDateSplit[2] =
        dateSplit[4] + dateSplit[5] + formatSplit[6] + formatSplit[7];
      newFormatSplit[2] =
        formatSplit[4] + formatSplit[5] + formatSplit[6] + formatSplit[7];
    } else {
      newDateSplit[0] =
        dateSplit[0] + dateSplit[1] + dateSplit[2] + dateSplit[3];
      newFormatSplit[0] =
        formatSplit[0] + formatSplit[1] + formatSplit[2] + formatSplit[3];
      newDateSplit[1] = dateSplit[4] + dateSplit[5];
      newFormatSplit[1] = formatSplit[4] + formatSplit[5];
      newDateSplit[2] = dateSplit[6] + dateSplit[7];
      newFormatSplit[2] = formatSplit[6] + formatSplit[7];
    }

    for (let i = 0; i < 3; i++) {
      if (newFormatSplit[i].includes("D") && newFormatSplit[i].includes("M")) {
        alert("Date error");
        this.props.refresh();
        console.log(
          "You have selected a format that doesn't match the data provided from the file... please try another format (Date error)"
        );
        return;
      } else if (
        newFormatSplit[i].includes("D") &&
        newFormatSplit[i].includes("Y")
      ) {
        alert("Date error");
        this.props.refresh();
        console.log(
          "You have selected a format that doesn't match the data provided from the file... please try another format (Date error)"
        );
        return;
      } else if (
        newFormatSplit[i].includes("M") &&
        newFormatSplit[i].includes("Y")
      ) {
        alert("Date error");
        this.props.refresh();
        console.log(
          "You have selected a format that doesn't match the data provided from the file... please try another format (Date error)"
        );
        return;
      }
    }

    update = this.logicHelper(newFormatSplit, finalArray, newDateSplit);
    if (update === null || update === undefined) {
      return;
    }

    const obj = {
      id: this.props.id,
      sesarSelected: title,
      oldValue: this.props.value,
      value: update,
      header: this.props.title
    };
    this.props.dropdownUpdate(obj);

    return update;

    // next step is to store this sesar format date into the redux store for the correct field upon choosing one of the date options
    // also, there should be some robust error handling that checks the value to make sure it even qualifies as a date
    // also to think further on that, check if the users value matches their format selection, if not send an error
  };

  // checks if a date has been selected in the store
  dateSelected = () => {
    let found = false;
    for (let i = 0; i < this.props.ent.length; i++) {
      if (
        this.props.ent[i].sesarTitle === "collection_start_date" ||
        this.props.ent[i].sesarTitle === "collection_end_date"
      ) {
        found = true;
      }
    }
    return found;
  };

  // update onClick function that parses through your selection and how to handle it
  // Handled differently based on if it is a one2one, multivalue, or a date selection
  updateValueHelper = (newValue, isAutomatic) => {
    let breakOrFormat;

    if (this.props.dateFormat != null)
      breakOrFormat = this.props.dateFormat.split(" ");

    if (
      (newValue === "collection_end_date" ||
        newValue === "collection_start_date") &&
      !this.props.hasChosen
    ) {
      //if dateformat and dropdownoption is not chosen do this
      if (!this.props.dropDownChosen) {
        alert("You have not selected a date format...");
        this.props.refresh();
        console.log("Please choose a date format!!!");
      }
      return;
    } else if (
      (newValue === "collection_end_date" ||
        newValue === "collection_start_date") &&
      this.props.hasChosen
    ) {
      if (
        (breakOrFormat.includes("/") || breakOrFormat.includes("-")) &&
        (!this.props.value.includes("/") || !this.props.value.includes("-"))
      ) {
        alert("Delimiter error");
        this.props.refresh();
        console.log(
          "You have selected a format that doesn't match the data provided from the file... please try another format (Delimiter error)"
        );
        return;
      } else if (
        (this.props.dateFormat.includes("/") ||
          this.props.dateFormat.includes("-")) &&
        (!this.props.value.includes("/") && !this.props.value.includes("-"))
      ) {
        alert("Delimiter error");
        this.props.refresh();
        console.log(
          "You have selected a format that doesn't match the data provided from the file... please try another format (Delimiter error)"
        );
        return;
      }

      // if entries[id] contains one of these but newValue !== that, subtract that index

      let update = this.formatDate(
        this.props.value,
        this.props.dateFormat,
        newValue
      );

      if (update !== undefined) {
        this.props.callback(update);
      }
      return;
    }

    let objects = [
      "size",
      "description",
      "sample_comment",
      "geological_age",
      "field_name"
    ];

    for (let i = 0; i < objects.length; i++) {
      if (
        objects[i] === this.props.ent[this.props.id].sesarTitle &&
        newValue !== objects[i]
      ) {
        const obj = {
          num: this.props.totalMulti[i].count - 1,
          ftitle: objects[i],
          findex: i
        };
        this.props.totalMultiValueCount(obj);
      }
    }

    let headerOverride = this.props.title;
    let valueOverride = this.props.value;
    if (this.props.ent[this.props.id].header === "<METADATA>") {
      headerOverride = this.props.ent[this.props.id].header;
      valueOverride = this.props.ent[this.props.id].value;
    }

    const obj = {
      id: this.props.id,
      sesarSelected: newValue,
      value: valueOverride,
      header: headerOverride,
      bool: true,
      dropOption: this.props.dropDownChosen
    };

    if (
      (this.props.ent[this.props.id].header !== "<METADATA_ADD>" &&
        this.props.ent[this.props.id].header !== "0<METADATA_ADD>" &&
        this.props.ent[this.props.id].header !== "1<METADATA_ADD>" &&
        this.props.ent[this.props.id].header !== "2<METADATA_ADD>" &&
        this.props.ent[this.props.id].header !== "3<METADATA_ADD>" &&
        this.props.ent[this.props.id].header !== "4<METADATA_ADD>") ||
      newValue !== this.props.ent[this.props.id].sesarTitle
    ) {
      this.props.dropdownUpdate(obj);
    }

    //this.updateMulti()

    if (
      this.props.value !== undefined &&
      (this.props.ent[this.props.id].header !== "<METADATA>" ||
        newValue !== this.props.ent[this.props.id].sesarTitle)
    ) {
      this.props.callback(this.props.value, newValue);
      return;
    }
    //this.props.value.toLowerCase().replace(/[ -/*_#]/g, '')
    if (this.props.ent[this.props.id].header === "<METADATA>") {
      this.props.callback(this.props.ent[this.props.id].value, newValue);
      return;
    }
  };

  // uses the clicked list-item in the dropdown to create an object to be passed into the dropdownUpdate action
  // updates specific object in the redux store
  updateValue = e => {
    const newValue = e.target.value;
    this.updateValueHelper(newValue, false);
  };

  // automatically updates the right side content if a js file is loaded in, no dropdown click necessary
  updateValueToggle = () => {
    const newValue = this.props.ent[this.props.id].sesarTitle;

    this.updateValueHelper(newValue, true);
  };

  entWithContent = entries => {
    let index = -1;
    for (let i = 0; i < entries.length; i++) {
      if (typeof entries === "string") break;
      if (entries[i].value !== "") index = i;
    }
    return index;
  };

  // function that searches the ent array in the store for any index with content
  entEnd = entries => {
    let index = -1;
    for (let i = 0; i < entries.length; i++) {
      if (typeof entries === "string") break;
      if (entries[i].value !== "") index = i;
    }
    return entries.length - 1;
  };

  // counts the number of times size is selected
  sizeArrayLoop = () => {
    let count = 0;
    for (let i = 0; i < this.props.ent.length; i++) {
      if (this.props.ent[i].sesarTitle === "size") count += 1;
    }
    return count;
  };

  // when the component mounts, run the toggle function once automatically so if JS mapping file has a selected date
  // it is automatically formatted
  componentDidMount() {
    let obj = {
      bool: true
    };
    this.props.toggleInUse(obj);
    this.forceUpdate();
  }

  // automatically updates the right side content if a js file is loaded in, no dropdown click necessary
  toggleNotInUse = () => {
    let obj = {
      bool: false
    };

    if (
      this.props.hasInit &&
      this.props.usingToggle === true &&
      this.props.id !== this.entEnd(this.props.ent)
    ) {
      this.updateValueToggle();
    } else if (
      this.props.hasInit &&
      this.props.usingToggle === true &&
      this.props.id === this.entEnd(this.props.ent)
    ) {
      this.props.toggleInUse(obj);
    }
  };

  // checks the store for any entrie that already has a sesarSelection, and returns true/that value
  hasSesarValue = () => {
    let arr = [false, ""];
    if (this.props.hasInit && this.props.ent[this.props.id].sesarTitle !== "") {
      arr = [true, this.props.ent[this.props.id].sesarTitle];
    }
    return arr;
  };

  //checks to see if a metaDataAdd sesar title has already been chosen in another dropdown
  checkForMetaDataAdd = title => {
    let valid = false;
    let metaAddSesarTitles = ["sample_type", "elevation_unit", "material"];
    let indexFound = metaAddSesarTitles.indexOf(title);
    if (indexFound > -1) {
      for (let i = 0; i < this.props.ent.length; i++) {
        if (metaAddSesarTitles[indexFound] === this.props.ent[i].sesarTitle)
          valid = true;
      }
    }
    return valid;
  };

  //forces the first fieldCard dropdown to only show user_code
  createUserCodeOption = title => {
    let allowUserCode = false;
    const userCode = "user_code";

    if (title === userCode && this.props.id === 0) {
      allowUserCode = true;
    }
    return allowUserCode;
  };

  checkStoreForTitle = fTitle => {
    let valid = false;
    for (let i = 0; i < this.props.ent.length; i++) {
      if (this.props.ent[i].sesarTitle === fTitle) valid = true;
    }
    return valid;
  };

  alreadyInDropdown = (arr, value) => {
    let array = arr;
    array.push(value);
    return array;
  };

  render() {
    //the list of one to one values
    const sesarOne2One = this.state.sesarOneToOne;
    //for tracking the very first instance of filter being called
    let num = -1;

    let firstLoad = dropdownSet(
      this.props.hasInit,
      this.props.ent,
      this.props.id
    );

    //style for hiding dropdown for disabled cards
    let display = 1;
    if (this.props.hasInit && !this.props.shouldAppear) {
      display = -1;
    } else display = "auto";

    // automatically updates the right side content if a js file is loaded in, no dropdown click necessary
    this.toggleNotInUse();

    // helper function to list "options" based on the 'type' of field (numbers or letters...)
    let filter = f => {
      num += 1;
      //if the very first call of filter return firstLoad, which is either "Sesar Selection" or SesarTitle from the store (from JS file)
      if (num === 0) {
        return (
          <option key={f.title} value={firstLoad} disabled hidden>
            {firstLoad}
          </option>
        );
      }

      if (num === 1) {
        return (
          <option key={f.title} value={"none"}>
            {"none"}
          </option>
        );
      }
      let metaAddSesarTitles = ["sample_type", "elevation_unit", "material"];
      //if an added card only show the exclusive added sesartitle fields
      if (this.props.hasInit && this.props.fieldType === "added_card") {
        if (
          this.props.id !== 0 &&
          this.checkForMetaDataAdd(f.title) === false &&
          metaAddSesarTitles.includes(f.title)
        ) {
          return (
            <option key={f.title} value={f.title}>
              {f.title}
            </option>
          );
        } else if (this.createUserCodeOption(f.title)) {
          return (
            <option key={f.title} value={f.title}>
              {f.title}
            </option>
          );
        } else if (
          this.hasSesarValue()[0] === true &&
          this.hasSesarValue()[1] === f.title &&
          metaAddSesarTitles.includes(f.title)
        ) {
          return null;
        } else return;
      }

      if (
        num > 0 &&
        this.props.hasInit &&
        this.hasSesarValue()[0] === true &&
        this.hasSesarValue()[1] === f.title
      ) {
        return (
          <option key={f.title} value={this.hasSesarValue()[1]} disabled hidden>
            {this.hasSesarValue()[1]}
          </option>
        );
      }

      //always gives multiValue
      if (this.props.hasInit && this.state.sesarMulti.includes(f.title)) {
        let ital = f.title.italics();
        //console.log(ital)
        return (
          <option style={{ fontStyle: "italic" }} key={f.title} value={f.title}>
            {f.title}
          </option>
        );
      }
      //gives unused One to One values
      if (
        !this.props.useOnce.includes(f.title) &&
        !isSesarTitlePresent(f.title, this.props.ent)
      ) {
        //console.log(f.title + ": Flag 5" + this.hasSesarValue()[1]);
        //console.log(this.props.useOnce);
        return (
          <option key={f.title} value={f.title}>
            {f.title}
          </option>
        );
      }
      //this case should be impossible, need time to test
      else if (
        this.props.useOnce.includes(f.title) &&
        !sesarOne2One.includes(f.title)
      ) {
        return (
          <option key={f.title} value={f.title}>
            {f.title}
          </option>
        );
      }
      //this case should be unreachable, need time to test
      else return null;
    };

    // creates the dropdown, uses filter() to specify which items are included in dropdown

    return (
      <div className="dropDown">
        <select
          style={{
            maxHeight: "30px",
            display: "inline-block",
            width: "170px",
            zIndex: display
          }}
          defaultValue={firstLoad}
          className="ui dropdown"
          prompt="Please select option"
          onChange={this.updateValue}
        >
          {this.props.list.map(field => filter(field))}
        </select>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    multi: state.multiValues,
    ent: state.entries,
    useOnce: state.useOnce,
    dateFormat: state.chosenDateFormat,
    hasChosen: state.hasChosenDateFormat,
    dropDownChosen: state.hasChosenDropdownOption,
    num: state.numOfOneToOne,
    hasChosenCentury: state.centuryChosen,
    century: state.century,
    multiValues: state.multiValues,
    sizeArray: state.sizeArray,
    hasInit: state.hasInit,
    pairArr: state.sizeOuterArray,
    usingToggle: state.toggleInUse,
    totalMulti: state.totalMultiCount
  };
};

export default connect(
  mapStateToProps,
  {
    setForcedOldToNew,
    totalMultiValueCount,
    removeContent,
    dropdownUpdate,
    multiValueCreate,
    multiValueCreateFinish,
    setSubstringDateFormat,
    toggleInUse
  }
)(DropDown);
