import React, { useEffect, useState } from "react";
import { Divider, Grid, Typography } from "@mui/material";
import i18next from "i18next";
import { makeStyles } from "tss-react/mui";
import { FooterItem, FooterItemWithText } from "./FooterItem";

const useStyles = makeStyles()((theme) => ({
  footer: {
    paddingBottom: theme.spacing(2),
    backgroundColor: theme.palette.primary.main,
  },
  footerContent: {
    color: theme.palette.common.white,
    margin: "auto",
    maxWidth: "1200px",
    padding: theme.spacing(1.5),
  },
  text: {
    fontSize: 14,
    marginBottom: theme.spacing(1.5),
    marginRight: theme.spacing(2),
  },
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    width: "100%",
    backgroundColor: theme.palette.common.white,
  },
}));

export default function Footer(): JSX.Element {
  const { classes } = useStyles();
  const [data, setData] = useState<
    [{ icon: string; link: string }] | undefined
  >(undefined);

  useEffect(() => {
    async function fetchLocalSocialLinks() {
      await fetch("data/socialLinks.json")
        .then((res) => res.json())
        .then((result) => {
          setData(result.data);
        });
    }

    void fetchLocalSocialLinks();
  }, []);

  function createAboutSection(): JSX.Element[] {
    const array = [];

    for (let i = 1; i < 4; i++) {
      array.push(
        <Typography className={classes.text} variant="body2" key={i}>
          {i18next.t(`footer.about.p${i}`)}
        </Typography>
      );
    }

    return array;
  }

  return (
    <footer className={classes.footer}>
      <Grid container className={classes.footerContent}>
        <Grid item lg={8} md={8}>
          <Typography variant="h6">
            {i18next.t("footer.header.about")}
          </Typography>
          {createAboutSection()}
        </Grid>
        <Grid item lg={4} md={4}>
          <Typography variant="h6">
            {i18next.t("footer.header.social")}
          </Typography>
          {data &&
            data.map((item) => (
              <FooterItem key={item.icon} icon={item.icon} link={item.link} />
            ))}
        </Grid>
        <Grid container item direction="row" alignItems="center">
          <Divider className={classes.divider} />
        </Grid>
        <Grid>
          <FooterItemWithText
            icon={i18next.t("footer.icons.icon")}
            text={i18next.t("footer.icons.text")}
            link={i18next.t("footer.icons.link")}
          />
        </Grid>
      </Grid>
    </footer>
  );
}
