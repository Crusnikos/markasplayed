import {
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Dialogs } from "../components/Dialogs";
import LoadingIndicator from "../components/LoadingIndicator";
import {
  ArticleCreationRequest,
  createOrUpdateArticle,
  FullArticleData,
  GenreTypes,
} from "./api/apiArticle";
import { getLookup, Lookups } from "./api/apiLookup";
import { makeStyles } from "tss-react/mui";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import { useNavigate } from "react-router-dom";
import ExceptionPage from "../components/ExceptionPage";
import {
  ArticleImageData,
  setArticleGallery,
  setFrontImage,
} from "./api/apiGallery";
import { useArticleData } from "../ArticleListProvider";
import ArticleContentForm from "./form/ArticleContentForm";
import ArticleGalleryForm from "./form/ArticleGalleryForm";

const useStyles = makeStyles()((theme) => ({
  closeIcon: {
    position: "absolute",
    color: theme.palette.common.white,
    right: 8,
    top: 8,
  },
  topInfo: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
  },
  nav: {
    backgroundColor: theme.palette.primary.light,
    padding: theme.spacing(1),
  },
  navChip: {
    color: theme.palette.common.white,
    padding: theme.spacing(2),
    fontSize: "22px",
  },
  button: {
    color: theme.palette.common.white,
  },
  warning: {
    backgroundColor: theme.palette.warning.light,
    padding: theme.spacing(2),
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2),
    borderRadius: "10px",
  },
}));

export default function ArticleForm(props: {
  openDialog: Dispatch<SetStateAction<Dialogs>>;
  data?: FullArticleData;
  images?: {
    main: ArticleImageData | undefined;
    gallery: ArticleImageData[] | undefined;
  };
  returnFunction?: Dispatch<SetStateAction<boolean>>;
}) {
  const { classes } = useStyles();
  const { openDialog, data, images, returnFunction } = props;
  const [[, , page], getNextPage] = useArticleData();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [view, setView] = useState<"ARTYKUŁ" | "GALERIA">("ARTYKUŁ");
  const [lookups, setLookups] = useState<Lookups | undefined>(undefined);
  const [draftArticle, setDraftArticle] = useState<
    { article: ArticleCreationRequest; genre: GenreTypes } | undefined
  >(undefined);

  const navigate = useNavigate();
  const theme = useTheme();
  const smallView = useMediaQuery(theme.breakpoints.up("sm"));

  const closeDialog = () => {
    openDialog({ type: undefined, data: undefined, images: undefined });
  };

  useEffect(() => {
    async function fetchLookups() {
      try {
        const genres = await getLookup({ lookupName: "genres" });
        const platforms = await getLookup({ lookupName: "gamingPlatforms" });

        setLookups({ genres, platforms });
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    void fetchLookups();
  }, []);

  const onArticleSubmit = async (
    formData: ArticleCreationRequest,
    genre: GenreTypes
  ) => {
    if (data?.id) {
      setLoading(true);
      await createOrUpdateArticle(formData, genre);
      await getNextPage({ page });
      returnFunction?.(true);
      closeDialog();
      return;
    } else {
      setDraftArticle({ article: formData, genre: genre });
      setView("GALERIA");
      return;
    }
  };

  const onGallerySubmit = async (
    frontImage?: File,
    oldGalleryImages?: number[],
    newGalleryImages?: File[]
  ) => {
    setLoading(true);

    if (data?.id) {
      frontImage && (await setFrontImage({ id: data?.id, file: frontImage }));
      await setArticleGallery(
        oldGalleryImages && { galleryIds: oldGalleryImages },
        newGalleryImages && { articleId: data?.id, files: newGalleryImages }
      );
      await getNextPage({ page });
      returnFunction?.(true);
      closeDialog();
      return;
    } else {
      if (draftArticle && frontImage) {
        const id = await createOrUpdateArticle(
          draftArticle.article,
          draftArticle.genre
        );

        await setFrontImage({ id: id, file: frontImage });

        newGalleryImages &&
          (await setArticleGallery(undefined, {
            articleId: id,
            files: newGalleryImages,
          }));
      }
      await getNextPage({ page: 1 });
      navigate("/");
      closeDialog();
      return;
    }
  };

  if (loading) {
    const loadingDialog = (
      <Dialog open={true} onClose={closeDialog} fullWidth>
        <DialogContent>
          <LoadingIndicator />
        </DialogContent>
      </Dialog>
    );

    return ReactDOM.createPortal(
      loadingDialog,
      document.getElementById(`dialog-window`)!
    );
  }

  if (error) {
    const errorDialog = (
      <Dialog open={true} onClose={closeDialog} fullWidth>
        <DialogContent>
          <ExceptionPage message="Wystąpił problem z pobraniem danych" />
        </DialogContent>
      </Dialog>
    );

    return ReactDOM.createPortal(
      errorDialog,
      document.getElementById(`dialog-window`)!
    );
  }

  const formDialog = (
    <Dialog open={true} onClose={closeDialog} fullWidth>
      <DialogTitle className={classes.topInfo}>
        {data?.id ? "Edytuj artykuł" : "Dodaj nowy artykuł"}
        <IconButton
          aria-label="close"
          onClick={closeDialog}
          className={classes.closeIcon}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogTitle className={classes.nav}>
        <Grid
          container
          justifyContent="space-between"
          wrap="nowrap"
          alignItems="center"
        >
          <Grid item container xs={3} justifyContent="center">
            <Button
              className={classes.button}
              disabled={view === "ARTYKUŁ"}
              onClick={() => setView("ARTYKUŁ")}
            >
              <KeyboardDoubleArrowLeftIcon />
              {smallView && <Typography fontSize="medium">ARTYKUŁ</Typography>}
            </Button>
          </Grid>
          <Grid item container xs={6} justifyContent="center">
            <Chip label={view} className={classes.navChip} />
          </Grid>
          <Grid item container xs={3} justifyContent="center">
            <Button
              className={classes.button}
              disabled={view === "GALERIA" || data?.id === undefined}
              onClick={() => setView("GALERIA")}
            >
              {smallView && <Typography fontSize="medium">GALERIA</Typography>}
              <KeyboardDoubleArrowRightIcon />
            </Button>
          </Grid>
        </Grid>
      </DialogTitle>
      <DialogContent>
        <DialogContentText className={classes.warning}>
          Zapisywanie oraz edytowanie formularza dostępne tylko dla zalogowanych
          użytkowników.
        </DialogContentText>
        {view === "ARTYKUŁ" && (
          <ArticleContentForm
            data={data}
            draft={draftArticle?.article}
            onArticleSubmit={onArticleSubmit}
            lookups={lookups}
          />
        )}
        {view === "GALERIA" && (
          <ArticleGalleryForm
            frontImage={images?.main}
            gallery={images?.gallery}
            onGallerySubmit={onGallerySubmit}
          />
        )}
      </DialogContent>
    </Dialog>
  );

  return ReactDOM.createPortal(
    formDialog,
    document.getElementById(`dialog-window`)!
  );
}
