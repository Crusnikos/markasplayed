import { CircularProgress, Stack, Typography } from "@mui/material";
import { makeStyles } from "tss-react/mui";
import React from "react";

const useStyles = makeStyles()((theme) => ({
  container: {
    marginTop: theme.spacing(4),
    minHeight: "300px",
  },
}));

export default function LoadingIndicator(props: {
  message?: string;
}): JSX.Element {
  const { classes } = useStyles();

  return (
    <Stack
      className={classes.container}
      direction="column"
      alignItems="center"
      spacing={2}
    >
      <CircularProgress />
      <Typography variant="h5">
        {props.message ?? "Proszę czekać, trwa pobieranie danych..."}
      </Typography>
    </Stack>
  );
}
