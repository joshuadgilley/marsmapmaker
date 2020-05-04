import { combineReducers } from 'redux';



function fieldSelection(state = {}, action) {
    switch (action.type) {
        case "MAPPED_VALUE":
            return {
                ...state,
                title: action.payload.sesarTitle,
                value: action.payload.fieldValue
            }
        default: // need this for default case
            return state
        }
}

export default combineReducers({
    fieldNames: fieldSelection
})