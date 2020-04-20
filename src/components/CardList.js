import React, { useState } from 'react';
import FieldCard from './FieldCard';
import { connect } from 'react-redux';
import './App.css';
import './Toolbar';
import Toolbar from './Toolbar';

const CardList = (props) => {

    const [hide, setHide] = useState(false)

    let typeField = (f) => {
        let numbers = /^[0-9,/.]*$/;
        let final;

        if (numbers.test(f) === true)
            final = "numbers";
        else
            final = "text"
        return final
    }

    const fields = props.fields.map((field) => {

        return (
            
            <FieldCard hiding={hide} fieldTitle={field} fieldType={typeField(props.fieldVal[field])} fieldValue={props.fieldVal[field]} hasContent={props.fieldVal[field] !== ""} />
        );
    });

    return (

        <div>
            <div class="three ui buttons">
                <button class="ui toggle button" onClick={() => setHide(!hide)}>Toggle</button>
                <button class="ui basic button">Format Date</button>
                <button class="ui basic button">Help</button> 
            </div>
            <div className="ui-card">{fields}</div>
        </div>


    );
}

const mapStateToProps = (state) => {
}


export default connect(mapStateToProps)(CardList);