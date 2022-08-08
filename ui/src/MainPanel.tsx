import { makeStyles } from "tss-react/mui";
import React, { Dispatch, SetStateAction, useEffect, useMemo } from "react";
import { Grid, Typography } from "@mui/material";
import Footer from "./Footer";
import { Dialog } from "./Dialog";
import Menu from "./menu";
import { Route, Routes, useLocation } from "react-router-dom";
import { tryParseInt } from "./parsing";
import { useArticleData } from "./ArticleListProvider";
import ArticleDashboard from "./article/ArticleDashboard";
import ArticleDetails from "./article/ArticleDetails";
import i18next from "i18next";

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
  openDialog: Dispatch<SetStateAction<Dialog>>;
}) {
  const { openDialog } = props;
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
    <main className={classes.content}>
      <section className={classes.container}>
        <Grid
          container
          justifyContent="center"
          alignItems="center"
          direction="column"
        >
          <Menu openDialog={openDialog} />
          <Routes>
            <Route path="/" element={<ArticleDashboard />} />
            <Route
              path="article/:id"
              element={<ArticleDetails openDialog={openDialog} />}
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
          <Footer />
        </Grid>
      </section>
    </main>
  );
}
