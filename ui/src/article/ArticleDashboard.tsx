import { Box, Grid } from "@mui/material";
import { makeStyles } from "tss-react/mui";
import LoadingIndicator from "../components/LoadingIndicator";
import { useArticleData } from "../ArticleListProvider";
import React, { Dispatch, SetStateAction, useEffect } from "react";
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

export default function ArticleDashboard(props: {
  setLoading: Dispatch<SetStateAction<boolean>>;
  loading: boolean;
}): JSX.Element {
  const { classes } = useStyles();
  const { loading, setLoading } = props;
  const [[articleData], getNextPage] = useArticleData();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleData]);

  if (loading) {
    return <LoadingIndicator message={i18next.t("loading.defaultMessage")} />;
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
            <ArticleDashboardItem
              key={article.id}
              data={article}
              setLoading={setLoading}
            />
          ))}
      </Grid>
      <Grid item className={classes.paginationSection}>
        <PagePagination onPageChange={onPageChange} />
      </Grid>
    </React.Fragment>
  );
}
