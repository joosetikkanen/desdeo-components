import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);

/*
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

*/

export { default as HorizontalBars } from "./components/HorizontalBars";
export { default as ParallelAxes } from "./components/ParallelAxes";
export { default as RadarChart } from "./components/RadarChart";
export { default as NavigationBars } from "./components/NavigationBars";
