import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material";
import { BrowserRouter } from "react-router-dom";
import createCache from "@emotion/cache";
import React, { useState } from "react";
import { CacheProvider } from "@emotion/react";
import MainPanel from "./MainPanel";
import Login from "./user/Login";
import { Dialogs } from "./components/Dialogs";
import ArticleForm from "./article/ArticleForm";
import AuthorsListing from "./author";

export const muiCache = createCache({
  key: "mui",
  prepend: true,
});

const theme = createTheme({
  palette: {
    primary: {
      main: "#2e7d32",
      light: "#7ab06d",
    },
    secondary: {
      main: "#efebe9",
    },
    warning: {
      main: "#ff6200",
      light: "#ffffa7",
    },
  },
  typography: {
    fontFamily: ["Oswald"].join(","),
    fontSize: 18,
  },
});

export default function App(): JSX.Element {
  const [openDialog, setOpenDialog] = useState<Dialogs>({
    type: undefined,
    data: undefined,
    images: undefined,
  });

  function dialog() {
    switch (openDialog.type) {
      case "AddArticle":
        return <ArticleForm openDialog={setOpenDialog} />;
      case "EditArticle":
        return (
          <ArticleForm
            openDialog={setOpenDialog}
            data={openDialog.data}
            images={openDialog.images}
            returnFunction={openDialog.returnFunction}
          />
        );
      case "Authors":
        return <AuthorsListing openDialog={setOpenDialog} />;
      case "LoginUser":
        return <Login openDialog={setOpenDialog} />;
    }
  }

  return (
    <React.Fragment>
      <CssBaseline />
      <BrowserRouter>
        <CacheProvider value={muiCache}>
          <ThemeProvider theme={theme}>
            {dialog()}
            <MainPanel openDialog={setOpenDialog} />
          </ThemeProvider>
        </CacheProvider>
      </BrowserRouter>
    </React.Fragment>
  );
}
