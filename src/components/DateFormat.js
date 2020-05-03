import React from 'react';
import ReactModal from 'react-modal';
import { connect } from 'react-redux';
import { render } from '@testing-library/react';

class DateFormat extends React.Component {

    
    render() 
    {   return (
        this.props.appear ? 
            <ReactModal isOpen= {this.props.appear}>
                <button onClick={this.props.onClose}> Close window</button>
            </ReactModal> : null
        )
    }
}

export default DateFormat;