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
import { tryParseInt } from "../../utils/parsing";
import LoadingIndicator from "../../components/LoadingIndicator";
import ExceptionPage from "../../components/ExceptionPage";
import ReviewPanel from "./ReviewPanel";
import Gallery from "./Gallery";
import TagPanel from "./TagPanel";
import { ImageData, getFrontImage, getGallery } from "../../api/files";
import { FullArticleData, getArticle } from "../../api/article";
import i18next from "i18next";
import { DispatchSnackbar } from "../../components/SnackbarDialog";
import { getArticleTags, LookupTagData } from "../../api/tag";
import { DialogController } from "../../dialogs";

const useStyles = makeStyles()((theme) => ({
  paper: {
    margin: "auto",
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
    paddingBottom: theme.spacing(2),
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

  const [syncRequired, setSyncRequired] = useState<boolean>(false);
  const [article, setArticle] = useState<FullArticleData | undefined>();
  const [dividedArticleText, setDividedArticleText] = useState<
    string[] | undefined
  >();
  const [frontImage, setFrontImage] = useState<ImageData | undefined>(
    undefined
  );
  const [gallery, setGallery] = useState<ImageData[] | undefined>(undefined);
  const [tags, setTags] = useState<LookupTagData[] | undefined>(undefined);

  const params = useParams();
  const parsedId = tryParseInt(params.id);

  const showLoadingSpinner = loading || syncRequired;

  const handleScrollToArticleDetails = () => {
    const element = document.getElementById("article-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  async function fetchArticleData() {
    if (parsedId === null) {
      return;
    }
    try {
      const fetchedResult = await getArticle({ id: parsedId });
      setArticle(fetchedResult);
      setDividedArticleText(
        fetchedResult.longDescription.split("\n").filter((t) => t)
      );
    } catch {
      setArticle(undefined);
    }
    setLoading(false);
    setSyncRequired(false);
    handleScrollToArticleDetails();
  }

  useEffect(() => {
    if (loading || syncRequired) {
      return;
    }

    if (frontImage || gallery) {
      setFrontImage(undefined);
      setGallery(undefined);
    }

    void fetchArticleData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsedId]);

  useEffect(() => {
    if (!loading && !syncRequired) {
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
  }, [loading, syncRequired]);

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

    async function fetchTags() {
      if (parsedId !== null && article !== undefined) {
        const tags = await getArticleTags({ id: parsedId });
        setTags(tags);
      }
    }

    void fetchFrontImage();

    void fetchGallery();

    void fetchTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article]);

  if (showLoadingSpinner) {
    return (
      <Container disableGutters={true} sx={{ height: "80vh" }}>
        <LoadingIndicator />
      </Container>
    );
  }

  if (article === undefined) {
    return (
      <ExceptionPage message={i18next.t("details.error.missingArticle")} />
    );
  }

  return (
    <Container disableGutters={true} id="article-section">
      <Paper elevation={6} className={classes.paper}>
        <Stack spacing={2} alignItems="center">
          <Grid
            container
            direction="row"
            justifyContent="center"
            alignItems="stretch"
          >
            <Typography variant="h3" textAlign="center" fontWeight="bold">
              {article.title.toLocaleUpperCase()}
              <DialogController
                displayDialog="editArticle"
                data={article}
                images={{ main: frontImage, gallery: gallery }}
                setSyncRequired={setSyncRequired}
                setResponseOnSubmit={setSnackbar}
              />
            </Typography>
          </Grid>
          <Typography variant="h5" textAlign="justify">
            {article.shortDescription}
          </Typography>
          <Grid container item alignItems="flex-start">
            <Typography variant="body1">
              {new Date(article.createdAt).toLocaleDateString()} |{" "}
              {article.createdBy.name}
            </Typography>
          </Grid>
          {frontImage && tags ? (
            <React.Fragment>
              <Box
                component="img"
                className={classes.image}
                src={`${frontImage?.imagePathName}?${Date.now()}`}
                alt={i18next.t("image.missing")}
              />
              <TagPanel
                tags={tags}
                setTags={setTags}
                setSnackbar={setSnackbar}
              />
            </React.Fragment>
          ) : (
            <CircularProgress />
          )}
          <Box component="div" className={classes.textBox}>
            {dividedArticleText?.map((paragraph, index) => (
              <Typography
                key={index}
                variant="body1"
                textAlign="justify"
                noWrap
                whiteSpace="pre-line"
                className={classes.content}
              >
                {paragraph}
              </Typography>
            ))}
          </Box>
          {article.articleType.name === "review" && (
            <ReviewPanel
              playTime={article.playTime}
              playedOn={article.playedOn}
              availableOn={article.availableOn}
            />
          )}
          {gallery ? (
            <Gallery gallery={gallery} step={syncRequired} />
          ) : (
            <CircularProgress />
          )}
        </Stack>
      </Paper>
    </Container>
  );
}
