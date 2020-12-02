///////////////////////////////////////////////////////////////////////////////////////
// FIELDCARD.JS //////////////////////////////////////////////////////////////////////
// This component displays  a checkbox on the left of each fieldCard ////////////////
// Giving the user to decide if they want to use that fieldCard in the map or not //
///////////////////////////////////////////////////////////////////////////////////

import React from "react";
import "./App.scss";
import classNames from "classnames";
import { connect } from "react-redux";
import CheckboxExample from "./CheckBox";
import DropDown from "./DropDown";
import {
  removeContent,
  totalMultiValueCount,
  forceEdit,
  persistingDataConcat
} from "../actions";
const { options } = require("./sesarOptions");

export class FieldCard extends React.Component {
  state = {
    sesarChosen: "",
    dropDownChosen: false,
    resetDropDown: false,
    isDate: false,
    isMeasurement: false,
    areEditing: true,
    updatedValue: this.props.fieldValue,
    type: this.props.fieldType,
    key: this.props.key,
    isGreen: this.props.hasContent,
    sesarOptions: options,
    formattedString: "",
    index: -1
  };

  // switch between CSS classes to switch between green and white
  btnClass = classNames({
    field_container3: this.props.addedNewField,
    field_container1: this.state.isGreen,
    field_container2: !this.state.isGreen
  });

  // helper function to limit length of 'fieldValue' displayed in the UI
  lengthCheckedValue = fieldVal => {
    let value = fieldVal;
    if (value === "<METADATA_ADD>") {
      value = "";
    } else if (value.length > 25) {
      value = value.slice(0, 20);
      value = value + "...";
    }
    return value;
  };

  getMulti = () => {
    let arr = [];
    for (let i = 0; i < this.state.sesarOptions.length; i++) {
      if (this.state.sesarOptions[i].format === "multivalue") {
        arr.push(this.state.sesarOptions[i].title);
      }
    }
    return arr;
  };

  getOne2One = () => {
    let arr = [];
    for (let i = 0; i < this.state.sesarOptions.length; i++) {
      if (this.state.sesarOptions[i].format === "one2one")
        arr.push(this.state.sesarOptions[i].title);
    }
    return arr;
  };

  // helper function to display a dropdown IFF it is also green / checked!
  // sizeCallback={this.getSizeCallback}
  filterDrop = () => {
    //if (this.state.isGreen === true)
    return (
      <DropDown
        shouldAppear={this.state.isGreen}
        addedNew={this.props.addedNewField}
        refresh={this.refreshFieldCard}
        callback={this.fileCallback}
        title={this.props.fieldTitle}
        id={this.props.id}
        value={this.props.fieldValue}
        fieldType={this.state.type}
        multiList={this.getMulti()}
        one2one={this.getOne2One()}
        list={this.state.sesarOptions}
      />
    );
    // else return <div className="dropDownNoData">{"   "}</div>;
  };

  // onClick of the checkmark, change the color of the bar between green and white

  //this function is for the check of rendering a missing field card to the UI
  //change total added cards for changing how many
  isMetaDataAddCard = cardID => {
    let totalAddedCards = 4;
    //console.log("Are you true? " + cardID + "  " + (cardID < totalAddedCards))
    return cardID < totalAddedCards;
  };

  fileCallback = (data, title) => {
    let currentComponent = this;

    if (this.isMetaDataAddCard(this.props.id)) {
      let value;
      value = this.props.ent[this.props.id].value;

      currentComponent.setState({ updatedValue: value });
      return;
    }
    //console.log("This needs to be a multi value ONLY::::::  "+ title)
    if (this.getMulti().includes(title)) {
      //first two cases: if fieldcard sesarSelected is set to a multivalue
      // if non empty value for multivalue
      // else empty value

      if (data !== "") {
        currentComponent.setState({
          updatedValue: this.props.fieldTitle + ":" + data,
          dropDownChosen: true,
          formattedString: this.multiStringOutputFunction(this.props.id, title)
        });
      } else
        currentComponent.setState({
          updatedValue: this.props.fieldTitle + ":Not Provided",
          dropDownChosen: true,
          formattedString: this.multiStringOutputFunction(this.props.id, title)
        });
    } else if (this.props.fieldValue === "") {
      if (this.props.ent[this.props.id].value === "")
        currentComponent.setState({
          updatedValue: "Not Provided",
          dropDownChosen: true,
          index: -1
        });
    } else if (title === "first") {
      currentComponent.setState({
        updatedValue: data,
        dropDownChosen: true,
        index: -1
      });
    } else {
      if (
        this.props.ent[this.props.id].header === "<METADATA>" ||
        (this.props.ent[this.props.id].header.includes("<METADATA_ADD>") &&
          !this.props.ent[this.props.id].value.includes("<METADATA_ADD>"))
      ) {
        currentComponent.setState({
          updatedValue: data,
          dropDownChosen: true,
          index: -1
        });
      } else {
        currentComponent.setState({
          updatedValue: data,
          dropDownChosen: true,
          index: -1
        });
      }
    }
  };

  multiValuesBoolHelp = jsFileValue => {
    let valid = false;
    let options = this.getMulti();

    for (let i = 0; i < options.length; i++) {
      if (jsFileValue === options[i]) {
        valid = true;
      }
    }

    return valid;
  };

  //countMultiValue = ()

  jsFileValueToggle = () => {
    let valid = false;
    if (this.props.jsFileValues !== undefined) {
      for (let i = 0; i < this.props.jsFileValues.length; i++) {
        if (
          this.props.jsFileValues[i][1] === this.props.fieldTitle &&
          this.multiValuesBoolHelp(this.props.jsFileValues[i][0])
        )
          valid = true;
      }
    }

    return valid;
  };

  greenToggle = () => {
    this.jsFileValueToggle();
    let currentComponent = this;
    currentComponent.setState({
      isGreen: !this.state.isGreen,
      updatedValue: this.props.fieldValue
    });

    const obj = {
      oldValue: this.props.fieldValue,
      value: this.props.fieldValue,
      header: this.props.fieldTitle,
      id: this.props.id,
      isGreen: !this.state.isGreen
    };
    this.props.removeContent(obj);
    this.setState({ isGreen: !this.state.isGreen });
    this.render();
  };

  refreshFieldCard = () => {
    setTimeout(() => {
      let obj = {
        oldValue: this.props.fieldCard,
        id: this.props.id,
        value: this.props.fieldValue,
        header: this.props.fieldTitle,
        isGreen: this.props.isGreen
      };
      this.setState({ isGreen: !this.state.isGreen });
      this.setState({ sesarChosen: "", updatedValue: this.props.fieldValue });
      this.props.removeContent(obj);
    }, 0); // ------------------------------> timeout 0

    setTimeout(() => {
      this.setState({ isGreen: !this.state.isGreen });
    }, 10);
  };

  entMultiSizeCount = (id, title) => {
    let objects = this.getMulti();
    console.log(objects);
    let index;
    let count;
    if (this.props.jsFileValues === undefined) count = 1;
    else count = 0;

    for (let i = 0; i < this.props.ent.length; i++) {
      if (this.props.ent[i].sesarTitle === title) {
        count += 1;
      }
    }
    for (let j = 0; j < objects.length; j++) {
      if (objects[j] === title) index = j;
    }

    const obj = {
      num: count,
      ftitle: title,
      findex: index
    };

    this.props.totalMultiValueCount(obj);

    return "Total: " + String(count);
  };

  findMultiValueSpot = (id, title) => {
    let searchOption = "";
    let count = 1;
    searchOption = title;

    for (let i = 0; i < this.props.ent.length; i++) {
      if (this.props.ent[i].sesarTitle === searchOption) count += 1;
    }
    return String(count);
  };

  multiStringOutputFunction = (id, title) => {
    this.entMultiSizeCount(id, title);
    let valid = false;
    let objects = this.getMulti();
    let index;
    for (let j = 0; j < objects.length; j++) {
      if (objects[j] === title) {
        index = j;
        valid = true;
      }
    }

    if (valid === false) {
      this.setState({ index: -1 });
      this.forceUpdate();
    } else this.setState({ index: index });

    let formattedString = this.entMultiSizeCount(id, title);
    this.setState({ formattedString: formattedString });
    return formattedString;
  };

  isMultiValue = title => {
    let objects = this.getMulti();
    let valid = false;
    for (let j = 0; j < objects.length; j++) {
      if (objects[j] === title) valid = true;
    }
    return valid;
  };

  areEditing = () => {
    this.setState({ areEditing: !this.state.areEditing });
  };

  forceEdit = event => {
    let obj = {};
    let persistentMetaData = {};

    console.log(event.key + " and type: " + typeof event.key);
    if (event.key === "Enter" || typeof event.key === undefined) {
      console.log(this.props.ent[this.props.id].value);
      persistentMetaData = {
        index: this.props.id,
        value: event.target.value,
        header: this.props.ent[this.props.id].header,
        forceID: this.props.persist.length,
        sesar: this.props.ent[this.props.id].sesarTitle,
        isMetaData: !(
          this.props.hasInit &&
          this.props.ent[this.props.id].header.includes("<METADATA_ADD>")
        ),
        isMetaDataAdd:
          this.props.hasInit &&
          this.props.ent[this.props.id].header.includes("<METADATA_ADD>")
      };

      if (event.key === "Enter") {
        persistentMetaData.value = event.target.value;
        this.setState({
          areEditing: !this.state.areEditing,
          updatedValue: event.target.value
        });
      } else {
        this.setState({
          updatedValue: event.target.value
        });
      }

      if (this.props.ent[this.props.id].header.includes("<METADATA_ADD>")) {
        obj = {
          index: this.props.id,
          value: event.target.value,
          header: "<METADATA_ADD>"
        };
      } else {
        obj = {
          index: this.props.id,
          value: event.target.value,
          header: "<METADATA>"
        };
      }

      let alreadySet = false;
      for (let i = 0; i < this.props.persist.length; i++) {
        if (
          this.props.persist[i].index === persistentMetaData.index &&
          this.props.ent[this.props.persist[i].index].sesarTitle ===
            this.props.persist[i].sesar
        ) {
          alreadySet = true;
          break;
        }
      }

      if (alreadySet) {
        console.log("Header already recorded");
      } else {
        this.props.persistingDataConcat(persistentMetaData);
      }

      this.props.forceEdit(obj);
    } else {
      this.setState({ updatedValue: event.target.value });
    }
  };

  editPlaceholderText = () => {
    let valueInStore = this.props.ent[this.props.id].value;
    let headerInStore = this.props.ent[this.props.id].header;
    let inputPlaceHolder = "Edit content...";

    if (
      (this.isMetaDataAddCard(this.props.id) &&
        (valueInStore !== "<METADATA_ADD>" &&
          valueInStore !== "ADDED_CARD : 1")) ||
      headerInStore === "<METADATA>"
    ) {
      inputPlaceHolder = valueInStore;
    }
    return inputPlaceHolder;
  };

  currentTotal = () => {
    console.log(this.props.id);
    console.log(this.props.ent);
    console.log(this.props.totalMulti);
    for (let i = 0; i < this.props.totalMulti.length; i++) {
      if (
        this.props.hasInit &&
        this.props.totalMulti[i].title ===
          this.props.ent[this.props.id].sesarTitle
      ) {
        return "Total:" + this.props.totalMulti[i].count;
      }
    }
  };

  render() {
    //these renders return different fieldcards based on the hiding toggle value

    //removes the unchecked field card
    if (this.props.hiding && this.state.isGreen === false) return null;
    //returns the green styled field card
    else if (this.state.isGreen) {
      //if a JS file was loaded and this card does not have a dropdown selected
      if (
        this.jsFileValueToggle() === true &&
        this.state.dropDownChosen === false
      ) {
        //and its header loaded in was METADATA **refactor to use isMetadata**
        if (
          this.props.hasInit &&
          this.props.ent[this.props.id].header === "<METADATA>"
        ) {
          return (
            <div className="ui label">
              <div className="fieldContainerMetadataAdd">
                <object>
                  <div className="check__box">
                    <CheckboxExample
                      greenCallback={this.greenToggle}
                      isChecked={this.state.isGreen}
                    />
                  </div>
                  <div dir="rtl" className="description__title">
                    {this.props.fieldTitle}
                  </div>
                  <div className="description__value"></div>
                </object>
                <object className="arrow">
                  <i
                    className="fa fa-angle-double-right"
                    style={{ zIndex: 1 }}
                  ></i>
                </object>
                <object className="descriptionMapped" align="right">
                  {this.state.areEditing === true ? (
                    <div className="description__mapped__content">
                      {this.lengthCheckedValue(
                        this.props.fieldTitle + ": " + this.props.fieldValue
                      )}
                      {this.props.fieldValue.length > 25 ? (
                        <span className="hiddentext">
                          {this.props.fieldValue}
                        </span>
                      ) : null}
                    </div>
                  ) : (
                    <div
                      style={{
                        paddingTop: ".8em",
                        display: "inline-block",
                        width: "150px",
                        paddingRight: "35px"
                      }}
                      class="ui input"
                    >
                      <input
                        value={this.state.updatedValue}
                        onChange={this.forceEdit}
                        onKeyPress={this.forceEdit}
                        style={{ display: "inline-block", width: "150px" }}
                        type="text"
                        placeholder={this.editPlaceholderText()}
                      />
                    </div>
                  )}
                  {this.filterDrop()}

                  {this.props.hasInit === true &&
                  this.props.ent[this.props.id].sesarTitle !== "" &&
                  this.isMultiValue(
                    this.props.ent[this.props.id].sesarTitle
                  ) === false ? (
                    <div
                      style={{
                        paddingTop: "8px",
                        paddingLeft: "10px",
                        float: "right",
                        display: "inline"
                      }}
                    >
                      <button
                        onClick={() => this.areEditing()}
                        style={{ float: "right", width: "35px" }}
                        class="ui icon button"
                      >
                        <i class="edit outline icon"></i>
                      </button>
                    </div>
                  ) : (
                    <div
                      style={{
                        paddingLeft: "10px",
                        float: "right",
                        display: "inline",
                        visibility: "hidden"
                      }}
                    >
                      <button
                        style={{ float: "right", width: "35px" }}
                        class="ui icon button"
                      >
                        <i class="edit outline icon"></i>
                      </button>
                    </div>
                  )}
                </object>
              </div>
            </div>
          );
        } else {
          {
            /*header was not metadata, create normal fieldcard **dropdown was not preselected from JS file***/
          }
          return (
            <div className="ui label">
              <div className="fieldContainer1">
                <object>
                  <div className="check__box">
                    <CheckboxExample
                      greenCallback={this.greenToggle}
                      isChecked={this.state.isGreen}
                    />
                  </div>
                  <div dir="rtl" className="description__title">
                    {this.props.fieldTitle}
                  </div>
                  <div className="description__value">
                    {" "}
                    {":        " +
                      this.lengthCheckedValue(this.props.fieldValue)}
                    {this.props.fieldValue.length > 25 ? (
                      <span className="hiddentext">
                        {this.props.fieldValue}
                      </span>
                    ) : null}
                  </div>
                </object>
                <object className="arrow">
                  <i
                    className="fa fa-angle-double-right"
                    style={{ zIndex: 1 }}
                  ></i>
                </object>
                <object className="descriptionMapped" align="right">
                  {/*left side of fieldcard*/}
                  {this.state.areEditing === true ? (
                    <div className="description__mapped__content">
                      {this.lengthCheckedValue(this.props.fieldValue)}{" "}
                      {this.props.fieldValue.length > 25 ? (
                        <span className="hiddentext">
                          {this.props.fieldValue}
                        </span>
                      ) : null}
                    </div>
                  ) : (
                    <div
                      style={{
                        paddingTop: ".8em",
                        display: "inline-block",
                        width: "150px",
                        paddingRight: "35px"
                      }}
                      class="ui input"
                    >
                      <input
                        value={this.state.updatedValue}
                        onChange={this.forceEdit}
                        onKeyPress={this.forceEdit}
                        style={{ display: "inline-block", width: "150px" }}
                        type="text"
                        placeholder={this.editPlaceholderText()}
                      />
                    </div>
                  )}
                  {this.filterDrop()}

                  {/*If dropdown value is chosen, and value is not a multivalue display edit button */}
                  {this.props.hasInit === true &&
                  this.props.ent[this.props.id].sesarTitle !== "none" &&
                  this.props.ent[this.props.id].sesarTitle !== "" &&
                  this.isMultiValue(
                    this.props.ent[this.props.id].sesarTitle
                  ) === false ? (
                    <div
                      style={{
                        paddingTop: "8px",
                        paddingLeft: "10px",
                        float: "right",
                        display: "inline"
                      }}
                    >
                      <button
                        onClick={() => this.areEditing()}
                        style={{ float: "right", width: "35px" }}
                        class="ui icon button"
                      >
                        <i class="edit outline icon"></i>
                      </button>
                    </div>
                  ) : (
                    <div
                      style={{
                        paddingLeft: "10px",
                        float: "right",
                        display: "inline"
                      }}
                    >
                      {" "}
                      {this.props.hasInit && this.state.index !== -1
                        ? "ddd" +
                          this.entMultiSizeCount(
                            this.props.id,
                            this.props.ent[this.props.id].sesarTitle
                          )
                        : null}
                    </div>
                  )}
                </object>
              </div>
            </div>
          );
        }
      } else if (
        this.props.hasInit &&
        this.props.ent[this.props.id].sesarTitle !== "none" &&
        this.props.ent[this.props.id].header === "<METADATA>"
      ) {
        return (
          <div className="ui label">
            <div className="fieldContainerMetadata">
              <object>
                <div className="check__box">
                  <CheckboxExample
                    greenCallback={this.greenToggle}
                    isChecked={this.state.isGreen}
                  />
                </div>
                <div dir="rtl" className="description__title">
                  {this.props.fieldTitle}
                </div>
                <div className="description__value">
                  {" "}
                  {":        " + this.lengthCheckedValue(this.props.fieldValue)}
                </div>
              </object>
              <object className="arrow">
                <i
                  className="fa fa-angle-double-right"
                  style={{ zIndex: 1 }}
                ></i>
              </object>
              <object className="descriptionMapped" align="right">
                {this.props.hasInit === true &&
                this.state.areEditing === true ? (
                  <div className="description__mapped__content">
                    {this.lengthCheckedValue(this.state.updatedValue)}
                    <span className="hiddentext">
                      {this.props.ent[this.props.id].value}
                    </span>
                  </div>
                ) : (
                  <div
                    style={{
                      paddingTop: ".8em",
                      display: "inline-block",
                      width: "150px",
                      paddingRight: "35px"
                    }}
                    class="ui input"
                  >
                    <input
                      value={this.state.updatedValue}
                      onChange={this.forceEdit}
                      onKeyPress={this.forceEdit}
                      style={{ display: "inline-block", width: "150px" }}
                      type="text"
                      placeholder={this.editPlaceholderText()}
                    />
                  </div>
                )}
                {this.filterDrop()}
                {this.props.hasInit === true &&
                this.props.ent[this.props.id].sesarTitle !== "" &&
                this.isMultiValue(this.props.ent[this.props.id].sesarTitle) ===
                  false ? (
                  <div
                    style={{
                      paddingTop: "8px",
                      paddingLeft: "10px",
                      float: "right",
                      display: "inline"
                    }}
                  >
                    <button
                      onClick={() => this.areEditing()}
                      style={{ float: "right", width: "35px" }}
                      class="ui icon button"
                    >
                      <i class="edit outline icon"></i>
                    </button>
                  </div>
                ) : (
                  <div
                    style={{
                      paddingLeft: "10px",
                      float: "right",
                      display: "inline",
                      visibility: "hidden"
                    }}
                  >
                    <button
                      style={{ float: "right", width: "35px" }}
                      class="ui icon button"
                    >
                      <i class="edit outline icon"></i>
                    </button>
                  </div>
                )}
                <div
                  style={{
                    visibility: "hidden",
                    paddingLeft: "10px",
                    float: "right",
                    display: "inline"
                  }}
                >
                  <div style={{ float: "right", width: "35px" }}>
                    {this.props.hasInit && this.state.index !== -1
                      ? "sss" +
                        this.entMultiSizeCount(
                          this.props.id,
                          this.props.ent[this.props.id].sesarTitle
                        )
                      : ""}
                  </div>
                </div>
              </object>
            </div>
          </div>
        );
      } else {
        if (this.isMetaDataAddCard(this.props.id)) {
          return (
            <div className="ui label">
              <div className="fieldContainerMetadataAdd">
                <object>
                  <div className="check__box">
                    {this.props.id === 0 ? (
                      <div> </div>
                    ) : (
                      <div>
                        <CheckboxExample
                          greenCallback={this.greenToggle}
                          isChecked={this.state.isGreen}
                        />
                      </div>
                    )}
                  </div>
                  <div dir="rtl" className="description__title">
                    {"Missing field"}
                  </div>
                  <div className="description__value"></div>
                </object>
                <object className="arrow">
                  <i
                    className="fa fa-angle-double-right"
                    style={{ zIndex: 1 }}
                  ></i>
                </object>
                <object className="descriptionMapped" align="right">
                  {this.state.areEditing === true ? (
                    <div className="description__mapped__content">
                      {this.props.hasInit &&
                      this.props.ent[this.props.id].sesarTitle !== "" &&
                      this.props.ent[this.props.id].sesarTitle !== "none"
                        ? this.lengthCheckedValue(this.state.updatedValue)
                        : null}
                      {this.props.fieldValue.length > 25 ? (
                        <span className="hiddentext">
                          {this.props.fieldValue}
                        </span>
                      ) : null}
                    </div>
                  ) : (
                    <div
                      style={{
                        paddingTop: ".8em",
                        display: "inline-block",
                        width: "150px",
                        paddingRight: "35px"
                      }}
                      class="ui input"
                    >
                      <input
                        onKeyPress={this.forceEdit}
                        style={{ display: "inline-block", width: "150px" }}
                        type="text"
                        placeholder={this.editPlaceholderText()}
                      />
                    </div>
                  )}
                  {this.filterDrop()}
                  {this.props.hasInit === true &&
                  this.props.ent[this.props.id].sesarTitle !== "" &&
                  this.isMultiValue(
                    this.props.ent[this.props.id].sesarTitle
                  ) === false ? (
                    <div
                      style={{
                        paddingTop: "8px",
                        paddingLeft: "10px",
                        float: "right",
                        display: "inline"
                      }}
                    >
                      <button
                        onClick={() => this.areEditing()}
                        style={{ float: "right", width: "35px" }}
                        class="ui icon button"
                      >
                        <i class="edit outline icon"></i>
                      </button>
                    </div>
                  ) : (
                    <div
                      style={{
                        paddingLeft: "10px",
                        float: "right",
                        display: "inline",
                        visibility: "hidden"
                      }}
                    >
                      <button
                        style={{ float: "right", width: "35px" }}
                        class="ui icon button"
                      >
                        <i class="edit outline icon"></i>
                      </button>
                    </div>
                  )}
                  <div
                    style={{
                      visibility: "hidden",
                      paddingLeft: "10px",
                      float: "right",
                      display: "inline"
                    }}
                  >
                    <div style={{ float: "right", width: "35px" }}>
                      {this.props.hasInit && this.state.index !== -1
                        ? this.entMultiSizeCount(
                            this.props.id,
                            this.props.ent[this.props.id].sesarTitle
                          )
                        : ""}
                    </div>
                  </div>
                </object>
              </div>
            </div>
          );
        } else {
          // this is the others two csv bug where edit icon doesn't show up
          return (
            <div className="ui label">
              <div className="fieldContainer1">
                <object>
                  <div className="check__box">
                    <CheckboxExample
                      greenCallback={this.greenToggle}
                      isChecked={this.state.isGreen}
                    />
                  </div>
                  <div dir="rtl" className="description__title">
                    {this.props.fieldTitle}
                  </div>
                  <div className="description__value">
                    {" "}
                    {":        " +
                      this.lengthCheckedValue(this.props.fieldValue)}
                    {this.props.fieldValue.length > 25 ? (
                      <span className="hiddentext">
                        {this.props.fieldValue}
                      </span>
                    ) : null}
                  </div>
                </object>
                <object className="arrow">
                  <i
                    className="fa fa-angle-double-right"
                    style={{ zIndex: 1 }}
                  ></i>
                </object>
                <object className="descriptionMapped" align="right">
                  {this.state.areEditing === true ? (
                    <div className="description__mapped__content">
                      {this.props.hasInit &&
                      this.props.ent[this.props.id].sesarTitle !== "" &&
                      this.props.ent[this.props.id].sesarTitle !== "none"
                        ? this.lengthCheckedValue(this.state.updatedValue)
                        : null}
                      {this.state.updatedValue.length > 25 ? (
                        <span className="hiddentext">
                          {this.state.updatedValue}
                        </span>
                      ) : null}
                    </div>
                  ) : (
                    <div
                      style={{
                        paddingTop: ".8em",
                        display: "inline-block",
                        width: "150px",
                        paddingRight: "35px"
                      }}
                      class="ui input"
                    >
                      <input
                        value={this.state.updatedValue}
                        onKeyPress={this.forceEdit}
                        onChange={this.forceEdit}
                        style={{ display: "inline-block", width: "150px" }}
                        type="text"
                        placeholder="Edit Content..."
                      />
                    </div>
                  )}

                  {this.filterDrop()}
                  {this.props.hasInit === true &&
                  this.props.ent[this.props.id].sesarTitle !== "none" &&
                  this.props.ent[this.props.id].sesarTitle !== "" &&
                  this.isMultiValue(
                    this.props.ent[this.props.id].sesarTitle
                  ) === false ? (
                    <div
                      style={{
                        paddingTop: "8px",
                        paddingLeft: "10px",
                        float: "right",
                        display: "inline"
                      }}
                    >
                      <button
                        onClick={() => this.areEditing()}
                        style={{ float: "right", width: "35px" }}
                        class="ui icon button"
                      >
                        <i class="edit outline icon"></i>
                      </button>
                    </div>
                  ) : (
                    <div
                      style={{
                        paddingLeft: "10px",
                        float: "right",
                        display: "inline",
                        visibility: "hidden"
                      }}
                    >
                      <button
                        style={{ float: "right", width: "35px" }}
                        class="ui icon button"
                      >
                        <i class="edit outline icon"></i>
                      </button>
                    </div>
                  )}

                  <div
                    style={{
                      paddingTop: "10px",
                      paddingLeft: "10px",
                      float: "right",
                      display: "inline"
                    }}
                  >
                    <div style={{ float: "right", width: "35px" }}>
                      {this.props.hasInit && this.state.index !== -1
                        ? this.currentTotal()
                        : ""}
                    </div>
                  </div>
                </object>
              </div>
            </div>
          );
        }
      }
    }

    // returns the white styled field card
    else {
      return (
        <div className="ui label">
          <div className="fieldContainerDisabled">
            <object>
              <div className="check__box">
                <CheckboxExample
                  greenCallback={this.greenToggle}
                  isChecked={this.state.isGreen}
                />
              </div>
              <div dir="rtl" className="description__title">
                {this.props.fieldTitle}
              </div>
              <div className="description__value">
                {" "}
                {":        " + this.lengthCheckedValue(this.props.fieldValue)}
              </div>
            </object>
            <object className="descriptionMapped" align="right">
              <div className="description__mapped__content"> </div>
              {this.filterDrop()}
            </object>
          </div>
        </div>
      );
    }
  }
}

const mapStateToProps = state => {
  return {
    ent: state.entries,
    persist: state.persistingMetaData,
    useOnce: state.useOnce,
    pairArr: state.sizeOuterArray,
    hasInit: state.hasInit,
    toggleIndex: state.toggleIndex,
    totalMulti: state.totalMultiCount,
    toggleArray: state.toggleArr
  };
};
// hello robert
export default connect(
  mapStateToProps,
  { forceEdit, removeContent, totalMultiValueCount, persistingDataConcat }
)(FieldCard);
