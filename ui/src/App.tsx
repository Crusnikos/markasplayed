import CssBaseline from "@mui/material/CssBaseline";
import { AlertColor, createTheme, ThemeProvider } from "@mui/material";
import { BrowserRouter } from "react-router-dom";
import createCache from "@emotion/cache";
import React, { useEffect, useRef, useState } from "react";
import { CacheProvider } from "@emotion/react";
import MainPanel from "./MainPanel";
import Login from "./user/Login";
import { Dialog } from "./Dialog";
import ArticleForm from "./article/ArticleForm";
import AuthorsListing from "./author";
import SnackbarDialog from "./components/SnackbarDialog";
import { useFirebaseAuth } from "./firebase";
import i18next from "i18next";
import { useTranslation } from "react-i18next";
import LoadingIndicator from "./components/LoadingIndicator";

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
  const [openDialog, setOpenDialog] = useState<Dialog>({
    type: undefined,
    data: undefined,
    images: undefined,
  });
  const { user } = useFirebaseAuth();
  const [userNotification, setUserNotification] = useState<{
    message: string | undefined;
    severity: AlertColor | undefined;
  }>({ message: undefined, severity: `info` });
  const { ready } = useTranslation();

  function dialog() {
    switch (openDialog.type) {
      case undefined:
        return;
      case "addArticle":
        return (
          <ArticleForm
            openDialog={setOpenDialog}
            responseOnSubmitForm={setUserNotification}
          />
        );
      case "editArticle":
        return (
          <ArticleForm
            openDialog={setOpenDialog}
            data={openDialog.data}
            images={openDialog.images}
            returnFunction={openDialog.returnFunction}
            responseOnSubmitForm={setUserNotification}
          />
        );
      case "authors":
        return <AuthorsListing openDialog={setOpenDialog} />;
      case "loginUser":
        return <Login openDialog={setOpenDialog} />;
    }
  }

  const isFirstRun = useRef(true);
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    setUserNotification({
      message: user
        ? i18next.t("user.notification.login")
        : i18next.t("user.notification.logout"),
      severity: `info`,
    });
  }, [user]);

  if (!ready) {
    return <LoadingIndicator />;
  }

  return (
    <React.Fragment>
      <CssBaseline />
      <BrowserRouter>
        <CacheProvider value={muiCache}>
          <ThemeProvider theme={theme}>
            {dialog()}
            <MainPanel openDialog={setOpenDialog} />
            {userNotification.message && (
              <SnackbarDialog
                message={userNotification.message}
                clearMessage={setUserNotification}
                severity={userNotification.severity}
              />
            )}
          </ThemeProvider>
        </CacheProvider>
      </BrowserRouter>
    </React.Fragment>
  );
}
