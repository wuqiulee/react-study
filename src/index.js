import React from "./react";
import ReactDom from "./react-dom";
let element = React.createElement(
  "div",
  {
    className: "title",
    style: {
      color: "red",
    },
  },
  React.createElement("span", null, "hello"),
  "world"
);
console.log(JSON.stringify(element, null, 2), element);
ReactDom.render(element, document.getElementById("root"));
