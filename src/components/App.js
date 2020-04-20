import React from 'react';
//import data from '../TEST_DATA.csv';
import CardList from './CardList';
import FileIn from './FileIn';

const parser = (fieldName, length) => {
    let arr = [];
    // 53 is hardcoded, we want size of columns
    for (let i = 0; i < length; i++) {
        arr[i] = fieldName[i];
    }
    return (arr);
}

class App extends React.Component {
    constructor(props) {
        super(props);
        // THIS IS THE ONLY TIME WE DO DIRECT ASSIGNMENT TO STATE
        this.state = { fieldNames: [], size: 0, fieldValues: [], data: [], moveOn: false }; // state object, contains properties relevant to component
    }

    fileCallback = (datafromFile) => {
        let currentComponent = this;
        currentComponent.setState({
            fieldNames:
                parser(datafromFile.meta.fields, datafromFile.meta.fields.length),
            fieldValues:
                datafromFile.data[0],
            moveOn: true
        })
    }

    handleFiles = files => {
        var reader = new FileReader();
        reader.onload = function (e) {
            // Use reader.result
            alert(reader.result)
        }
        reader.readAsText(files[0]);
    }



    // React says we have to define render!! You have to display JSX!
    render() {
        //conditio
        return (
            <div>
                <FileIn callbackFromParent={this.fileCallback} />{this.state.moveOn ?
                <CardList fields={this.state.fieldNames} fieldVal={this.state.fieldValues} /> : null}
            </div>
        )

    };
}

export default App;