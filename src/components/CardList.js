import React, { useState, useEffect } from 'react';
import FieldCard from './FieldCard';
import DateDropdown from './DateDropdown';
import { connect } from 'react-redux';
import './App.css';

import { firstState } from '../actions/';
// import ReactModal from 'react-modal';

// there is a particular relationship between checked value and available option in dropdown
// consider formatting specs for outside of 1 to 1 version, comment fields
// add another array in store for values that adds values that can only be used once, iterate array before updating store with new dropdown clicks

const CardList = (props) => {

    // global variables for the Object Array the Redux Store is built on along with the id accumulator 
    const objArray = []
    const useOnce = []
    let newKey = -1
    const dateFormatOption = [
        { title: "" },
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
        let numbers = /^[0-9,/.]*$/;

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

    let initObj = {
        objArr: objArray,
        useOnce: useOnce
    }

    // uses the action "firstState" with the argument "objArray" to create the Redux Store ***ONE TIME***


    useEffect(() => {
        props.firstState(initObj)
    }, []);

    //funciton to pass to modal windown
    //const closeModal = () => {
    //setShowModal(false);
    //};

    // shows contents of the store if you click the "help" button in the console (FOR NOW)
    const checkStore = () => {
        console.log(props.ent)
        console.log(props.dateFormat)
    }

    return (
        <div>
            <div className="label">
                <div className="dropDown">
                    <DateDropdown list={dateFormatOption} />
                </div>
                <div className="two ui buttons">
                    <button className="ui toggle button" onClick={() => setHide(!hide)}> Toggle </button>
                    <button className="ui basic button" onClick={checkStore}> Help </button>
                </div>
                <div className="ui-card" >{fields}</div>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => {
    return {
        ent: state.entries,
        dateFormat: state.chosenDateFormat
    };
};

export default connect(mapStateToProps, { firstState })(CardList);