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
  constructor(props) {
    super(props);
    this.A = React.createRef();
    this.B = React.createRef();
    this.C = React.createRef();
  }
  handleClick = () => {
    this.C.current.value =
      Number(this.A.current.value) + Number(this.B.current.value);
    // console.log(this.state.count);
  };
  render() {
    return (
      <div>
        <input ref={this.A} />
        <input ref={this.B} />
        <button onClick={this.handleClick}>+</button>
        <input ref={this.C} />
      </div>
      // <div>
      //   <div>{this.state.count}</div>
      //   <button onClick={this.handleClick}>+1</button>
      // </div>
    );
  }
}
let element = <Bar />;
console.log(element, "element");
ReactDom.render(element, document.getElementById("root"));
