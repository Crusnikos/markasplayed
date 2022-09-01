import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { makeStyles } from "tss-react/mui";
import { useParams } from "react-router-dom";
import { tryParseInt } from "../parsing";
import LoadingIndicator from "../components/LoadingIndicator";
import ExceptionPage from "../components/ExceptionPage";
import ArticleDetailsReviewPanel from "./details/ArticleDetailsReviewPanel";
import ArticleDetailsGallery from "./details/ArticleDetailsGallery";
import { ImageData, getFrontImage, getGallery } from "./api/files";
import { FullArticleData, getArticle } from "./api/article";
import i18next from "i18next";
import ArticleForm from "./ArticleForm";
import { DispatchSnackbar } from "../components/SnackbarDialog";

const useStyles = makeStyles()((theme) => ({
  paper: {
    margin: "auto",
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    padding: theme.spacing(2),
  },
  image: {
    width: "100%",
    height: "350px",
    [theme.breakpoints.down("lg")]: {
      height: "250px",
    },
    display: "inline-block",
    objectFit: "cover",
    objectPosition: "60% 40%",
    transition: "2s",
  },
  content: {
    whiteSpace: "pre-line",
  },
  textBox: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    width: "100%",
  },
}));

export default function ArticleDetails(props: {
  setSnackbar: DispatchSnackbar;
  setLoading: Dispatch<SetStateAction<boolean>>;
  loading: boolean;
}): JSX.Element {
  const { classes } = useStyles();
  const { setSnackbar, setLoading, loading } = props;

  const [requireFetch, setRequireFetch] = useState<boolean>(false);
  const [article, setArticle] = useState<FullArticleData | undefined>();
  const [frontImage, setFrontImage] = useState<ImageData | undefined>(
    undefined
  );
  const [gallery, setGallery] = useState<ImageData[] | undefined>(undefined);

  const params = useParams();
  const parsedId = tryParseInt(params.id);

  const showLoadingSpinner = loading || requireFetch;

  useEffect(() => {
    async function fetchArticleData() {
      if (parsedId === null) {
        return;
      }
      try {
        const fetchedResult = await getArticle({ id: parsedId });
        setArticle(fetchedResult);
      } catch {
        setArticle(undefined);
      }
      setLoading(false);
      setRequireFetch(false);
    }

    if (!loading && !requireFetch) {
      return;
    }

    if (loading && parsedId === article?.id) {
      setLoading(false);
      return;
    }

    if (frontImage || gallery) {
      setFrontImage(undefined);
      setGallery(undefined);
    }

    void fetchArticleData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, requireFetch]);

  useEffect(() => {
    async function fetchFrontImage() {
      if (parsedId !== null && article !== undefined) {
        const image = await getFrontImage({ id: parsedId });
        setFrontImage(image);
      }
    }

    async function fetchGallery() {
      if (parsedId !== null && article !== undefined) {
        const gallery = await getGallery({ id: parsedId });
        setGallery(gallery);
      }
    }

    void fetchFrontImage();

    void fetchGallery();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article]);

  if (showLoadingSpinner) {
    return <LoadingIndicator />;
  }

  if (article === undefined) {
    return (
      <ExceptionPage message={i18next.t("details.error.missingArticle")} />
    );
  }

  return (
    <Container disableGutters={true}>
      <Paper elevation={6} className={classes.paper}>
        <Stack spacing={2} alignItems="center">
          <Typography variant="h4">
            {article.title}
            <ArticleForm
              data={article}
              images={{ main: frontImage, gallery: gallery }}
              returnFunction={setRequireFetch}
              responseOnSubmitForm={setSnackbar}
            />
          </Typography>
          <Box component="div" className={classes.textBox}>
            <Typography variant="h6">{article.shortDescription}</Typography>
          </Box>
          <Grid container item alignItems="flex-start">
            <Typography variant="body2">
              {new Date(article.createdAt).toLocaleDateString()} |{" "}
              {article.createdBy.name}
            </Typography>
          </Grid>
          {frontImage ? (
            <Box
              component="img"
              className={classes.image}
              src={`${frontImage?.imagePathName}?${Date.now()}`}
              alt={i18next.t("image.missing")}
            />
          ) : (
            <CircularProgress />
          )}
          <Box component="div" className={classes.textBox}>
            <Typography variant="body1" className={classes.content} noWrap>
              {article.longDescription}
            </Typography>
          </Box>
          {article.articleType.name === "review" && (
            <ArticleDetailsReviewPanel
              playTime={article.playTime}
              playedOn={article.playedOn}
              availableOn={article.availableOn}
            />
          )}
          {gallery ? (
            <ArticleDetailsGallery gallery={gallery} step={requireFetch} />
          ) : (
            <CircularProgress />
          )}
        </Stack>
      </Paper>
    </Container>
  );
}
