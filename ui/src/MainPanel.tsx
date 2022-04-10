import { makeStyles } from "tss-react/mui";
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Grid } from "@mui/material";
import Footer from "./Footer";
import { Dialogs } from "./components/Dialogs";
import Menu from "./menu";
import { Route, Routes, useLocation } from "react-router-dom";
import { tryParseInt } from "./parsing";
import { useArticleData } from "./ArticleListProvider";
import ArticleDashboard from "./article/ArticleDashboard";
import ArticleDetails from "./article/ArticleDetails";
import SnackbarDialog from "./components/SnackbarDialog";
import { useAuth } from "./UserProvider";

const useStyles = makeStyles()((theme) => ({
  content: {
    margin: "auto",
    overflow: "auto",
    overflowX: "hidden",
  },
  container: {
    marginTop: theme.spacing(2),
  },
}));

export default function MainPanel(props: {
  openDialog: Dispatch<SetStateAction<Dialogs>>;
}) {
  const { classes } = useStyles();
  const [, getNextPage] = useArticleData();
  const { user } = useAuth();
  const location = useLocation();
  const qs = new URLSearchParams(location.search);
  const pathname = useMemo(() => location.pathname, [location]);
  const [userNotification, setUserNotification] = useState<string>();

  useEffect(() => {
    async function fetchRequestedPage() {
      const page = tryParseInt(qs.get("page"));
      if (page !== null && page !== 1 && pathname === "/") {
        await getNextPage({ page: page });
      } else {
        await getNextPage({ page: 1 });
      }
    }

    void fetchRequestedPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isFirstRun = useRef(true);
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    setUserNotification(user ? "Jesteś zalogowany" : "Jesteś wylogowany");
  }, [user]);

  return (
    <main className={classes.content}>
      <section className={classes.container}>
        <Grid
          container
          justifyContent="center"
          alignItems="center"
          direction="column"
        >
          <Menu openDialog={props.openDialog} />
          <Routes>
            <Route path="/" element={<ArticleDashboard />} />
            <Route
              path="article/:id"
              element={<ArticleDetails openDialog={props.openDialog} />}
            />
            <Route
              path="*"
              element={
                <React.Fragment>
                  <SnackbarDialog message="Nie udało się wyświetlić żadanej strony i zostałeś przeniesionny do głównego panelu" />
                  <ArticleDashboard />
                </React.Fragment>
              }
            />
          </Routes>
          <Footer />
          {userNotification && <SnackbarDialog message={userNotification} />}
        </Grid>
      </section>
    </main>
  );
}
