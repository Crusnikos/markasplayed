import {
  AlertColor,
  Button,
  Chip,
  Dialog as DialogMUI,
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
import { Dialog } from "../Dialog";
import LoadingIndicator from "../components/LoadingIndicator";
import {
  ArticleFormData,
  FullArticleData,
  ArticleTypes,
  updateArticle,
  createArticle,
} from "./api/article";
import { getLookup, Lookups } from "./api/lookup";
import { makeStyles } from "tss-react/mui";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import { useNavigate } from "react-router-dom";
import ExceptionPage from "../components/ExceptionPage";
import {
  addToGallery,
  ImageData,
  setFrontImage,
  updateGallery,
} from "./api/files";
import { useArticleData } from "../ArticleListProvider";
import ArticleContentForm from "./form/ArticleContentForm";
import ArticleGalleryForm from "./form/ArticleGalleryForm";
import { useFirebaseAuth } from "../firebase";
import i18next from "i18next";

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
  openDialog: Dispatch<SetStateAction<Dialog>>;
  responseOnSubmitForm: Dispatch<
    SetStateAction<{
      message: string | undefined;
      severity: AlertColor | undefined;
    }>
  >;
  data?: FullArticleData;
  images?: {
    main: ImageData | undefined;
    gallery: ImageData[] | undefined;
  };
  returnFunction?: Dispatch<SetStateAction<boolean>>;
}) {
  const { classes } = useStyles();
  const { openDialog, data, images, returnFunction, responseOnSubmitForm } =
    props;
  const { app } = useFirebaseAuth();
  const [[, , page], getNextPage] = useArticleData();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [view, setView] = useState<"article" | "gallery">("article");
  const [lookups, setLookups] = useState<Lookups | undefined>(undefined);
  const [draftArticle, setDraftArticle] = useState<
    { article: ArticleFormData; articleType: ArticleTypes } | undefined
  >(undefined);

  const navigate = useNavigate();
  const theme = useTheme();
  const smallView = useMediaQuery(theme.breakpoints.up("sm"));

  const closeDialog = () => {
    openDialog({
      type: undefined,
      data: undefined,
      images: undefined,
      returnFunction: undefined,
    });
  };

  useEffect(() => {
    async function fetchLookups() {
      try {
        const articleTypes = await getLookup({ lookupName: "articleTypes" });
        const platforms = await getLookup({ lookupName: "gamingPlatforms" });

        setLookups({ articleTypes, platforms });
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    void fetchLookups();
  }, []);

  async function createArticleExecution(draftArticle: {
    article: ArticleFormData;
    articleType: ArticleTypes;
  }): Promise<{
    status: string;
    id: number | undefined;
  }> {
    try {
      const token = await app!.auth().currentUser?.getIdToken();
      if (!token) {
        throw new Error();
      }

      const id = await createArticle(
        draftArticle.article,
        draftArticle.articleType,
        token
      );
      return { status: "success", id };
    } catch {
      responseOnSubmitForm({
        message: i18next.t("form.error.article.create"),
        severity: `error`,
      });
      return { status: "failure", id: undefined };
    }
  }

  async function updateArticleExecution(
    formData: ArticleFormData,
    articleType: ArticleTypes
  ): Promise<{ status: string }> {
    try {
      const token = await app!.auth().currentUser?.getIdToken();
      if (!token) {
        throw new Error();
      }

      await updateArticle(formData, articleType, token);
      return { status: "success" };
    } catch {
      responseOnSubmitForm({
        message: i18next.t("form.error.article.update"),
        severity: `error`,
      });
      return { status: "failure" };
    }
  }

  async function setFrontImageExecution(
    id: number,
    frontImage: File
  ): Promise<{ status: string }> {
    try {
      const token = await app!.auth().currentUser?.getIdToken();
      if (!token) {
        throw new Error();
      }

      await setFrontImage({ id: id, file: frontImage }, token);
      return { status: "success" };
    } catch {
      responseOnSubmitForm({
        message: i18next.t("form.error.frontImage.set"),
        severity: `error`,
      });
      return { status: "failure" };
    }
  }

  async function updateGalleryExecution(
    id: number,
    galleryIds: number[]
  ): Promise<{ status: string }> {
    try {
      const token = await app!.auth().currentUser?.getIdToken();
      if (!token) {
        throw new Error();
      }

      await updateGallery({ id, galleryIds }, token);
      return { status: "success" };
    } catch {
      responseOnSubmitForm({
        message: i18next.t("form.error.gallery.update"),
        severity: `error`,
      });
      return { status: "failure" };
    }
  }

  async function addToGalleryExecution(
    articleId: number,
    images: File[]
  ): Promise<{ status: string }> {
    try {
      const token = await app!.auth().currentUser?.getIdToken();
      if (!token) {
        throw new Error();
      }

      const responseCode = await addToGallery(
        {
          articleId: articleId,
          files: images,
        },
        token
      );
      if (responseCode !== 204) {
        responseOnSubmitForm({
          message: i18next.t("form.warning.gallery.partiallyAdd"),
          severity: `warning`,
        });
      }
      return { status: "success" };
    } catch {
      responseOnSubmitForm({
        message: i18next.t("form.error.gallery.add"),
        severity: `error`,
      });
      return { status: "failure" };
    }
  }

  const onArticleSubmit = async (
    formData: ArticleFormData,
    articleType: ArticleTypes
  ) => {
    if (data?.id) {
      setLoading(true);

      const response = await updateArticleExecution(formData, articleType);

      if (response.status === "success") {
        await getNextPage({ page });
        returnFunction?.(true);
        responseOnSubmitForm({
          message: i18next.t("form.success.article.update"),
          severity: `success`,
        });
      }

      return closeDialog();
    } else {
      setDraftArticle({ article: formData, articleType });
      setView("gallery");
    }
  };

  const onGallerySubmit = async (
    frontImage?: File,
    oldGalleryImages?: number[],
    newGalleryImages?: File[]
  ) => {
    setLoading(true);

    if (data?.id) {
      const frontImageResponse =
        frontImage && (await setFrontImageExecution(data?.id, frontImage));
      if (frontImageResponse && frontImageResponse.status === "failure") {
        return closeDialog();
      }

      const updateGalleryResponse =
        oldGalleryImages &&
        (await updateGalleryExecution(data?.id, oldGalleryImages));
      if (updateGalleryResponse && updateGalleryResponse.status === "failure") {
        await getNextPage({ page });
        returnFunction?.(true);
        return closeDialog();
      }

      const addToGalleryResponse =
        newGalleryImages &&
        (await addToGalleryExecution(data?.id, newGalleryImages));
      if (addToGalleryResponse && addToGalleryResponse.status === "failure") {
        await getNextPage({ page });
        returnFunction?.(true);
        return closeDialog();
      }

      responseOnSubmitForm({
        message: i18next.t("form.success.gallery.update"),
        severity: `success`,
      });
      returnFunction?.(true);
      return closeDialog();
    }

    if (draftArticle && frontImage) {
      const createArticleResponse = await createArticleExecution(draftArticle);
      if (
        createArticleResponse &&
        createArticleResponse.status === "failure" &&
        createArticleResponse.id === undefined
      ) {
        return closeDialog();
      }

      const frontImageResponse = await setFrontImageExecution(
        createArticleResponse.id!,
        frontImage
      );
      if (frontImageResponse && frontImageResponse.status === "failure") {
        await getNextPage({ page: 1 });
        navigate("/");
        return closeDialog();
      }

      const addToGalleryResponse =
        newGalleryImages &&
        (await addToGalleryExecution(
          createArticleResponse.id!,
          newGalleryImages
        ));
      if (addToGalleryResponse && addToGalleryResponse.status === "failure") {
        await getNextPage({ page: 1 });
        navigate("/");
        return closeDialog();
      }

      await getNextPage({ page: 1 });
      responseOnSubmitForm({
        message: i18next.t("form.success.article.add"),
        severity: `success`,
      });
      navigate("/");
      return closeDialog();
    }
  };

  if (loading) {
    const loadingDialog = (
      <DialogMUI open={true} onClose={closeDialog} fullWidth>
        <DialogContent>
          <LoadingIndicator message={i18next.t("loading")} />
        </DialogContent>
      </DialogMUI>
    );

    return ReactDOM.createPortal(
      loadingDialog,
      document.getElementById(`dialog-window`)!
    );
  }

  if (error) {
    const errorDialog = (
      <DialogMUI open={true} onClose={closeDialog} fullWidth>
        <DialogContent>
          <ExceptionPage message={i18next.t("form.error.lookup.retrieve")} />
        </DialogContent>
      </DialogMUI>
    );

    return ReactDOM.createPortal(
      errorDialog,
      document.getElementById(`dialog-window`)!
    );
  }

  const formDialog = (
    <DialogMUI open={true} onClose={closeDialog} fullWidth>
      <DialogTitle className={classes.topInfo}>
        {i18next.t(data?.id ? "title.editArticle" : "title.addArticle")}
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
              disabled={view === "article"}
              onClick={() => setView("article")}
            >
              <KeyboardDoubleArrowLeftIcon />
              {smallView && (
                <Typography fontSize="medium">
                  {i18next.t("form.view.article")}
                </Typography>
              )}
            </Button>
          </Grid>
          <Grid item container xs={6} justifyContent="center">
            <Chip
              label={i18next.t(`form.view.${view}`)}
              className={classes.navChip}
            />
          </Grid>
          <Grid item container xs={3} justifyContent="center">
            <Button
              className={classes.button}
              disabled={view === "gallery" || data?.id === undefined}
              onClick={() => setView("gallery")}
            >
              {smallView && (
                <Typography fontSize="medium">
                  {i18next.t("form.view.gallery")}
                </Typography>
              )}
              <KeyboardDoubleArrowRightIcon />
            </Button>
          </Grid>
        </Grid>
      </DialogTitle>
      <DialogContent>
        <DialogContentText className={classes.warning}>
          {i18next.t("subtitle.article")}
        </DialogContentText>
        {view === "article" && (
          <ArticleContentForm
            data={data}
            draft={draftArticle?.article}
            onArticleSubmit={onArticleSubmit}
            lookups={lookups}
          />
        )}
        {view === "gallery" && (
          <ArticleGalleryForm
            frontImage={images?.main}
            gallery={images?.gallery}
            onGallerySubmit={onGallerySubmit}
          />
        )}
      </DialogContent>
    </DialogMUI>
  );

  return ReactDOM.createPortal(
    formDialog,
    document.getElementById(`dialog-window`)!
  );
}
