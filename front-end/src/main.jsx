import React from "react";
import ReactDOM from "react-dom/client";
import App from "src/app";
import { Provider } from "react-redux";
import { store } from "src/store";
import "src/styles/css/index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <App />
  </Provider>
);
