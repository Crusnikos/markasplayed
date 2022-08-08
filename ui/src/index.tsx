import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import ArticlesListProvider from "./ArticleListProvider";
import { FirebaseAuthProvider } from "./firebase";
import { firebaseConfig } from "./api";
import "./i18n";

ReactDOM.render(
  <FirebaseAuthProvider config={firebaseConfig}>
    <ArticlesListProvider>
      <App />
    </ArticlesListProvider>
  </FirebaseAuthProvider>,
  document.getElementById("root")
);
