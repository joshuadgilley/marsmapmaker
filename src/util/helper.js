export const typeField = (keyNum, totalMetaDataAdd) => {
  let type;

  if (keyNum > totalMetaDataAdd) type = "both";
  else {
    type = "added_card";
  }
  return type;
};

export const isSesarTitlePresent = (title, ent) => {
  let isPresent = false;
  for (let i = 0; i < ent.length; i++) {
    if (ent[i].sesarTitle === title) {
      isPresent = true;
      break;
    }
  }
  return isPresent;
};

//finds the last index in entries that contains an object with a key pair value of header:<METADATA_ADD>
//Used in CardList
export const lastMetaDataAdd = entries => {
  let lastPosition;
  try {
    for (let i = 0; i < entries.length; i++) {
      if (!entries.header.includes("<METADATA_ADD")) {
        lastPosition = i - 1;
        break;
      }
    }
    return lastPosition;
  } catch (error) {
    console.log(
      "In util/helper called from CardList this value must be greater than ---->: " +
        lastPosition
    );
    console.error();
  }
};

//gets defalut value for select and options in Dropdown from store
export const dropdownSet = (hasStoreLoaded, entryStore, idInStore) => {
  let defaultVal = "Sesar Selection";

  if (hasStoreLoaded && entryStore[idInStore].sesarTitle !== "") {
    defaultVal = entryStore[idInStore].sesarTitle;
  }
  return defaultVal;
};
