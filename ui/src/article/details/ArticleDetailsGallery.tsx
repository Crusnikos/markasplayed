import React, { useEffect } from "react";
import { makeStyles } from "tss-react/mui";
import { Card, CardHeader, CardMedia } from "@mui/material";
import { ImageData } from "../api/files";
import Stepper from "../../components/Stepper";
import i18next from "i18next";

const useStyles = makeStyles()((theme) => ({
  info: {
    color: theme.palette.common.white,
    backgroundColor: theme.palette.primary.light,
  },
  image: {
    maxWidth: "100%",
  },
  galleryBox: {
    width: "100%",
  },
}));

export default function ArticleDetailsGallery(props: {
  gallery: ImageData[] | undefined;
  step?: boolean;
}): JSX.Element {
  const { classes } = useStyles();
  const { gallery } = props;
  const [activeStep, setActiveStep] = React.useState(0);

  useEffect(() => {
    if (props.step === true) {
      setActiveStep(0);
    }
  }, [props.step]);

  if (gallery === undefined || gallery.length === 0) {
    return <React.Fragment></React.Fragment>;
  }

  return (
    <Card className={classes.galleryBox}>
      <CardHeader
        title={i18next.t("details.title.gallery")}
        className={classes.info}
      />
      <CardMedia
        className={classes.image}
        component="img"
        alt={i18next.t("image.missing")}
        image={gallery[activeStep].imagePathName}
      />
      <Stepper
        activeStep={activeStep}
        setActiveStep={setActiveStep}
        length={gallery.length}
      />
    </Card>
  );
}
