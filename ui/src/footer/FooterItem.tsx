import React from "react";
import { Box, Grid, Typography } from "@mui/material";
import i18next from "i18next";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()((theme) => ({
  icon: {
    width: theme.spacing(4),
    marginRight: theme.spacing(1),
  },
  socialIcon: {
    width: theme.spacing(6),
    marginRight: theme.spacing(1),
  },
  text: {
    marginRight: theme.spacing(1),
  },
  link: {
    textDecoration: "none",
    color: "#ffb3b3",
    transition: "1s",
    "&:hover": {
      color: theme.palette.common.white,
    },
  },
  item: {
    display: "inline-block",
  },
}));

export function FooterItem(props: { icon: string; link: string }): JSX.Element {
  const { classes } = useStyles();
  const { icon, link } = props;

  return (
    <a href={link} target="_blank" rel="noreferrer">
      <Box
        component="img"
        className={classes.socialIcon}
        src={`${window.location.protocol}//${window.location.host}/${icon}`}
        alt={i18next.t("image.missing")}
      />
    </a>
  );
}

export function FooterItemWithText(props: {
  icon: string;
  text: string;
  link: string;
}): JSX.Element {
  const { classes } = useStyles();
  const { icon, text, link } = props;

  return (
    <Grid container item direction="row" alignItems="center" wrap="nowrap">
      <Box
        component="img"
        className={classes.icon}
        src={`${window.location.protocol}//${window.location.host}/${icon}`}
        alt={i18next.t("image.missing")}
      />
      <Typography
        variant="subtitle2"
        overflow="hidden"
        className={classes.text}
      >
        {i18next.t(text)}
        <a
          href={link}
          className={classes.link}
          target="_blank"
          rel="noreferrer"
        >
          {link}
        </a>
      </Typography>
    </Grid>
  );
}
