import update from "react-addons-update";
import { entries } from "d3";
//the store will consist of an array of objects with each having the following information attached
//string: sesarTitle
//string: value
//string: localTitle
//boolean: isDate (default false)
//boolean: isMeasurement (default false)
// **POSSIBLE** (currently thinking if necessary) boolean: isChecked

// general process
//  an instantiation of the object with the localTitle as the key
//  a reselection or remapping of a sesar value to a local title to a different value
//  a reselection or remapping of a sesar value to the same value (might already be handled)

const reducer = (
  state = {
    totalMultiCount: [
      {
        title: "size",
        count: 0
      },
      {
        title: "description",
        count: 0
      },
      {
        title: "sample_comment",
        count: 0
      },
      {
        title: "geological_age",
        count: 0
      },
      {
        title: "field_name",
        count: 0
      }
    ],
    persistingMetaData: [],
    toggleIndex: -1,
    toggleInUse: false,
    toggleArr: [],
    isOpen: false,
    hasInit: false,
    jsFile: undefined,
    entries: [],
    useOnce: [],
    centuryChosen: false,
    century: "",
    sesarOne2One: [],
    numOfOneToOne: 0,
    chosenDateFormat: null,
    hasChosenDateFormat: false,
    hasChosenDropdownOption: false,
    hasTwoYs: false,
    substringDateFormat: "start",
    fileMetadata: []
  },
  action
) => {
  switch (action.type) {
    case "STORE_FILE_METADATA":
      return {
        ...state,
        fileMetadata: state.fileMetadata.concat(action.payload.files)
      };

    case "CHANGE_FORCED_CARD_VALUE_TO_OLD":
      return update(state, {
        entries: {
          [action.payload.index]: {
            value: { $set: "hello" }
          }
        }
      });

    case "PERSISTING_METADATA_CONCAT":
      return {
        ...state,
        persistingMetaData: state.persistingMetaData.concat(action.payload)
      };

    //might not be necessary
    case "PERSISTING_METADATA_UPDATE":
      return update(state, {
        persistingMetaData: {
          [action.payload.index]: {
            value: { $set: action.payload.value }
          }
        }
      });

    case "TOTAL_MULTI_COUNT":
      return update(state, {
        totalMultiCount: {
          [action.payload.findex]: {
            title: { $set: action.payload.ftitle },
            count: { $set: action.payload.num }
          }
        }
      });

    // MAPPED_VALUE should happen one time, it initializes the redux store array
    case "MAPPED_VALUE":
      return {
        ...state,
        entries: state.entries.concat(action.payload.objArr),
        useOnce: state.useOnce.concat(action.payload.useOnce)

        //sizeOuterArray: state.sizeOuterArray.concat(action.payload.sizeOuter),
        //singleMeasureArr: state.singleMeasureArr.concat(action.payload.singleMeasureArr)
      };

    case "CHANGE_INIT":
      return {
        ...state,
        hasInit: true
      };

    case "FORCE_EDIT":
      return update(state, {
        entries: {
          [action.payload.index]: {
            value: { $set: action.payload.value },
            header: { $set: action.payload.header }
          }
        }
      });

    // DROPDOWN_UPDATE updates a specific object in the store "entries[id[" when option is clicked
    case "DROPDOWN_UPDATE":
      let dateSelected = false;
      let index = action.payload.id;
      // let check = action.payload.dropOption;
      let check = false;

      for (let i = 0; i < state.entries.length; i++) {
        if (
          state.entries[i].sesarSelected === "collection_end_date" ||
          state.entries[i].sesarSelected === "collection_start_date"
        ) {
          dateSelected = true;
        }
      }
      if (
        dateSelected === true ||
        (action.payload.sesarSelected === "collection_end_date" ||
          action.payload.sesarSelected === "collection_start_date")
      )
        check = true;

      return {
        ...state,
        hasChosenDropdownOption: check,

        // replaces entries: with every object from original state, replaces specified entries[id] with new object
        entries: [
          ...state.entries.slice(0, index),
          {
            id: action.payload.id,
            sesarTitle: action.payload.sesarSelected,
            oldValue: action.payload.oldValue,
            value: action.payload.value,
            header: action.payload.header,
            // taking a look at isDate and isMeasurment later along with other intricacies of the store/dropdown dynamic
            isDate: false,
            isMeasurement: false,
            isGreen: true
          },
          ...state.entries.slice(index + 1)
        ],

        useOnce: [
          ...state.useOnce.slice(0, index),
          action.payload.sesarSelected,
          ...state.useOnce.slice(index + 1)
        ]
      };

    case "SHOW_METADATA_CARD":
      return update(state, {
        entries: {
          [action.payload.id]: {
            isGreen: { $set: true }
          }
        }
      });

    case "CHOOSE_FORMAT":
      return {
        ...state,
        hasChosenDateFormat: true,
        chosenDateFormat: action.payload.dateFormat,
        hasTwoYs: action.payload.hasTwoYs
      };

    case "ADD_ONE_2_ONE":
      return {
        ...state,
        sesarOne2One: state.sesarOne2One.concat(action.payload.title),
        numOfOneToOne: action.payload.size
      };

    case "CENTURY":
      return {
        ...state,
        hasTwoYs: true,
        centuryChosen: true,
        century: action.payload.chosenCentury
      };

    case "MULTIVALUE_ADD":
      return {
        ...state,
        multiValues: [
          {
            id: "sample_comment",
            concatValues: []
          },
          {
            id: "description",
            concatValues: []
          },
          {
            id: "field_name",
            concatValues: []
          }
        ]
      };

    case "MULTIVALUE_ADD_FINISH":
      let indy = action.payload.index;

      return {
        ...state,
        multiValues: [
          ...state.multiValues.slice(0, indy),
          {
            id: action.payload.ident,
            concatValues: [
              ...state.multiValues[indy].concatValues.concat(
                action.payload.keyString
              )
            ]
          },
          ...state.multiValues.slice(indy + 1)
        ]
      };

    case "REMOVE_SELECTION":
      let i = action.payload.id;

      return {
        ...state,
        entries: [
          ...state.entries.slice(0, i),
          {
            id: action.payload.id,
            sesarTitle: "",
            oldValue: action.payload.oldValue,
            value: action.payload.value,
            header: action.payload.header,
            // taking a look at isDate and isMeasurment later along with other intricacies of the store/dropdown dynamic
            isDate: false,
            isMeasurement: false,
            isGreen: action.payload.isGreen
          },
          ...state.entries.slice(i + 1)
        ]
      };

    // case "ADD_TO_SIZE_ARRAY":
    //   return update(state,
    //     {
    //       sizeOuterArray: {
    //         [action.payload.cardID]: {
    //           [action.payload.index]: {
    //             pairHeader: { $set: action.payload.header },
    //             pairValue: { $set: action.payload.value },
    //             currentID: { $set: action.payload.cardID }
    //           },
    //           [action.payload.index + 1]: {
    //             pairHeader: { $set: action.payload.nextHeader },
    //             pairValue: { $set: action.payload.nextValue },
    //             currentID: { $set: action.payload.nextID }
    //           }

    //         }
    //       }
    //     });

    // add changing second entries to have payload.index + 1 contents

    // case "REMOVE_ITEM_SIZE_ARRAY":
    //   return update(state,
    //     {
    //       sizeOuterArray: {
    //         [action.payload.cardID]: {
    //           [action.payload.index]: {
    //             pairHeader: { $set: "" },
    //             pairValue: { $set: "" },
    //             currentID: { $set: -1 }
    //           },
    //           [action.payload.index + 1]: {
    //             pairHeader: { $set: "" },
    //             pairValue: { $set: "" },
    //             currentID: { $set: -1 }
    //           }

    //         }
    //       }
    //     });

    // case "CLEAR_SINGLE_MEASURE":
    //   return update(state,
    //     {
    //       singleMeasureArr: {
    //         [action.payload.id]: {
    //           pairHeader: { $set: "" },
    //           pairValue: { $set: "" },
    //           currentID: { $set: -1 }
    //         }
    //       }
    //     });

    // case "ADD_SINGLE_MEASURE":
    //   return update(state,
    //     {
    //       singleMeasureArr: {
    //         [action.payload.cardID]: {
    //           pairHeader: { $set: action.payload.header },
    //           pairValue: { $set: action.payload.value },
    //           currentID: { $set: action.payload.cardID }
    //         }
    //       }
    //     }
    //   )

    // case "SET_SECOND":
    //   return update(state,
    //     {
    //       entries: {
    //         [action.payload.cardID]: {
    //           id: { $set: action.payload.id },
    //           sesarTitle: { $set: "size" },
    //           oldValue: { $set: action.payload.oldValue },
    //           value: { $set: action.payload.value },
    //           header: { $set: action.payload.header },
    //           // taking a look at isDate and isMeasurment later along with other intricacies of the store/dropdown dynamic
    //           isDate: { $set: false },
    //           isMeasurement: { $set: false },
    //           isGreen: { $set: action.payload.isGreen }
    //         }
    //       }
    //     }
    //   )

    case "SET_SUB":
      return update(state, {
        substringDateFormat: { $set: action.payload.substringDateFormat }
      });

    case "IS_OPEN":
      return update(state, {
        isOpen: { $set: action.payload.bool }
      });

    case "INIT_TOGGLE":
      return update(state, {
        toggleArr: { $set: action.payload.arr }
      });

    case "ADD_TO_TOGGLE_INDEX":
      return update(state, {
        toggleIndex: { $set: action.payload.index }
      });

    case "TOGGLE_IN_USE":
      return update(state, {
        toggleInUse: { $set: action.payload.bool }
      });

    default:
      return state;
  }
};

export default reducer;
