import { Box, Grid, IconButton, Step, Stepper } from "@mui/material";
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { makeStyles } from "tss-react/mui";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import { useNavigate } from "react-router-dom";
import { SliderData } from "../../api/files";
import i18next from "i18next";
import CustomDecoratedTag from "../../components/InformationTag";
import blurOnAppearAndDisappear from "../../assets/blurOnAppearAndDisappear.module.css";
import useSwipe from "../../hooks/useSwipe";
import {
  onBackwardIndexWithLoop,
  onForwardIndexWithLoop,
} from "../../utils/swipe";
import {
  addCookie,
  deleteCookie,
  getCookieValue,
} from "../../utils/cookiesHelper";

const useStyles = makeStyles()((theme) => ({
  mobileComponentHeight: {
    minHeight: "200px",
    height: "24vh",
    maxHeight: "250px",
  },
  desktopComponentHeight: {
    minHeight: "200px",
    height: "34vh",
    maxHeight: "340px",
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
  const isPausedCookieValue =
    getCookieValue({ name: "sliderPaused" })?.toLowerCase?.() === "true";

  const [index, setIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(isPausedCookieValue);
  const height = desktopScreen
    ? classes.desktopComponentHeight
    : classes.mobileComponentHeight;

  const prevIsPaused = useRef();

  useEffect(() => {
    if (prevIsPaused.current !== isPaused) {
      if (isPaused === true) {
        addCookie({ name: "sliderPaused", value: "true" });
      } else {
        deleteCookie({ name: "sliderPaused" });
      }
    }

    if (!isPaused) {
      const intervalId = setInterval(() => {
        // displays the last 5 articles
        onForwardIndexWithLoop(images as any[], index, setIndex);
      }, 5000);

      return () => clearInterval(intervalId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, isPaused, images]);

  return (
    <Grid container className={`${classes.sliderSection} ${height}`}>
      {images && !isPaused && (
        <ActiveSlider
          index={index}
          isPaused={isPaused}
          height={height}
          images={images}
          desktopScreen={desktopScreen}
          setIndex={setIndex}
          setIsPaused={setIsPaused}
          setLoading={props.setLoading}
        />
      )}
      {(!images || (images && isPaused)) && (
        <PausedSlider
          isPaused={isPaused}
          height={height}
          desktopScreen={desktopScreen}
          setIsPaused={setIsPaused}
        />
      )}
    </Grid>
  );
}

function ActiveSlider(props: {
  index: number;
  isPaused: boolean;
  height: string;
  images: SliderData[];
  desktopScreen: boolean;
  setIndex: Dispatch<SetStateAction<number>>;
  setIsPaused: Dispatch<SetStateAction<boolean>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
}): JSX.Element {
  const {
    index,
    isPaused,
    height,
    images,
    desktopScreen,
    setIndex,
    setIsPaused,
    setLoading,
  } = props;
  const { classes } = useStyles();

  const navigate = useNavigate();

  const swipeHandlers = useSwipe({
    onSwipedLeft: () =>
      onForwardIndexWithLoop(images as any[], index, setIndex),
    onSwipedRight: () =>
      onBackwardIndexWithLoop(images as any[], index, setIndex),
  });

  const handleRedirect = () => {
    setLoading(true);
    images && navigate(`article/${images[index].id}`);
    return;
  };

  return (
    <React.Fragment>
      <Grid item className={classes.sliderSectionImage}>
        <Box
          key={index}
          component="img"
          className={`${classes.image} ${height} ${blurOnAppearAndDisappear.animate}`}
          src={`${images[index].imagePathName}?${Date.now()}`}
          alt={i18next.t("image.missing")}
          onClick={handleRedirect}
          {...swipeHandlers}
        />
      </Grid>
      <CustomDecoratedTag text={`${images[index].articleTitle}`} />
      <Grid
        container
        item
        direction="row"
        alignItems="center"
        className={classes.sliderSectionBottom}
      >
        <Grid item>
          <Stepper>
            {images.map((image, i) => (
              <Step key={image.id}>
                {index === i ? (
                  <React.Fragment>
                    <IconButton
                      size="large"
                      onClick={() => setIndex(i)}
                      className={classes.inactiveSlideButton}
                      disabled={true}
                    />
                  </React.Fragment>
                ) : (
                  <IconButton
                    size="large"
                    onClick={() => setIndex(i)}
                    className={classes.activeSlideButton}
                  />
                )}
              </Step>
            ))}
          </Stepper>
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
    </React.Fragment>
  );
}

function PausedSlider(props: {
  isPaused: boolean;
  height: string;
  desktopScreen: boolean;
  setIsPaused: Dispatch<SetStateAction<boolean>>;
}): JSX.Element {
  const { isPaused, height, desktopScreen, setIsPaused } = props;
  const { classes } = useStyles();

  return (
    <React.Fragment>
      <Grid item className={classes.sliderSectionImage}>
        <Box
          component="img"
          className={`${classes.image} ${height}`}
          src={`/logo.jpg`}
          alt={i18next.t("image.missing")}
        />
      </Grid>
      <Grid item className={classes.sliderSectionOverlayImage}>
        <Box
          component="img"
          className={`${classes.overlayImage} ${height}`}
          src={`/logo overlay.png`}
          alt={i18next.t("image.missing")}
        />
      </Grid>
      <Grid
        container
        item
        direction="row"
        alignItems="center"
        className={classes.sliderSectionBottom}
      >
        <Grid item></Grid>
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
    </React.Fragment>
  );
}
