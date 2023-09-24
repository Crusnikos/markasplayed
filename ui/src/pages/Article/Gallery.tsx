import React, { useEffect, useMemo } from "react";
import { makeStyles } from "tss-react/mui";
import {
  Box,
  Card,
  CardHeader,
  Grid,
  Typography,
  CircularProgress,
} from "@mui/material";
import { ImageData } from "../../api/files";
import Stepper from "../../components/Stepper";
import i18next from "i18next";
import useSwipe from "../../hooks/useSwipe";
import { onBackwardIndex, onForwardIndex } from "../../utils/swipe";
import swipeImage from "../../assets/swipeImage.module.css";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { useArticleData } from "../../context/ArticleListProvider";

const useStyles = makeStyles()((theme) => ({
  info: {
    color: theme.palette.common.white,
    backgroundColor: theme.palette.primary.light,
    textShadow: "5px 5px 10px rgba(66, 68, 90, 1)",
  },
  image: {
    maxHeight: "100%",
    objectFit: "cover",
  },
  imagesContainer: {
    aspectRatio: "16/9",
    display: "flex",
    flexWrap: "nowrap",
    overflow: "hidden",
    position: "relative",
  },
}));

export default function Gallery(props: {
  gallery: ImageData[] | undefined;
}): JSX.Element {
  const { classes } = useStyles();
  const { gallery } = props;
  const [activeStep, setActiveStep] = React.useState<number>(0);
  const [loadedImages, setLoadedImages] = React.useState<
    { id: number; loaded: boolean }[]
  >([]);
  const [, syncDate] = useArticleData();

  const swipeHandlers = useSwipe({
    onSwipedLeft: () =>
      onForwardIndex(gallery as any[], activeStep, setActiveStep),
    onSwipedRight: () =>
      onBackwardIndex(gallery as any[], activeStep, setActiveStep),
  });

  const Header = useMemo(
    () => (
      <Grid container alignItems="center">
        <Typography variant="h5">
          {i18next.t("details.title.gallery")}
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        {gallery !== undefined &&
          gallery.length > 0 &&
          loadedImages.length < gallery.length && (
            <CircularProgress color="inherit" />
          )}
      </Grid>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loadedImages]
  );

  useEffect(() => {
    setActiveStep(0);
  }, [syncDate]);

  if (gallery === undefined || gallery.length === 0) {
    return <React.Fragment></React.Fragment>;
  }

  return (
    <Card style={{ width: "100%" }}>
      <CardHeader title={Header} className={classes.info} />
      <Grid className={classes.imagesContainer}>
        {gallery.map((item, index) => (
          <LazyLoadImage
            key={index}
            src={item.imagePathName}
            alt={i18next.t("image.missing")}
            onLoad={() => {
              setLoadedImages((oldArray) => [
                ...oldArray,
                { id: item.id, loaded: true },
              ]);
            }}
            className={`${classes.image} ${swipeImage.animate}`}
            style={{
              transform: `translate(-${activeStep * 100}%)`,
            }}
            {...swipeHandlers}
          />
        ))}
      </Grid>
      <Stepper
        activeStep={activeStep}
        setActiveStep={setActiveStep}
        length={gallery.length}
      />
    </Card>
  );
}
