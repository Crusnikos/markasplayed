import React from "react";
import { Box, Typography } from "@mui/material";
import i18next from "i18next";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()((theme) => ({
  icon: {
    width: theme.spacing(2),
    marginRight: theme.spacing(1),
  },
  text: {
    color: theme.palette.common.white,
    fontSize: 18,
    marginRight: theme.spacing(1),
  },
  link: {
    textDecoration: "none",
    color: theme.palette.info.light,
  },
  item: {
    display: "inline-block",
  },
}));

export default function FooterItem(props: {
  icon: string;
  text: string;
  link: string;
}): JSX.Element {
  const { classes } = useStyles();
  const { icon, text, link } = props;

  return (
    <li className={classes.item}>
      <Typography className={classes.text} overflow="hidden">
        <Box
          component="img"
          className={classes.icon}
          src={icon}
          alt={i18next.t("image.missing")}
        />
        {i18next.t(text)}
        <a href={link} className={classes.link}>
          {link}
        </a>
      </Typography>
    </li>
  );
}
