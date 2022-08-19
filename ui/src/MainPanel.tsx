import { makeStyles } from "tss-react/mui";
import React, { useEffect, useMemo } from "react";
import { Grid, Typography } from "@mui/material";
import { Route, Routes, useLocation } from "react-router-dom";
import { tryParseInt } from "./parsing";
import { useArticleData } from "./ArticleListProvider";
import ArticleDashboard from "./article/ArticleDashboard";
import ArticleDetails from "./article/ArticleDetails";
import i18next from "i18next";
import { DispatchSnackbar } from "./components/SnackbarDialog";

const useStyles = makeStyles()((theme) => ({
  main: {
    marginBottom: theme.spacing(1),
  },
}));

export default function MainPanel(props: {
  displaySnackbar: DispatchSnackbar;
}) {
  const { classes } = useStyles();
  const [, getNextPage] = useArticleData();
  const location = useLocation();
  const qs = new URLSearchParams(location.search);
  const pathname = useMemo(() => location.pathname, [location]);

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

  return (
    <main className={classes.main}>
      <section>
        <Grid
          container
          justifyContent="center"
          alignItems="center"
          direction="column"
        >
          <Routes>
            <Route path="/" element={<ArticleDashboard />} />
            <Route
              path="article/:id"
              element={
                <ArticleDetails displaySnackbar={props.displaySnackbar} />
              }
            />
            <Route
              path="*"
              element={
                <React.Fragment>
                  <Typography>
                    {i18next.t("routing.error.missingPage")}
                  </Typography>
                  <ArticleDashboard />
                </React.Fragment>
              }
            />
          </Routes>
        </Grid>
      </section>
    </main>
  );
}
