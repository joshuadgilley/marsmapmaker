import React, { useState } from 'react';
import FieldCard from './FieldCard';
import { connect } from 'react-redux';
import './App.css';
import './Toolbar';
import DateFormat from './DateFormat';
import ReactModal from 'react-modal';

const CardList = (props) => {

    //handles the hiding of unchecked fieldcards
    const [hide, setHide] = useState(false)

    //handles the date formatting modal window appearing
    const [showModal, setShowModal] = useState(false)

    //handles identification for possible dropdown options
    //filters based on if field value is a number or text
    let typeField = (f) => {
        let numbers = /^[0-9,/.]*$/;
        let final;

        if (numbers.test(f) === true)
            final = "numbers";
        else
            final = "text"
        return final
    }

    //maps through the given fields and creates a unique field card entry for each
    // hiding: boolean based on if checkbox is clicked by user
    // fieldTitle: column values of the file, the attributes that will be associated with the SESAR values
    // fieldType: defined in comment above
    // fieldValue: the associated content with given attributes, the "contents" of the file
    // hasContent: the initial filtering of checked values
    const fields = props.fields.map((field) => {

        return (
            
            <FieldCard hiding={hide} fieldTitle={field} fieldType={typeField(props.fieldVal[field])} fieldValue={props.fieldVal[field]} hasContent={props.fieldVal[field] !== ""} />
        );
    });

    //passing the ability to close the window
    const closeModal = () => {
        setShowModal(false);
    };

    return (

        <div>
            <DateFormat onClose={closeModal} appear={showModal}/>
            
            <div class="three ui buttons">
                <button class="ui toggle button" onClick={() => setHide(!hide)}>Toggle</button>
                <button class="ui basic button" onClick={() => setShowModal(true)}>Format Date</button>
                <button class="ui basic button">Help</button> 
            </div>
            <div className="ui-card">{fields}</div>
        </div>


    );
}

const mapStateToProps = (state) => {
}


export default connect(mapStateToProps)(CardList);