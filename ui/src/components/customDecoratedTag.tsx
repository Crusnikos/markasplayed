import React from "react";
import { Grid, Typography, useMediaQuery, useTheme } from "@mui/material";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()((theme) => ({
  tag: {
    display: "inline-grid",
    gridRowStart: 1,
    gridColumnStart: 1,
    zIndex: 2,
  },
  background: {
    margin: theme.spacing(1.5),
    background: `linear-gradient(90deg, ${theme.palette.primary.main} 8px, rgba(0, 0, 0, 0.4) 0%)`,
    boxShadow: "5px 5px 4px 0px rgba(0, 0, 0, 1)",
    color: theme.palette.common.white,
    borderRadius: `0px ${theme.spacing(1)} ${theme.spacing(1)} 0px`,
    alignSelf: "start",
    pointerEvents: "none",
  },
  text: {
    maxWidth: "90vw",
    padding: theme.spacing(0.5),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    color: theme.palette.common.white,
    textShadow: "0px 0px 60px #000000",
    fontWeight: "bolder",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
}));

export default function CustomDecoratedTag(props: {
  text: string;
}): JSX.Element {
  const { classes } = useStyles();
  const { text } = props;

  const theme = useTheme();
  const desktopScreen = useMediaQuery(theme.breakpoints.up("sm"));

  return (
    <Grid item className={classes.tag}>
      <Grid item className={classes.background}>
        <Typography
          variant={desktopScreen ? "body1" : "subtitle2"}
          className={classes.text}
          textAlign="center"
        >
          {text.toUpperCase()}
        </Typography>
      </Grid>
    </Grid>
  );
}
