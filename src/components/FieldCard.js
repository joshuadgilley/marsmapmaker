import React from 'react';
import './App.css';
import classNames from 'classnames';
import { connect } from 'react-redux';
import CheckboxExample from './CheckBox'
import { selectedField } from '../actions'

class FieldCard extends React.Component {

    state = { isGreen: this.props.hasContent }


    changeColor = (e) => {
        e.preventDefault();
        console.log(this.state.isGreen)
        this.setState({ isGreen: !this.state.isGreen })
        this.render()
    }

    render() {


        let value = this.props.fieldValue;

        if (value.length > 15) {
            value = value.slice(0, 20);
            value = value + "..."
        }

        let btnClass;

        btnClass = classNames({
            'field_container1': this.state.isGreen,
            'field_container2': !this.state.isGreen


        });

        console.log(btnClass);

        return (

            <div className={btnClass}>
                <div className="fieldTitle">{this.props.fieldTitle}</div>
                <div className="fieldVal" >{value}</div>
                <div className="checkBox" onClick={this.changeColor.bind(this)}> <CheckboxExample isChecked={this.state.isGreen} /> </div>
            </div>)
    };
}

export default connect(null)(FieldCard);