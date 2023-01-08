import { makeStyles } from "tss-react/mui";
import React, { Dispatch, SetStateAction, useEffect, useMemo } from "react";
import { Grid, Typography, useMediaQuery, useTheme } from "@mui/material";
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
  articleItemAdditionalMargin: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
}));

export default function MainPanel(props: {
  setSnackbar: DispatchSnackbar;
  setLoading: Dispatch<SetStateAction<boolean>>;
  loading: boolean;
}) {
  const { classes } = useStyles();
  const { setSnackbar, setLoading, loading } = props;
  const [, getNextPage] = useArticleData();
  const location = useLocation();
  const qs = new URLSearchParams(location.search);
  const pathname = useMemo(() => location.pathname, [location]);

  const theme = useTheme();
  const isAdditionalMarginRequired = useMediaQuery(
    theme.breakpoints.down(1200)
  );

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
    <main
      className={`${classes.main} ${
        isAdditionalMarginRequired && classes.articleItemAdditionalMargin
      }`}
    >
      <section>
        <Grid
          container
          justifyContent="center"
          alignItems="center"
          direction="column"
        >
          <Routes>
            <Route
              path="/"
              element={
                <ArticleDashboard setLoading={setLoading} loading={loading} />
              }
            />
            <Route
              path="article/:id"
              element={
                <ArticleDetails
                  setSnackbar={setSnackbar}
                  setLoading={setLoading}
                  loading={loading}
                />
              }
            />
            <Route
              path="*"
              element={
                <React.Fragment>
                  <Typography>
                    {i18next.t("routing.error.missingPage")}
                  </Typography>
                  <ArticleDashboard setLoading={setLoading} loading={loading} />
                </React.Fragment>
              }
            />
          </Routes>
        </Grid>
      </section>
    </main>
  );
}
