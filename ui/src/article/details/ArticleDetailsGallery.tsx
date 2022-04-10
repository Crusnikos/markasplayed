import React from "react";
import { makeStyles } from "tss-react/mui";
import { Card, CardHeader, CardMedia } from "@mui/material";
import { ArticleImageData } from "../api/apiGallery";
import CommonStepper from "../../components/CommonStepper";

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
  gallery: ArticleImageData[] | undefined;
}): JSX.Element {
  const { classes } = useStyles();
  const { gallery } = props;
  const [activeStep, setActiveStep] = React.useState(0);

  if (gallery === undefined || gallery.length === 0) {
    return <React.Fragment></React.Fragment>;
  }

  return (
    <Card className={classes.galleryBox}>
      <CardHeader title="Galeria" className={classes.info} />
      <CardMedia
        className={classes.image}
        component="img"
        alt={"Missing picture"}
        image={gallery[activeStep].imageSrc}
      />
      <CommonStepper
        activeStep={activeStep}
        setActiveStep={setActiveStep}
        length={gallery.length}
      />
    </Card>
  );
}
