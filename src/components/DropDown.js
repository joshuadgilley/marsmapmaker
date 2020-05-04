import React from "react";
import "semantic-ui-react";
import { connect } from "react-redux";

class DropDown extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = e => {
            //use componentDidUpdate instead maybe
            this.setState({selectedValue : e.target.value}, () => console.log(this.state.headerTitle + " " + "!" + this.state.selectedValue + "!"));
            console.log(e.target.value);
        }
        this.state = {
            list: this.props.list,
            currentChosen: null,
            headerTitle: this.props.title,
            value: "select",
            selectedValue: "",
        };
        
    }
    //e is the event being passed in from select
    


    render() {
        let filter = (f) => {
            if (f.type === this.props.fieldType)
                //value = f.title needed to track the option being selected
                return <option value={f.title}>{f.title}</option>;
        };
        return (
            //added onChange
            <select class="ui search dropdown" onChange={this.handleChange}>
                {this.props.list.map((field) => filter(field))}
            </select>
            // <div class="ui compact menu">
            //     <div class="ui simple dropdown item">
            //         Dropdown
            //         <i class="dropdown icon"></i>
            //         <div class="menu">
            //             {this.props.list.map((field) => (
            //                 <div class="item">{field.title}</div>
            //             ))}
            //         </div>
            //     </div>
            // </div>
        );
    }
}
export default connect(null)(DropDown);