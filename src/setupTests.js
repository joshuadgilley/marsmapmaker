import Enzyme from "enzyme";
import EnzymeAdapter from "enzyme-adapter-react-16";

//Enzyme configuration file
Enzyme.configure({
  adapter: new EnzymeAdapter(),
  disableLifecycleMethods: true
});
