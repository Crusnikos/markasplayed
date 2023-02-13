import { Box, Grid, IconButton, Step, Stepper } from "@mui/material";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { makeStyles } from "tss-react/mui";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import { useNavigate } from "react-router-dom";
import { SliderData } from "../article/api/files";
import i18next from "i18next";
import CustomDecoratedTag from "../components/customDecoratedTag";
import fadeIn from "../animatedEffects/fadeIn.module.css";

const useStyles = makeStyles()((theme) => ({
  mobileComponentHeight: {
    minHeight: "200px",
    height: "28vh",
  },
  desktopComponentHeight: {
    minHeight: "200px",
    height: "38vh",
  },
  image: {
    width: "100%",
    objectFit: "cover",
    transition: "2s",
    objectPosition: "50% 50%",
    cursor: "pointer",
  },
  overlayImage: {
    maxWidth: "100%",
  },
  playPauseButton: {
    backgroundColor: theme.palette.common.white,
    "&:hover": {
      backgroundColor: theme.palette.warning.main,
    },
  },
  inactiveSlideButton: {
    "&:disabled": {
      backgroundColor: theme.palette.error.main,
    },
  },
  activeSlideButton: {
    backgroundColor: theme.palette.common.white,
    "&:hover": {
      backgroundColor: theme.palette.warning.main,
    },
  },
  sliderSection: {
    display: "grid",
    gridTemplateColumns:
      "16% [col-start] 16% [col-start] repeat(2, 34% [col-start])",
    gridTemplateRows: "repeat(4, 25% [row-start])",
  },
  sliderSectionImage: {
    gridRowStart: 1,
    gridColumnStart: 1,
    gridRowEnd: 5,
    gridColumnEnd: 5,
    zIndex: 1,
  },
  sliderSectionBottom: {
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    alignSelf: "center",
    gridRowStart: 4,
    gridColumnStart: 1,
    gridColumnEnd: 5,
    zIndex: 2,
  },
  sliderSectionOverlayImage: {
    gridRowStart: 1,
    gridColumnStart: 1,
    gridRowEnd: 5,
    gridColumnEnd: 5,
    zIndex: 2,
  },
}));

export function PictureSlider(props: {
  images: SliderData[] | undefined;
  setLoading: Dispatch<SetStateAction<boolean>>;
  desktopScreen: boolean;
}): JSX.Element {
  const { classes } = useStyles();
  const { images, desktopScreen } = props;

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState(false);
  const height = desktopScreen
    ? classes.desktopComponentHeight
    : classes.mobileComponentHeight;

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
    <Grid container className={`${classes.sliderSection} ${height}`}>
      <Grid item className={classes.sliderSectionImage}>
        {images && !isPaused && (
          <Box
            key={currentIndex}
            component="img"
            className={`${classes.image} ${height} ${fadeIn.animate}`}
            src={`${images[currentIndex].imagePathName}?${Date.now()}`}
            alt={i18next.t("image.missing")}
            onClick={handleRedirect}
          />
        )}
        {(!images || (images && isPaused)) && (
          <Box
            component="img"
            className={`${classes.image} ${height}`}
            src={`/logo.jpg`}
            alt={i18next.t("image.missing")}
          />
        )}
      </Grid>
      {images && !isPaused && (
        <CustomDecoratedTag text={`${images[currentIndex].articleTitle}`} />
      )}
      {(!images || (images && isPaused)) && (
        <Grid item className={classes.sliderSectionOverlayImage}>
          <Box
            component="img"
            className={`${classes.overlayImage} ${height}`}
            src={`/logo overlay.png`}
            alt={i18next.t("image.missing")}
          />
        </Grid>
      )}
      {images && (
        <Grid
          container
          item
          direction="row"
          alignItems="center"
          className={classes.sliderSectionBottom}
        >
          <Grid item>
            {!isPaused && (
              <Stepper>
                {images.map((image, index) => (
                  <Step key={image.id}>
                    {currentIndex === index ? (
                      <React.Fragment>
                        <IconButton
                          size="large"
                          onClick={() => setCurrentIndex(index)}
                          className={classes.inactiveSlideButton}
                          disabled={true}
                        />
                      </React.Fragment>
                    ) : (
                      <IconButton
                        size="large"
                        onClick={() => setCurrentIndex(index)}
                        className={classes.activeSlideButton}
                      />
                    )}
                  </Step>
                ))}
              </Stepper>
            )}
          </Grid>
          <Box sx={{ flexGrow: 1 }} />
          <Grid item>
            <IconButton
              size={desktopScreen ? "medium" : "small"}
              aria-label="play/pause"
              onClick={() => setIsPaused(!isPaused)}
              className={classes.playPauseButton}
            >
              {isPaused ? <PlayArrowIcon /> : <PauseIcon />}
            </IconButton>
          </Grid>
        </Grid>
      )}
    </Grid>
  );
}
