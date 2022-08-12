import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { makeStyles } from "tss-react/mui";
import { useParams } from "react-router-dom";
import { tryParseInt } from "../parsing";
import EditIcon from "@mui/icons-material/Edit";
import { Dialog } from "../Dialog";
import LoadingIndicator from "../components/LoadingIndicator";
import ExceptionPage from "../components/ExceptionPage";
import ArticleDetailsReviewPanel from "./details/ArticleDetailsReviewPanel";
import ArticleDetailsGallery from "./details/ArticleDetailsGallery";
import { ImageData, getFrontImage, getGallery } from "./api/files";
import { FullArticleData, getArticle } from "./api/article";
import i18next from "i18next";

const useStyles = makeStyles()((theme) => ({
  paper: {
    margin: "auto",
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    padding: theme.spacing(2),
    width: "1200px",
    [theme.breakpoints.down("lg")]: {
      width: "98vw",
    },
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
  edit: {
    cursor: "pointer",
  },
}));

export default function ArticleDetails(props: {
  openDialog: Dispatch<SetStateAction<Dialog>>;
}): JSX.Element {
  const { classes } = useStyles();
  const { openDialog } = props;

  const [requireFetch, setRequireFetch] = useState<boolean>(true);
  const [article, setArticle] = useState<FullArticleData | undefined>();
  const [frontImage, setFrontImage] = useState<ImageData | undefined>(
    undefined
  );
  const [gallery, setGallery] = useState<ImageData[] | undefined>(undefined);

  const params = useParams();
  const parsedId = tryParseInt(params.id);

  const [loading, setLoading] = useState<boolean>(true);

  const handleClick = () => {
    openDialog({
      type: "editArticle",
      data: article,
      images: { main: frontImage, gallery: gallery },
      returnFunction: setRequireFetch,
    });
  };

  useEffect(() => {
    setRequireFetch(true);
  }, [parsedId]);

  useEffect(() => {
    async function fetchArticleData() {
      if (parsedId !== null && requireFetch) {
        try {
          const fetchedResult = await getArticle({ id: parsedId });
          setArticle(fetchedResult);
        } catch {
          setArticle(undefined);
          setLoading(false);
        }
        setLoading(false);
        setRequireFetch(false);
      }
    }

    void fetchArticleData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requireFetch]);

  useEffect(() => {
    async function fetchFrontImage() {
      if (parsedId !== null && article !== undefined) {
        try {
          const image = await getFrontImage({ id: parsedId });
          setFrontImage(image);
        } catch (error) {
          setFrontImage(undefined);
        }
      }
    }

    void fetchFrontImage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article]);

  useEffect(() => {
    async function fetchGallery() {
      if (parsedId !== null && article !== undefined) {
        const gallery = await getGallery({ id: parsedId });
        setGallery(gallery);
      }
    }

    void fetchGallery();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frontImage]);

  if (loading) {
    return <LoadingIndicator />;
  }

  if (article === undefined) {
    return (
      <ExceptionPage message={i18next.t("details.error.missingArticle")} />
    );
  }

  return (
    <Paper elevation={6} className={classes.paper}>
      {article !== undefined && (
        <Stack spacing={2} alignItems="center">
          <Typography variant="h4">
            {article.title}
            <EditIcon
              fontSize="large"
              className={classes.edit}
              onClick={handleClick}
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
      )}
    </Paper>
  );
}
