import React from "react";
import ReactDOM from "react-dom";
import Routes from "./routes";
import "./index.css";
import { BrowserRouter as Router } from "react-router-dom";

require("dotenv").config();

console.log({ env: process.env });

ReactDOM.render(
  <Router>
    <Routes />
  </Router>,
  document.getElementById("root")
);
