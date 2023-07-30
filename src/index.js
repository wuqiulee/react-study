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
function Input(porps, ref) {
  return <input ref={ref} />;
}
const ForwordRef = React.forwardRef(Input);
class Bar extends React.Component {
  constructor(props) {
    super(props);
    this.inputRef = React.createRef();
  }
  handleClick = () => {
    console.log(this.inputRef.current);
    this.inputRef.current.focus();
  };
  render() {
    return (
      <div>
        <ForwordRef ref={this.inputRef} />
        <button onClick={this.handleClick}>+</button>
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
