import React from "./react";
import ReactDom from "./react-dom";
// let element = React.createElement(
//   "div",
//   {
//     className: "title",
//     style: {
//       color: "red",
//     },
//   },
//   React.createElement("span", null, "hello"),
//   "world"
// );
// function Bar(props) {
//   // return React.createElement("h1", null, "name:", props.name);
//   return (
//     <h1>
//       <span>name:</span>
//       {props.name}
//     </h1>
//   );
// }
class Bar extends React.Component {
  render() {
    return (
      <div style={{ color: "red" }} className="bg">
        <span>name:</span>
        {this.props.name}
      </div>
    );
  }
}
let element = <Bar name="张三" />;
console.log(element);
ReactDom.render(element, document.getElementById("root"));
