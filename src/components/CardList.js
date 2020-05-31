import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';

// Components
import DateDropdown from './DateDropdown';
import CenturyDropDown from './CenturyDropDown';
import FieldCard from './FieldCard';

// CSS & Style
import mars from '../icons/planet.png';
import './App.css';

// Action Creators
import { firstState } from '../actions/';
///////////////////////////////////////////////
//////////////////////////////////////////////////////////////

// there is a particular relationship between checked value and available option in dropdown
// consider formatting specs for outside of 1 to 1 version, comment fields
// add another array in store for values that adds values that can only be used once, iterate array before updating store with new dropdown clicks

const CardList = (props) => {

    // global variables for the Object Array the Redux Store is built on along with the id accumulator 

    const objArray = []
    const useOnce = []
    let newKey = -1
    const dateFormatOption = [
        { title: "Select Date Format" },
        { title: "DD/MM/YY or DD-MM-YY", value: "substring", type: "date" },
        { title: "MM/DD/YY or MM-DD-YY", value: "substring", type: "date" },
        { title: "YY/DD/MM or YY-DD-MM", value: "substring", type: "date" },
        { title: "YY/MM/DD or YY-MM-DD", value: "substring", type: "date" },
        { title: "DD/MM/YYYY or DD-MM-YYYY", value: "substring", type: "date" },
        { title: "MM/DD/YYYY or MM-DD-YYYY", value: "substring", type: "date" },
        { title: "YYYY/DD/MM or YYYY-DD-MM", value: "substring", type: "date" },
        { title: "YYYY/MM/DD or YYYY-MM-DD", value: "substring", type: "date" },
        { title: "MMDDYYYY", value: "substring", type: "date" },
        { title: "DDMMYYYY", value: "substring", type: "date" },
        { title: "YYYYDDMM", value: "substring", type: "date" },
        { title: "YYYYMMDD", value: "substring", type: "date" }
    ]

    // used to hide 'non-green / non-checked fields in the UI (hides field and checks)
    const [hide, setHide] = useState(false);
    //const [setShowModal] = useState(false)
    //showModal ^

    // helper function to dicide the the contents of dropdowns for specific fieldcards
    // if fieldValue contains "0-9 or symbols" it's 'type' will be numbers, else, the type is text
    let typeField = (f) => {

        let type;
        let numbers = /^[0-9,/.-]*$/;

        if (numbers.test(f) === true)
            type = "numbers";
        else
            type = "text"
        return type
    }

    // maps through fields and creates unique field card entry for each
    // hiding: value to hide entry or not
    // fieldTitle: column attribute of an entry
    // fieldType: defines if content is number or text
    // fieldValue: the content of an column attribute
    // hasContent: for initial filtering of checked cards

    const fields = props.fields.map((field) => {

        //create an object and add it to store
        const storedValue = {
            sesarTitle: "",
            oldValue: props.fieldVal[field],
            value: props.fieldVal[field],
            id: field,
            isDate: false,
            isMeasurement: false
        }

        // after object is created, append it to the object array & add one to the ID
        objArray.push(storedValue)
        useOnce.push("")
        newKey += 1

        // create the FieldCard that you see in the UI
        return (
            <FieldCard
                key={newKey}
                hiding={hide}
                fieldTitle={field}
                id={newKey}
                fieldType={typeField(props.fieldVal[field])}
                fieldValue={props.fieldVal[field]}
                hasContent={props.fieldVal[field] !== ""}
            />
        );
    });

    // uses the action "firstState" with the argument "objArray" to create the Redux Store ***ONE TIME***
    useEffect(() => {
        const initObj = {
            objArr: objArray,
            useOnce: useOnce
        }
        props.firstState(initObj)
    }, []);

    //funciton to pass to modal windown
    //const closeModal = () => {
    //setShowModal(false);
    //};

    // shows contents of the store if you click the "help" button in the console (FOR NOW)
    const checkStore = () => {
        console.log(props.sizeArray)
        console.log(props.ent)
    }

    // This helper function fills the multiValueArray where each index represents the "field_name", "description", or "sample_comment" selections
    const multiValueArrHelper = (options, index, multiArr) => {

        for (let j = 0; j < 3; j++) {
            if (options.indexOf(props.ent[index].sesarTitle) !== -1) {
                multiArr[options.indexOf(props.ent[index].sesarTitle)].push(props.ent[index].header + ":" + props.ent[index].value)
                break
            }
        }
    }

    // Helper function add the "field_name", "description", "sample_comment" title to the beginning of the join(";") array index 
    const appendTitleToFront = (multiValueArr, options) => {
        for (let i = 0; i < 3; i++) {
            if (multiValueArr[i] !== "" && multiValueArr[i] !== undefined)
                multiValueArr[i] = options[i] + " => " + multiValueArr[i]
        }
    }


    ////////// Shows (Map Preview / Size Selection Preview / Multi-Value Selections )
    const previewPopUp = () => {

        ////////////////
        // POP-UP LOCAL VARIABLES
        let options = ["field_name", "description", "sample_comment"]
        let multiValueArr = [[], [], []]
        let mapPreviewArr = []
        let sizeSelection = ["", ""]
        mapPreviewArr.push("-----MAP PREVIEW-----")
        sizeSelection[0] = "-----SIZE SELECTION PREVIEW-----"

        /////////////////////////////////////////////////////////
        /////////// Display Preview of Multi-Value Selections
        for (let i = 0; i < props.ent.length; i++) {
            if (props.ent[i].sesarTitle !== "") {
                mapPreviewArr.push(String(props.ent[i].sesarTitle + ": " + props.ent[i].header))
            }
            multiValueArrHelper(options, i, multiValueArr)
        }
        for (let i = 0; i < 3; i++) {
            multiValueArr[i] = multiValueArr[i].join(";")
        }

        appendTitleToFront(multiValueArr, options)

        multiValueArr.unshift("-----MultiValue Selections-----")
        alert((multiValueArr.join("\n")))

        /////////////////////////////////
        ////////// Display Map Preview
        if (mapPreviewArr.length === 1) {
            alert("No values have been selected for mapping...")
        }
        else {
            alert(mapPreviewArr.join("\n"))
        }

        //////////////////////////////////////
        // Display Size Selection Preview
        if (props.sizeArray[2].pairHeader !== "")
            sizeSelection[1] = "[" + props.sizeArray[2].pairHeader + "]"
        else if (props.sizeArray[2].pairHeader === "" && (props.sizeArray[0].pairHeader === "" || props.sizeArray[1].pairHeader === "")) {
            alert("No size selection has been made...")
            return
        }
        else
            sizeSelection[1] = "[" + props.sizeArray[0].pairHeader + ", " + props.sizeArray[1].pairHeader + "]"
        alert(sizeSelection.join("\n"))
    }


    return (

        /////////////////////////
        // TOOLBAR /////////////
        ///////////////////////
        // Field Cards ///////
        /////////////////////

        <div>
            <div className="label">
                <div className="label">
                    <div className="dropDown1">
                        <p>Formatting required***</p>
                        <DateDropdown className="requireOption" list={dateFormatOption} />
                        <CenturyDropDown className="requireOption" />
                        <DateDropdown className="requireOption" list={dateFormatOption} />
                    </div>

                    <div style={{ float: "right", paddingTop: "1%", paddingLeft: "1.2em", paddingRight: "2em" }} align="center" className="marsIcon">
                        <img className="mars" src={mars} alt="marsIcon" onClick={checkStore}></img>
                        <h4 style={{ padding: "0%", margin: "0%" }}>Click to Map</h4>
                    </div>

                    <div style={{ paddingTop: "3em" }} className="dropDown2" >
                        <button className="ui toggle button" onClick={() => setHide(!hide)}> Hide Unused </button>
                        <button className="ui basic button" onClick={previewPopUp}> Preview Map </button>
                        <button className="ui basic button" onClick={checkStore}> Help </button>
                    </div>


                </div>


                <div className="uiInfo labelInfo">
                    <div>
                        <object className="fieldWidget">
                            <div className="checkBoxInfo">
                                Use
                            </div>
                            <div dir="rtl" className="fieldTitle">:Header</div>
                            <div className="fieldVal" > Content</div>
                        </object>
                        <object className="arrowInfo">
                            Maps To
                        </object>

                        <object className="dropDownWidget" align="right">
                            <div className="mappedValue">Mapped Content</div>
                            <div className="dropDownInfo"><b>[</b>Mapped Header<b>]</b></div>
                            {(true) ?
                                <object className="mappedValue" style={{ paddingRight: "70px" }}>
                                    Type </object> : <div className="padRight"> Type </div>}
                        </object>

                    </div>
                </div>

                <div className="ui-card" >{fields}</div>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => {
    return {
        ent: state.entries,
        sizeArray: state.sizeArray
    };
};

export default connect(mapStateToProps, { firstState })(CardList);