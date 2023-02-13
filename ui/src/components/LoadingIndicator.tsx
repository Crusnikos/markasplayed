import { CircularProgress, Grid, Typography } from "@mui/material";
import { makeStyles } from "tss-react/mui";
import React, { useEffect, useState } from "react";
import i18next from "i18next";

const useStyles = makeStyles()((theme) => ({
  container: {
    marginTop: theme.spacing(3),
    minHeight: "35vh",
  },
  progressInfo: {
    color: theme.palette.error.main,
  },
}));

export default function LoadingIndicator(props: {
  message?: string;
  currentProgressInfo?: string;
}): JSX.Element {
  const { classes } = useStyles();
  const { message, currentProgressInfo } = props;
  const [progressInfo, setProgressInfo] = useState<string[]>([]);

  const textOpacity: Array<number> = [0.2, 0.5, 1];

  useEffect(() => {
    if (currentProgressInfo === undefined) {
      setProgressInfo([]);
      return;
    }
    setProgressInfo((progress) => [...progress, currentProgressInfo]);
  }, [currentProgressInfo]);

  const progressComponent = progressInfo && (
    <Grid item container direction="column" alignItems="flex-end">
      {progressInfo
        .filter(function (item) {
          if (progressInfo.indexOf(item) < progressInfo.length - 3) {
            return false;
          }
          return true;
        })
        .map((item, index) => (
          <Typography
            key={item}
            variant="subtitle2"
            className={classes.progressInfo}
            sx={{ opacity: textOpacity[index] }}
          >
            {progressInfo.length - 1 === progressInfo.indexOf(item)
              ? `${i18next.t("loading.prefix.inprogress")}: ${item}`
              : `${i18next.t("loading.prefix.done")}: ${item}`}
          </Typography>
        ))}
    </Grid>
  );

  return (
    <Grid
      container
      className={classes.container}
      direction="column"
      alignItems="stretch"
      justifyContent="space-between"
    >
      <Grid item container direction="column" alignItems="center">
        <Grid item>
          <CircularProgress size={50} />
        </Grid>
        <Grid item>
          <Typography variant="h5">{message ?? "Loading data..."}</Typography>
        </Grid>
      </Grid>
      {progressComponent}
    </Grid>
  );
}
