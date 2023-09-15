import React from "react";
import ReactDom from "react-dom";
class Bar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0,
    };
  }
  render() {
    return <div></div>;
  }
}
let element = <Bar />;
ReactDom.render(element, document.getElementById("root"));
