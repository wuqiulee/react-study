import React from "react";
import ReactDom from "react-dom";
class Bar extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return <div></div>;
  }
}
ReactDom.render(<Bar />, document.getElementById("root"));
