import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import UserProvider from "./UserProvider";
import ArticlesListProvider from "./ArticleListProvider";

ReactDOM.render(
  <UserProvider>
    <ArticlesListProvider>
      <App />
    </ArticlesListProvider>
  </UserProvider>,
  document.getElementById("root")
);
