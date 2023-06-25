import { CardMedia, Grid, IconButton, Stack, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { makeStyles } from "tss-react/mui";
import { ActionType, GalleryData } from "./imagesReducer";
import Stepper from "../../components/Stepper";
import i18next from "i18next";
import { CustomInputImage } from "./formUnitsTemplates";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import zoomInZoomOut from "../../animatedEffects/zoomInZoomOut.module.css";
import useSwipe from "../../hooks/useSwipe";
import { onBackwardIndex, onForwardIndex } from "../../swipe";
import swipeImage from "../../animatedEffects/swipeImage.module.css";

const useStyles = makeStyles()((theme) => ({
  stack: {
    paddingTop: theme.spacing(1),
  },
  gallerySectionWrapper: {
    display: "grid",
  },
  removeImagecontainer: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1),
    gridRowStart: 1,
    gridColumnStart: 1,
    justifySelf: "end",
    zIndex: 2,
  },
  removeImageButton: {
    backgroundColor: theme.palette.common.white,
  },
  galleryPosition: {
    gridRowStart: 1,
    gridColumnStart: 1,
    zIndex: 1,
  },
  imagesContainer: {
    display: "flex",
    flexWrap: "nowrap",
    overflow: "hidden",
    aspectRatio: "16/9",
    width: "100%",
  },
  deactivatedImagesInfo: {
    color: theme.palette.error.main,
    width: "80%",
  },
  inputImager: {
    aspectRatio: "16/9",
    width: "100%",
  },
}));

export default function ArticleGalleryForm(props: {
  numberOfDeactivatedImages: number;
  gallery: GalleryData[];
  imagesDispatch: React.Dispatch<ActionType>;
}): JSX.Element {
  const { classes } = useStyles();
  const { numberOfDeactivatedImages, gallery, imagesDispatch } = props;
  const [galleryLength, setGalleryLength] = useState(gallery.length);
  const [activeStep, setActiveStep] = useState(0);
  const [initialRender, setInitialRender] = useState(true);

  const swipeHandlers = useSwipe({
    onSwipedLeft: () =>
      onForwardIndex(gallery as any[], activeStep, setActiveStep),
    onSwipedRight: () =>
      onBackwardIndex(gallery as any[], activeStep, setActiveStep),
  });

  useEffect(() => {
    async function onGalleryChange() {
      setGalleryLength(props.gallery.length);
    }

    if (initialRender) {
      setInitialRender(false);
      return;
    }
    void onGalleryChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.gallery]);

  function addNewImages(event: React.ChangeEvent<HTMLInputElement>) {
    imagesDispatch({
      type: "addNewGalleryImages",
      data: event.currentTarget.files,
    });
  }

  function markImageAsConcealed() {
    const imageId = gallery[activeStep].id;

    if (imageId === undefined) return;

    imagesDispatch({
      type: "setGalleryImageAsConcealed",
      data: imageId,
    });
  }

  function deleteNewImage() {
    const activeGalleryLength = gallery.filter(
      (i) => i.state === "active"
    ).length;

    imagesDispatch({
      type: "deleteNewGalleryImage",
      data: activeStep - activeGalleryLength,
    });
  }

  const onClickRemoveButton =
    gallery[activeStep].state === "active"
      ? markImageAsConcealed
      : deleteNewImage;

  const removeButton = galleryLength - 1 !== activeStep && (
    <Grid item className={classes.removeImagecontainer}>
      <IconButton
        onClick={onClickRemoveButton}
        className={classes.removeImageButton}
      >
        <RemoveCircleIcon color="error" fontSize="large" />
      </IconButton>
    </Grid>
  );

  const imagesContainer = (
    <Grid container className={classes.imagesContainer}>
      {galleryLength - 1 !== activeStep ? (
        gallery.map((item, index) => (
          <CardMedia
            key={index}
            className={`${swipeImage.animate}`}
            style={{ transform: `translate(-${activeStep * 100}%)` }}
            component="img"
            alt={i18next.t("image.missing")}
            image={item.preview}
            {...swipeHandlers}
          />
        ))
      ) : (
        <Grid item className={classes.inputImager} {...swipeHandlers}>
          <CustomInputImage
            image={undefined}
            onImagesChange={addNewImages}
            isAddPhoto={true}
            error={undefined}
            multipleUpload={true}
          />
        </Grid>
      )}
    </Grid>
  );

  return (
    <Stack direction="column" className={classes.stack}>
      <Grid container className={classes.gallerySectionWrapper}>
        {removeButton}
        <Grid item className={classes.galleryPosition}>
          {imagesContainer}
        </Grid>
      </Grid>
      <Stepper
        activeStep={activeStep}
        setActiveStep={setActiveStep}
        length={galleryLength}
      />
      {numberOfDeactivatedImages > 0 && (
        <Typography
          key={numberOfDeactivatedImages}
          variant="body2"
          noWrap={true}
          fontWeight="bold"
          className={`${classes.deactivatedImagesInfo} ${zoomInZoomOut.animate}`}
        >
          {`*( ${numberOfDeactivatedImages} ) ${i18next
            .t("form.warning.gallery.deactivatedInfo")
            .toLocaleUpperCase()}`}
        </Typography>
      )}
    </Stack>
  );
}
