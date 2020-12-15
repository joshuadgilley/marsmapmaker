////////////////////////////////////////////////////////////////////////////////////////
// DIALOG.JS //////////////////////////////////////////////////////////////////////////
// This component displays a preview of your map as you are creating it //////////////
// When "preview map" in the toolbar is clicked, a small window opens with content //
////////////////////////////////////////////////////////////////////////////////////

import React, { Component } from "react";

/////////////////////////////////////////////////
////////////////////////////////////////////////

// CSS & Styling
let dialogStyles = {
  width: "800px",
  maxWidth: "100%",
  margin: "0 auto",
  position: "fixed",
  left: "50%",
  top: "50%",
  transform: "translate(-50%,-50%)",
  zIndex: "999",
  backgroundColor: "#eee",
  padding: "10px 20px 40px",
  borderRadius: "8px",
  display: "flex",
  flexDirection: "column"
};

let dialogCloseButtonStyles = {
  marginBottom: "15px",
  padding: "3px 8px",
  cursor: "pointer",
  borderRadius: "50%",
  border: "none",
  width: "30px",
  height: "30px",
  fontWeight: "bold",
  alignSelf: "flex-end"
};

class Dialog extends Component {
  render() {
    console.log(this.props.children);
    let dialog = (
      <div style={dialogStyles} class="dialogWindow">
        <button style={dialogCloseButtonStyles} onClick={this.props.onClose}>
          x
        </button>
        <div>{this.props.children}</div>
      </div>
    );

    if (!this.props.isOpen) {
      dialog = null;
    }
    if (this.props.isOpen) {
      return dialog;
    }
  }
}

export default Dialog;
