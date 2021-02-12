///////////////////////////////////////////////////////////////////////////////////////
// CHECKBOX.JS ///////////////////////////////////////////////////////////////////////
// This component displays  a checkbox on the left of each fieldCard ////////////////
// Giving the user to decide if they want to use that fieldCard in the map or not //
///////////////////////////////////////////////////////////////////////////////////

import React, { Component } from "react";

// CSS & Styling
import { Checkbox } from "semantic-ui-react";
import "./App.scss";

/////////////////////////////////////////////////
////////////////////////////////////////////////

export default class CheckboxExample extends Component {
  state = { checked: this.props.isChecked };

  // function that goes back to the fieldCard and changes the color of the fieldCard (previously the cards were green, hints the name)
  toggle = () => {
    this.props.greenCallback();
    this.setState({ checked: !this.props.isChecked });
  };

  render() {
    return (
      <div className="inner--checkbox">
        <Checkbox onChange={this.toggle} checked={this.state.checked} />
      </div>
    );
  }
}
