import { Box, Grid } from "@mui/material";
import { makeStyles } from "tss-react/mui";
import LoadingIndicator from "../components/LoadingIndicator";
import { useArticleData } from "../ArticleListProvider";
import React, { useEffect, useState } from "react";
import PagePagination from "../components/PagePagination";
import ExceptionPage from "../components/ExceptionPage";
import ArticleDashboardItem from "./dashboard/ArticleDashboardItem";
import i18next from "i18next";

const useStyles = makeStyles()((theme) => ({
  paginationSection: {
    marginTop: theme.spacing(2),
  },
  articlesContainer: {
    width: "100%",
  },
}));

export default function ArticleDashboard(): JSX.Element {
  const { classes } = useStyles();
  const [[articleData], getNextPage] = useArticleData();
  const [loading, setLoading] = useState<boolean>(true);
  const isArticleDataEmpty =
    articleData === undefined ||
    articleData instanceof Error ||
    articleData.length === 0;

  const onPageChange = async (page: number) => {
    setLoading(true);
    await getNextPage({ page });
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    if (articleData !== undefined) {
      setLoading(false);
    }
  }, [articleData]);

  if (loading) {
    return <LoadingIndicator message={i18next.t("loading")} />;
  }

  if (articleData instanceof Error) {
    return <ExceptionPage message={i18next.t("dashboard.error.retrieve")} />;
  }

  if (isArticleDataEmpty) {
    return (
      <React.Fragment>
        <ExceptionPage message={i18next.t("dashboard.error.missingPage")} />
        <Box sx={{ flexGrow: 1 }} />
        <Grid item className={classes.paginationSection}>
          <PagePagination onPageChange={onPageChange} />
        </Grid>
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <Grid item className={classes.articlesContainer}>
        {!isArticleDataEmpty &&
          articleData.map((article) => (
            <ArticleDashboardItem key={article.id} data={article} />
          ))}
      </Grid>
      <Grid item className={classes.paginationSection}>
        <PagePagination onPageChange={onPageChange} />
      </Grid>
    </React.Fragment>
  );
}
