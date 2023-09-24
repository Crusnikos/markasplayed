import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
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
import drawRandomNumbers from "../../utils/drawRandomNumbers";
import ImageWithSoftEdges from "../../components/ImageWithSoftEdges";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { useArticleData } from "../../context/ArticleListProvider";

const useStyles = makeStyles()((theme) => ({
  paper: {
    margin: "auto",
    marginBottom: theme.spacing(1),
  },
  paperDesktopPaddings: {
    padding: theme.spacing(5),
  },
  paperMobilePaddings: {
    padding: theme.spacing(2),
  },
  image: {
    height: "450px",
    [theme.breakpoints.down("md")]: {
      height: "250px",
    },
    objectFit: "cover",
    objectPosition: "60% 40%",
  },
  content: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
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
  smallerContainer: boolean;
}): JSX.Element {
  const { classes } = useStyles();
  const { setSnackbar, setLoading, loading, smallerContainer } = props;

  const [article, setArticle] = useState<FullArticleData | undefined>();
  const [dividedArticleText, setDividedArticleText] = useState<
    string[] | undefined
  >();
  const [frontImage, setFrontImage] = useState<ImageData | undefined>(
    undefined
  );
  const [gallery, setGallery] = useState<ImageData[] | undefined>(undefined);
  const [tags, setTags] = useState<LookupTagData[] | undefined>(undefined);
  const [, syncDate] = useArticleData();

  const params = useParams();
  const parsedId = tryParseInt(params.id);

  const handleScrollToArticleDetails = () => {
    const element = document.getElementById("article-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const randomGallery = useMemo(
    () => {
      if (gallery === undefined || gallery.length === 0) return;

      var randoms = drawRandomNumbers({
        drawFrom: gallery.length,
        drawThisMany: dividedArticleText?.length
          ? dividedArticleText?.length / 3 - 1
          : 0,
      });

      return gallery.filter((_, index) => randoms.includes(index + 1));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [gallery]
  );

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
    handleScrollToArticleDetails();
  }

  useEffect(() => {
    if (loading) {
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
    if (!loading) {
      return;
    }

    if (frontImage || gallery) {
      setFrontImage(undefined);
      setGallery(undefined);
    }

    void fetchArticleData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

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
  }, [dividedArticleText]);

  if (loading) {
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
      <Paper
        elevation={8}
        className={`${classes.paper} ${
          smallerContainer
            ? classes.paperMobilePaddings
            : classes.paperDesktopPaddings
        }`}
      >
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
                setResponseOnSubmit={setSnackbar}
                setLoading={setLoading}
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
              <LazyLoadImage
                src={`${frontImage?.imagePathName}?${syncDate}`}
                alt={i18next.t("image.missing")}
                className={classes.image}
                width="100%"
                effect="blur"
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
              <React.Fragment key={index}>
                {index !== 0 && index % 3 === 0 && (
                  <ImageWithSoftEdges
                    imageUrl={
                      randomGallery
                        ? randomGallery[index / 3 - 1]?.imagePathName
                        : undefined
                    }
                    maxHeight="320px"
                  />
                )}
                <Typography
                  variant="body1"
                  textAlign="justify"
                  noWrap
                  whiteSpace="pre-line"
                  className={classes.content}
                >
                  {paragraph}
                </Typography>
              </React.Fragment>
            ))}
          </Box>
          {article.articleType.name === "review" && (
            <ReviewPanel
              playTime={article.playTime}
              playedOn={article.playedOn}
              availableOn={article.availableOn}
            />
          )}
          {gallery ? <Gallery gallery={gallery} /> : <CircularProgress />}
        </Stack>
      </Paper>
    </Container>
  );
}
