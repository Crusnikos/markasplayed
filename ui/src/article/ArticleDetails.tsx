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
import { Dialogs } from "../components/Dialogs";
import LoadingIndicator from "../components/LoadingIndicator";
import ExceptionPage from "../components/ExceptionPage";
import ArticleDetailsReviewPanel from "./details/ArticleDetailsReviewPanel";
import ArticleDetailsGallery from "./details/ArticleDetailsGallery";
import { ArticleImageData, getFrontImage, getGallery } from "./api/apiGallery";
import { FullArticleData, getArticle } from "./api/apiArticle";
import formatedDateDisplay from "./components/formatedDateDisplay";

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
  edit: {
    cursor: "pointer",
  },
}));

export default function ArticleDetails(props: {
  openDialog: Dispatch<SetStateAction<Dialogs>>;
}): JSX.Element {
  const { classes } = useStyles();
  const { openDialog } = props;

  const [requireFetch, setRequireFetch] = useState<boolean>(true);
  const [article, setArticle] = useState<FullArticleData | undefined>();
  const [frontImage, setFrontImage] = useState<ArticleImageData | undefined>(
    undefined
  );
  const [gallery, setGallery] = useState<ArticleImageData[] | undefined>(
    undefined
  );

  const params = useParams();
  const parsedId = tryParseInt(params.id);

  const [loading, setLoading] = useState<boolean>(true);

  const handleClick = () => {
    openDialog({
      type: "EditArticle",
      data: article,
      images: { main: frontImage, gallery: gallery },
      returnFunction: setRequireFetch,
    });
  };

  useEffect(() => {
    async function fetchArticleData() {
      if (parsedId !== null && requireFetch) {
        try {
          const fetchedResult = await getArticle({ id: parsedId });
          setArticle(fetchedResult);
        } catch {
          setLoading(false);
        }
        setLoading(false);
        setRequireFetch(false);
      }
    }

    void fetchArticleData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsedId, requireFetch]);

  useEffect(() => {
    async function fetchFrontImage() {
      if (parsedId !== null && article !== undefined) {
        const image = await getFrontImage({ id: parsedId });
        setFrontImage(image);
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
    return <ExceptionPage message="Podany artykuł nie istnieje" />;
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
          <Typography variant="h6">{article.shortDescription}</Typography>
          <Grid container item alignItems="flex-start">
            <Typography variant="body2">
              {formatedDateDisplay(article.createdAt)} |{" "}
              {article.createdBy.name}
            </Typography>
          </Grid>
          {frontImage ? (
            <Box
              component="img"
              className={classes.image}
              src={`${frontImage?.imageSrc}?${Date.now()}`}
              alt={"Missing picture"}
            />
          ) : (
            <CircularProgress />
          )}
          <Typography variant="body1" className={classes.content}>
            {article.longDescription}
          </Typography>
          {article.genre.name === "review" && (
            <ArticleDetailsReviewPanel
              playTime={article.playTime}
              playedOn={article.playedOn}
              availableOn={article.availableOn}
            />
          )}
          {gallery ? (
            <ArticleDetailsGallery gallery={gallery} />
          ) : (
            <CircularProgress />
          )}
        </Stack>
      )}
    </Paper>
  );
}
