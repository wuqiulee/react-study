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
function Bar(props) {
  // return React.createElement("h1", null, "name:", props.name);
  return <h1>name:{props.name}</h1>;
}
let element = React.createElement(Bar, { name: "张三" });
console.log(element);
ReactDom.render(element, document.getElementById("root"));
