import { Grid } from "@mui/material";
import { makeStyles } from "tss-react/mui";
import LoadingIndicator from "../components/LoadingIndicator";
import { useArticleData } from "../ArticleListProvider";
import ArticleDashboardItem from "./ArticleDashboardItem";
import React, { useEffect, useState } from "react";
import PagePagination from "../components/PagePagination";
import ExceptionPage from "../components/ExceptionPage";

const useStyles = makeStyles()((theme) => ({
  articleSection: {
    width: "1200px",
    [theme.breakpoints.down("lg")]: {
      width: "100vw",
    },
  },
  paginationSection: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
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
  };

  useEffect(() => {
    if (articleData !== undefined) {
      setLoading(false);
    }
  }, [articleData]);

  if (loading) {
    return <LoadingIndicator />;
  }

  if (articleData instanceof Error) {
    return (
      <ExceptionPage message="Wystąpił błąd podczas pobierania artykułów, prosze odśwież stronę" />
    );
  }

  if (isArticleDataEmpty) {
    return (
      <React.Fragment>
        <ExceptionPage message="Podana strona nie istnieje, skorzystaj z nawigatora poniżej" />
        <Grid item className={classes.paginationSection}>
          <PagePagination onPageChange={onPageChange} />
        </Grid>
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <Grid item className={classes.articleSection}>
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
