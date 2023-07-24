import React from "react";
import ReactDom from "react-dom";
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
    this.state = { date: new Date() };
  }
  componentDidMount() {
    this.timer = setInterval(() => {
      this.tick();
    }, 500);
  }
  componentWillUnmount() {
    clearInterval(this.timer);
  }
  tick = () => {
    this.setState({ date: new Date() });
  };
  render() {
    return (
      <div style={{ color: "red" }} className="bg">
        <span>date:</span>
        {this.state.date.toLocaleTimeString()}
      </div>
    );
  }
}
let element = <Bar name="张三" />;
console.log(element);
ReactDom.render(element, document.getElementById("root"));
