import React from "react";
import ReactDom from "react-dom";
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
  handleClick = () => {
    // this.setState({ count: this.state.count + 1 });
  };
  render() {
    return (
      <div>
        <button onClick={this.handleClick}>+</button>
      </div>
    );
  }
}
let element = <Bar />;
ReactDom.render(element, document.getElementById("root"));
