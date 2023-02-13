import React, { Fragment, useEffect, useRef, useState } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { AlertColor, createTheme, ThemeProvider } from "@mui/material";
import { BrowserRouter } from "react-router-dom";
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import MainPanel from "./MainPanel";
import SnackbarDialog from "./components/SnackbarDialog";
import { useFirebaseAuth } from "./firebase";
import i18next from "i18next";
import { useTranslation } from "react-i18next";
import LoadingIndicator from "./components/LoadingIndicator";
import Footer from "./footer";
import Menu from "./menu";
import FlexWrapper from "./components/FlexWrapper";

export const muiCache = createCache({
  key: "mui",
  prepend: true,
});

const theme = createTheme({
  palette: {
    primary: {
      main: "#519657",
      light: "#aece90",
    },
    warning: {
      main: "#fb8c00",
      light: "#ffb74d",
    },
    error: {
      main: "#dc2323",
      light: "#e34f4f",
    },
    info: {
      main: "#0275d8",
      light: "#8dc9fc",
    },
    background: {
      default: "#e0e0e0",
    },
  },
  typography: {
    fontFamily: ["Oswald"].join(","),
    fontSize: 17,
  },
});

export default function App(): JSX.Element {
  const { user } = useFirebaseAuth();
  const [userNotification, setUserNotification] = useState<{
    message: string | undefined;
    severity: AlertColor | undefined;
  }>({ message: undefined, severity: `info` });
  const { ready } = useTranslation();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  function notification() {
    return (
      <SnackbarDialog
        message={userNotification.message ?? ""}
        clearMessage={setUserNotification}
        severity={userNotification.severity}
      />
    );
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
    <Fragment>
      <BrowserRouter>
        <CacheProvider value={muiCache}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            {userNotification.message && notification()}
            <FlexWrapper>
              <Menu
                setSnackbar={setUserNotification}
                setLoading={setIsLoading}
              />
              <MainPanel
                setSnackbar={setUserNotification}
                setLoading={setIsLoading}
                loading={isLoading}
              />
            </FlexWrapper>
            <Footer />
          </ThemeProvider>
        </CacheProvider>
      </BrowserRouter>
    </Fragment>
  );
}
