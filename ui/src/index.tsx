import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import ArticlesListProvider from "./context/ArticleListProvider";
import { FirebaseAuthProvider } from "./context/FirebaseProvider";
import { firebaseConfig } from "./data/api";
import "./utils/i18n";

ReactDOM.render(
  <FirebaseAuthProvider config={firebaseConfig}>
    <ArticlesListProvider>
      <App />
    </ArticlesListProvider>
  </FirebaseAuthProvider>,
  document.getElementById("root")
);
