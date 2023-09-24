import { makeStyles } from "tss-react/mui";
import React, {
  Dispatch,
  SetStateAction,
  Suspense,
  useEffect,
  useMemo,
} from "react";
import {
  Container,
  Grid,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Route, Routes, useLocation } from "react-router-dom";
import { tryParseInt } from "../utils/parsing";
import { useArticleData } from "../context/ArticleListProvider";
import ArticleDashboard from "./Dashboard";
import i18next from "i18next";
import { DispatchSnackbar } from "../components/SnackbarDialog";
import LoadingIndicator from "../components/LoadingIndicator";
import ErrorBoundary from "../components/ErrorBoundary";

const ArticleDetails = React.lazy(() => import("./Article"));

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
  const [, , sync] = useArticleData();
  const location = useLocation();
  const qs = new URLSearchParams(location.search);
  const pathname = useMemo(() => location.pathname, [location]);

  const theme = useTheme();
  const smallerContainer = useMediaQuery(theme.breakpoints.down(1200));

  useEffect(() => {
    async function fetchRequestedPage() {
      const page = tryParseInt(qs.get("page"));
      if (page !== null && page !== 1 && pathname === "/") {
        await sync({ page: page });
      } else {
        await sync({ page: 1 });
      }
    }

    void fetchRequestedPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main
      className={`${classes.main} ${
        smallerContainer && classes.articleItemAdditionalMargin
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
                <ErrorBoundary displayType={"Page"}>
                  <Suspense
                    fallback={
                      <Container disableGutters={true} sx={{ height: "80vh" }}>
                        <LoadingIndicator />
                      </Container>
                    }
                  >
                    <ArticleDetails
                      setSnackbar={setSnackbar}
                      setLoading={setLoading}
                      loading={loading}
                      smallerContainer={smallerContainer}
                    />
                  </Suspense>
                </ErrorBoundary>
              }
            />
            <Route
              path="*"
              element={
                <React.Fragment>
                  <Typography variant="h5">
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
