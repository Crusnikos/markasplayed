import { Box, Grid, Typography } from "@mui/material";
import React from "react";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()((theme) => ({
  footer: {
    backgroundColor: theme.palette.primary.main,
    padding: "16px",
    width: "1200px",
    [theme.breakpoints.down("lg")]: {
      width: "100vw",
    },
  },
  text: { color: theme.palette.common.white },
  link: { textDecoration: "none", color: theme.palette.info.light },
}));

export default function Footer(): JSX.Element {
  const { classes } = useStyles();
  const url = "https://icons8.com/";

  return (
    <Grid className={classes.footer}>
      <Typography className={classes.text}>
        Icons downloaded from{" "}
        <a href="https://icons8.com/" className={classes.link}>
          {url}
        </a>
      </Typography>
      <Box sx={{ flexGrow: 1 }} />
      <Typography className={classes.text}>
        Site created by Michał Kubrak, michalkubrak.90@gmail.com
      </Typography>
    </Grid>
  );
}
