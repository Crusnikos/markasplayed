import React, { useEffect } from "react";
import { makeStyles } from "tss-react/mui";
import { Card, CardHeader, CardMedia, Grid } from "@mui/material";
import { ImageData } from "../../api/files";
import Stepper from "../../components/Stepper";
import i18next from "i18next";
import useSwipe from "../../hooks/useSwipe";
import { onBackwardIndex, onForwardIndex } from "../../utils/swipe";
import swipeImage from "../../assets/swipeImage.module.css";

const useStyles = makeStyles()((theme) => ({
  info: {
    color: theme.palette.common.white,
    backgroundColor: theme.palette.primary.light,
    textShadow: "5px 5px 10px rgba(66, 68, 90, 1)",
  },
  image: {
    minWidth: "100%",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  imagesContainer: {
    display: "flex",
    flexWrap: "nowrap",
    overflow: "hidden",
  },
}));

export default function Gallery(props: {
  gallery: ImageData[] | undefined;
  step?: boolean;
}): JSX.Element {
  const { classes } = useStyles();
  const { gallery } = props;
  const [activeStep, setActiveStep] = React.useState(0);

  const swipeHandlers = useSwipe({
    onSwipedLeft: () =>
      onForwardIndex(gallery as any[], activeStep, setActiveStep),
    onSwipedRight: () =>
      onBackwardIndex(gallery as any[], activeStep, setActiveStep),
  });

  useEffect(() => {
    if (props.step === true) {
      setActiveStep(0);
    }
  }, [props.step]);

  if (gallery === undefined || gallery.length === 0) {
    return <React.Fragment></React.Fragment>;
  }

  return (
    <Card>
      <CardHeader
        title={i18next.t("details.title.gallery")}
        className={classes.info}
      />
      <Grid className={classes.imagesContainer}>
        {gallery.map((item, index) => (
          <CardMedia
            key={index}
            className={`${classes.image} ${swipeImage.animate}`}
            style={{ transform: `translate(-${activeStep * 100}%)` }}
            component="img"
            alt={i18next.t("image.missing")}
            image={item.imagePathName}
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
