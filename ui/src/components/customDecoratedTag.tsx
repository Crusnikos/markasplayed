import React from "react";
import { Grid, Typography, useMediaQuery, useTheme } from "@mui/material";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()((theme) => ({
  background: {
    padding: theme.spacing(0.5),
    margin: theme.spacing(1.5),
    backgroundImage: `linear-gradient(45deg, ${theme.palette.warning.main} 0%, #ffb31a 51%, ${theme.palette.warning.main}  100%)`,
    borderRadius: theme.spacing(1),
    alignSelf: "start",
    boxShadow: "2px 4px 6px 4px rgba(63, 63, 68, 1)",
    gridRowStart: 1,
    gridColumnStart: 1,
    gridColumnEnd: 3,
    zIndex: 2,
    opacity: 0.8,
    pointerEvents: "none",
  },
  text: {
    color: theme.palette.common.white,
    fontWeight: "bolder",
    textShadow: "4px 4px 8px #000000",
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
    <Grid item className={classes.background}>
      <Typography
        variant={desktopScreen ? "body1" : "subtitle2"}
        className={classes.text}
        textAlign="center"
      >
        {text}
      </Typography>
    </Grid>
  );
}
