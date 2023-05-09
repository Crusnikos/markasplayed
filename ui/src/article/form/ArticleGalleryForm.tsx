import { CardMedia, Grid, IconButton, Stack, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { makeStyles } from "tss-react/mui";
import { ActionType, GalleryData } from "./imagesReducer";
import Stepper from "../../components/Stepper";
import i18next from "i18next";
import { CustomInputImage } from "./formUnitsTemplates";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import zoomInZoomOut from "../../animatedEffects/zoomInZoomOut.module.css";

const useStyles = makeStyles()((theme) => ({
  stack: {
    paddingTop: theme.spacing(1),
  },
  image: {
    height: "300px",
    [theme.breakpoints.down("lg")]: {
      height: "180px",
    },
  },
  deactivatedImagesInfo: {
    color: theme.palette.error.main,
    width: "80%",
  },
  galleryImageSection: {
    display: "grid",
  },
  galleryImageSectionButton: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1),
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
  removeCircleButton: {
    backgroundColor: theme.palette.common.white,
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

  const galleryImage = (
    <Grid container className={classes.galleryImageSection}>
      <Grid item className={classes.galleryImageSectionButton}>
        <IconButton
          onClick={onClickRemoveButton}
          className={classes.removeCircleButton}
        >
          <RemoveCircleIcon color="error" fontSize="large" />
        </IconButton>
      </Grid>
      <Grid item className={classes.galleryImageSectionImage}>
        <CardMedia
          className={classes.image}
          component="img"
          alt={i18next.t("image.missing")}
          image={gallery[activeStep].preview}
        />
      </Grid>
    </Grid>
  );

  return (
    <Stack direction="column" className={classes.stack}>
      {galleryLength - 1 !== activeStep ? (
        galleryImage
      ) : (
        <CustomInputImage
          image={undefined}
          onImagesChange={addNewImages}
          isAddPhoto={true}
          error={undefined}
          multipleUpload={true}
        />
      )}
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
