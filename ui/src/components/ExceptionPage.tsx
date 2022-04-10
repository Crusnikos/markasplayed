import { Typography } from "@mui/material";
import { makeStyles } from "tss-react/mui";
import React from "react";

const useStyles = makeStyles()((theme) => ({
  exceptionSection: {
    marginLeft: theme.spacing(2),
    marginTop: theme.spacing(5),
    minHeight: "300px",
  },
}));

export default function ExceptionPage(props: { message: string }): JSX.Element {
  const { classes } = useStyles();

  return (
    <Typography variant="h4" className={classes.exceptionSection}>
      {props.message}
    </Typography>
  );
}
