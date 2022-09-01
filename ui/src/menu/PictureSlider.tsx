import { Box, Grid, IconButton } from "@mui/material";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { makeStyles } from "tss-react/mui";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import { useNavigate } from "react-router-dom";
import { ImageData } from "../article/api/files";
import i18next from "i18next";

const useStyles = makeStyles()((theme) => ({
  image: {
    width: "100%",
    height: "35vh",
    display: "inline-block",
    objectFit: "cover",
    transition: "1s",
    objectPosition: "50% 50%",
    cursor: "pointer",
  },
  imageAnimation: {
    animation: "fadeIn 5s",
    "@keyframes fadeIn": {
      "0%": {
        opacity: 0,
        visibility: "hidden",
      },
      "100%": {
        opacity: 1,
        visibility: "visible",
      },
    },
  },
  overlayImage: {
    maxWidth: "100%",
    maxHeight: "35vh",
  },
  playPauseButton: {
    backgroundColor: theme.palette.common.white,
    height: theme.spacing(5),
    width: theme.spacing(5),
    "&:hover": {
      backgroundColor: theme.palette.warning.main,
    },
  },
  sliderSection: {
    display: "grid",
  },
  sliderSectionImage: {
    gridRowStart: 1,
    gridColumnStart: 1,
    zIndex: 1,
  },
  sliderSectionButton: {
    margin: theme.spacing(2),
    gridRowStart: 1,
    gridColumnStart: 1,
    zIndex: 2,
    justifySelf: "end",
    alignSelf: "end",
  },
  sliderSectionOverlayImage: {
    gridRowStart: 1,
    gridColumnStart: 1,
    zIndex: 2,
  },
}));

export function PictureSlider(props: {
  images: ImageData[] | undefined;
  setLoading: Dispatch<SetStateAction<boolean>>;
}): JSX.Element {
  const { classes } = useStyles();
  const { images } = props;

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState(false);

  const navigate = useNavigate();
  const handleRedirect = () => {
    props.setLoading(true);
    images && navigate(`article/${images[currentIndex].id}`);
    return;
  };

  useEffect(() => {
    if (!isPaused && images) {
      const intervalId = setInterval(() => {
        // displays the last 5 articles
        if (currentIndex + 1 === 5 || currentIndex + 1 === images.length) {
          setCurrentIndex(0);
        } else {
          setCurrentIndex(currentIndex + 1);
        }
      }, 5000);

      return () => clearInterval(intervalId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, isPaused, images]);

  return (
    <Grid container className={classes.sliderSection}>
      <Grid item className={classes.sliderSectionImage}>
        {images && !isPaused && (
          <Box
            key={currentIndex}
            component="img"
            className={`${classes.image} ${classes.imageAnimation}`}
            src={`${images[currentIndex].imagePathName}?${Date.now()}`}
            alt={i18next.t("image.missing")}
            onClick={handleRedirect}
          />
        )}
        {(!images || (images && isPaused)) && (
          <Box
            component="img"
            className={classes.image}
            src={`/logo.jpg`}
            alt={i18next.t("image.missing")}
          />
        )}
      </Grid>
      {(!images || (images && isPaused)) && (
        <Grid item className={classes.sliderSectionOverlayImage}>
          <Box
            component="img"
            className={classes.overlayImage}
            src={`/logo overlay.png`}
            alt={i18next.t("image.missing")}
          />
        </Grid>
      )}
      {images && (
        <Grid item className={classes.sliderSectionButton}>
          <IconButton
            aria-label="play/pause"
            onClick={() => setIsPaused(!isPaused)}
            className={classes.playPauseButton}
          >
            {isPaused ? <PlayArrowIcon /> : <PauseIcon />}
          </IconButton>
        </Grid>
      )}
    </Grid>
  );
}
