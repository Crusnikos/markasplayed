import React, { useReducer, useState } from "react";
import { makeStyles } from "tss-react/mui";
import {
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  CardMedia,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import { ImageData } from "../api/files";
import galleryReducer from "./galleryReducer";
import ClearIcon from "@mui/icons-material/Clear";
import Stepper from "../../components/Stepper";
import { useFirebaseAuth } from "../../firebase";
import i18next from "i18next";

const useStyles = makeStyles()((theme) => ({
  helperMargin: {
    marginBottom: theme.spacing(2),
  },
  topInfo: {
    color: theme.palette.common.white,
    backgroundColor: theme.palette.primary.light,
    padding: theme.spacing(1),
    paddingLeft: theme.spacing(2),
  },
  bottomInfo: {
    color: theme.palette.common.white,
    backgroundColor: theme.palette.primary.light,
    padding: theme.spacing(1),
  },
  container: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  addNewContainer: {
    height: "300px",
    [theme.breakpoints.down("lg")]: {
      height: "180px",
    },
  },
  image: {
    height: "300px",
    [theme.breakpoints.down("lg")]: {
      height: "180px",
    },
    transition: "2s",
    objectFit: "cover",
  },
  switch: {
    width: "135px",
    height: theme.spacing(5),
    marginLeft: theme.spacing(0),
    background: theme.palette.grey[300],
    borderRadius: theme.spacing(1),
  },
  delete: {
    width: "95px",
    height: theme.spacing(5),
    background: theme.palette.grey[300],
    borderRadius: theme.spacing(1),
  },
  galleryImageSection: {
    display: "grid",
  },
  galleryImageSectionButton: {
    marginTop: theme.spacing(2),
    marginRight: theme.spacing(3),
    gridRowStart: 1,
    gridColumnStart: 1,
    justifySelf: "end",
    zIndex: 2,
  },
  galleryImageSectionImage: {
    gridRowStart: 1,
    gridColumnStart: 1,
    zIndex: 1,
  },
}));

export default function ArticleGalleryForm(props: {
  frontImage?: ImageData | undefined;
  gallery?: ImageData[] | undefined;
  onGallerySubmit: (
    frontImage?: File,
    oldGalleryImages?: number[],
    newGalleryImages?: File[]
  ) => Promise<void>;
}): JSX.Element {
  const { classes } = useStyles();
  const { frontImage, gallery, onGallerySubmit } = props;
  const { authenticated } = useFirebaseAuth();

  const [activeStep, setActiveStep] = useState(0);

  const [imagesState, imagesDispatch] = useReducer(galleryReducer, {
    mainImage: {
      file: undefined,
      preview: frontImage?.imagePathName ?? undefined,
      error: undefined,
    },
    gallery: {
      files: undefined,
      previews: gallery
        ? [
            ...gallery.map((i) => ({
              id: i.id,
              link: i.imagePathName,
              isActive: true,
              isNew: false,
            })),
            { id: undefined, link: "newAdd", isActive: true, isNew: false },
          ]
        : [{ id: undefined, link: "newAdd", isActive: true, isNew: false }],
      error: undefined,
      message: undefined,
    },
  });

  function submitHandler(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!imagesState.mainImage.preview) {
      imagesDispatch({
        type: "setFrontImageError",
        data: i18next.t("form.error.frontImage.notSelected"),
      });
      return;
    }

    const oldGalleryImages = imagesState.gallery.previews
      .filter((i) => i.isActive === false)
      .map((i) => i.id);

    if (
      !imagesState.mainImage.file &&
      !imagesState.gallery.files &&
      oldGalleryImages.length === 0
    ) {
      imagesDispatch({
        type: "setFrontImageAndGalleryError",
        data: i18next.t("form.error.frontImage.notSelected"),
      });
      return;
    }

    onGallerySubmit(
      imagesState.mainImage.file,
      oldGalleryImages.length !== 0
        ? (oldGalleryImages as number[])
        : undefined,
      imagesState.gallery.files
    );
  }

  function displayFrontImage(): JSX.Element {
    return (
      <CardActionArea component="label" className={classes.container}>
        <input
          hidden
          accept="image/webp"
          type="file"
          onChange={(event) =>
            imagesDispatch({
              type: "setFrontImage",
              data: event.currentTarget.files,
            })
          }
        />
        <CardMedia
          component="img"
          src={
            imagesState.mainImage.file
              ? imagesState.mainImage.preview
              : `${imagesState.mainImage.preview}?${Date.now()}`
          }
          alt={i18next.t("image.missing")}
          className={classes.image}
        />
      </CardActionArea>
    );
  }

  function displayAddNewFrontImage(): JSX.Element {
    return (
      <CardActionArea
        component="label"
        className={`${classes.container} ${classes.addNewContainer}`}
      >
        <input
          hidden
          accept="image/webp"
          type="file"
          onChange={(event) =>
            imagesDispatch({
              type: "setFrontImage",
              data: event.currentTarget.files,
            })
          }
        />
        <AddPhotoAlternateIcon fontSize="large" />
      </CardActionArea>
    );
  }

  function displayGalleryImage(index: number) {
    if (
      index !== imagesState.gallery.previews.length - 1 &&
      !imagesState.gallery.previews[index].isNew
    ) {
      return displayExistingGalleryImage();
    }
    if (index !== imagesState.gallery.previews.length - 1) {
      return displayWaitingGalleryImage();
    }
    return displayAddNewGalleryImage();
  }

  function displayExistingGalleryImage(): JSX.Element {
    return (
      <Grid container className={classes.galleryImageSection}>
        <Grid item className={classes.galleryImageSectionButton}>
          <FormControlLabel
            control={
              <Switch
                checked={imagesState.gallery.previews[activeStep].isActive}
                onChange={() =>
                  imagesDispatch({
                    type: "setGalleryImageAsConcealed",
                    data: imagesState.gallery.previews[activeStep].id as number,
                  })
                }
              />
            }
            label={
              <Typography fontSize="large">
                {imagesState.gallery.previews[activeStep].isActive
                  ? i18next.t("form.label.gallery.active")
                  : i18next.t("form.label.gallery.hidden")}
              </Typography>
            }
            labelPlacement="start"
            className={classes.switch}
          />
        </Grid>
        <Grid item className={classes.galleryImageSectionImage}>
          <CardMedia
            component="img"
            src={imagesState.gallery.previews[activeStep].link}
            alt={i18next.t("image.missing")}
            className={classes.image}
          />
        </Grid>
      </Grid>
    );
  }

  function displayWaitingGalleryImage(): JSX.Element {
    return (
      <Grid container className={classes.galleryImageSection}>
        <Grid item className={classes.galleryImageSectionButton}>
          <IconButton
            disableRipple
            onClick={() =>
              imagesDispatch({
                type: "deleteNewGalleryImage",
                data: {
                  fileIndex: activeStep - (gallery?.length ?? 0),
                  previewIndex: activeStep,
                },
              })
            }
            className={classes.delete}
          >
            <Typography>{i18next.t("form.label.gallery.delete")}</Typography>
            <ClearIcon fontSize="medium" />
          </IconButton>
        </Grid>
        <Grid item className={classes.galleryImageSectionImage}>
          <CardMedia
            component="img"
            src={imagesState.gallery.previews[activeStep].link}
            alt={i18next.t("image.missing")}
            className={classes.image}
          />
        </Grid>
      </Grid>
    );
  }

  function displayAddNewGalleryImage(): JSX.Element {
    return (
      <CardActionArea
        component="label"
        className={`${classes.container} ${classes.addNewContainer}`}
      >
        <input
          hidden
          accept="image/webp"
          multiple
          type="file"
          onChange={(event) =>
            imagesDispatch({
              type: "addNewGalleryImages",
              data: event.currentTarget.files,
            })
          }
        />
        <AddPhotoAlternateIcon fontSize="large" />
      </CardActionArea>
    );
  }

  return (
    <form
      autoComplete="off"
      noValidate
      onSubmit={(event) => submitHandler(event)}
    >
      <Stack direction="column">
        <Card>
          <CardHeader
            title={i18next.t("title.mainPicture")}
            className={classes.topInfo}
            titleTypographyProps={{ variant: "h6" }}
          />
          {imagesState.mainImage.preview
            ? displayFrontImage()
            : displayAddNewFrontImage()}
          <CardContent className={classes.bottomInfo}>
            <Typography variant="body1">
              {i18next.t("subtitle.mainPicture")}
            </Typography>
          </CardContent>
        </Card>
        <FormHelperText error className={classes.helperMargin}>
          {imagesState.mainImage.error}
        </FormHelperText>
        <Card>
          <CardHeader
            title={i18next.t("title.gallery")}
            className={classes.topInfo}
            titleTypographyProps={{ variant: "h6" }}
          />
          {displayGalleryImage(activeStep)}
          <Stepper
            activeStep={activeStep}
            setActiveStep={setActiveStep}
            length={imagesState.gallery.previews.length}
          />
        </Card>
        <FormHelperText error className={classes.helperMargin}>
          {imagesState.gallery.error}
          {imagesState.gallery.previews.filter((i) => i.isActive === false)
            .length !== 0 && imagesState.gallery.message}
        </FormHelperText>
        {authenticated ? (
          <Button type="submit" variant="contained">
            {frontImage
              ? i18next.t("form.submit.gallery.edit")
              : i18next.t("form.submit.gallery.add")}
          </Button>
        ) : (
          <Button type="submit" variant="contained" disabled>
            {i18next.t("form.submit.notAvailable")}
          </Button>
        )}
      </Stack>
    </form>
  );
}
