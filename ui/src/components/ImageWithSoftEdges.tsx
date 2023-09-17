import { Box, Grid } from "@mui/material";
import React from "react";
import { makeStyles } from "tss-react/mui";
import i18next from "i18next";
import NoPhotographyIcon from "@mui/icons-material/NoPhotography";

const useStyles = makeStyles()((theme) => ({
  imageDivider: {
    aspectRatio: "16/9",
    margin: "auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  randomImage: {
    maxHeight: "100%",
    objectFit: "cover",
  },
  block: {
    width: "100%",
    position: "absolute",
    bottom: "0px",
    top: "0px",
    boxShadow: `inset 0px 0px 10px 15px ${theme.palette.background.paper}`,
  },
}));

export default function ImageWithSoftEdges(props: {
  imageUrl: string | undefined;
  maxHeight: string;
}): JSX.Element {
  const { classes } = useStyles();
  const { imageUrl, maxHeight } = props;

  return (
    <Grid className={classes.imageDivider} style={{ maxHeight: maxHeight }}>
      {imageUrl ? (
        <React.Fragment>
          <Box
            component="img"
            src={imageUrl}
            alt={i18next.t("image.missing")}
            className={classes.randomImage}
          />
          <Grid className={classes.block}></Grid>
        </React.Fragment>
      ) : (
        <NoPhotographyIcon fontSize="large" />
      )}
    </Grid>
  );
}
