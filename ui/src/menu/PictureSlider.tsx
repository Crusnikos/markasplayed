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
    height: "30vh",
    display: "inline-block",
    objectFit: "cover",
    transition: "1s",
    objectPosition: "60% 40%",
    cursor: "pointer",
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
  sliderSectionButton: {
    margin: theme.spacing(2),
    gridRowStart: 1,
    gridColumnStart: 1,
    zIndex: 2,
    justifySelf: "end",
    alignSelf: "end",
  },
  sliderSectionImage: {
    gridRowStart: 1,
    gridColumnStart: 1,
    zIndex: 1,
  },
}));

export function PictureSlider(props: {
  images: ImageData[];
  setLoading: Dispatch<SetStateAction<boolean>>;
}): JSX.Element {
  const { classes } = useStyles();
  const { images } = props;

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [pause, setPause] = useState(false);

  const navigate = useNavigate();
  const handleRedirect = () => {
    props.setLoading(true);
    navigate(`article/${images[currentIndex].id}`);
    return;
  };

  useEffect(() => {
    if (!pause) {
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
  }, [currentIndex, pause]);

  return (
    <Grid container className={classes.sliderSection}>
      <Grid item className={classes.sliderSectionImage}>
        <Box
          key={currentIndex}
          component="img"
          className={classes.image}
          src={`${images[currentIndex].imagePathName}?${Date.now()}`}
          alt={i18next.t("image.missing")}
          onClick={handleRedirect}
        />
      </Grid>
      <Grid item className={classes.sliderSectionButton}>
        <IconButton
          aria-label="play/pause"
          onClick={() => setPause(!pause)}
          className={classes.playPauseButton}
        >
          {pause ? <PlayArrowIcon /> : <PauseIcon />}
        </IconButton>
      </Grid>
    </Grid>
  );
}

export function DefaultPicture(): JSX.Element {
  const { classes } = useStyles();

  return (
    <Box
      component="img"
      className={classes.image}
      src={`/logo.jpg`}
      alt={i18next.t("image.missing")}
    />
  );
}
