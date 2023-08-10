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
  static defaultProps = {
    name: "张三",
  };
  constructor(props) {
    super(props);
    this.state = {
      count: 0,
    };
  }
  shouldComponentUpdate(nextProps, nextState) {
    console.log("shouldComponentUpdate");
    return nextState.count % 2 === 0;
  }
  componentWillUpdate() {
    console.log("componentWillUpdate");
  }
  componentDidUpdate() {
    console.log("componentDidUpdate");
  }
  handleClick = () => {
    this.setState({ count: this.state.count + 1 });
  };
  render() {
    return (
      <div>
        <span>{this.state.count}</span>
        <button onClick={this.handleClick}>+</button>
      </div>
    );
  }
}
let element = <Bar />;
ReactDom.render(element, document.getElementById("root"));
