import React, { useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Grid,
  Typography,
} from "@mui/material";
import { makeStyles } from "tss-react/mui";
import IconSelector from "../IconSelector";
import { LookupData } from "../api/lookup";
import i18next from "i18next";
import IconGrouping from "../IconGrouping";

const useStyles = makeStyles()((theme) => ({
  platformIcons: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    marginLeft: theme.spacing(1),
  },
  infoBox: {
    color: theme.palette.common.white,
    backgroundColor: theme.palette.primary.light,
    width: "100%",
  },
  infoBoxItem: {
    padding: theme.spacing(1),
  },
  divider: {
    borderColor: theme.palette.secondary.light,
    borderWidth: theme.spacing(0.2),
    marginBottom: theme.spacing(1),
  },
  groupedPlatformsBox: {
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
}));

export default function ArticleDetailsReviewPanel(props: {
  playTime: number;
  playedOn: LookupData;
  availableOn: LookupData[];
}): JSX.Element {
  const { classes } = useStyles();
  const { playTime, playedOn, availableOn } = props;
  const groupedPlatformIcons = useMemo(
    () => IconGrouping(availableOn, true),
    [availableOn]
  );
  const playedOnName = useMemo(
    () =>
      playedOn.groupName !== "A" &&
      "(" +
        playedOn.name.substring(
          playedOn.name.indexOf("(") + 1,
          playedOn.name.indexOf(")")
        ) +
        ")",
    [playedOn]
  );

  return (
    <Card className={classes.infoBox}>
      <CardContent>
        <Grid container direction="row">
          <Grid
            container
            item
            direction="column"
            alignItems="center"
            lg={2}
            md={6}
            className={classes.infoBoxItem}
          >
            <Typography variant="h6">
              {i18next.t("details.reviewPanel.gameTime")}
            </Typography>
            <Divider className={classes.divider} flexItem />
            <Typography variant="h6">
              {playTime} {i18next.t("details.reviewPanel.hours")}
            </Typography>
          </Grid>
          <Grid
            container
            item
            direction="column"
            alignItems="center"
            lg={2}
            md={6}
            className={classes.infoBoxItem}
          >
            <Typography variant="h6">
              {i18next.t("details.reviewPanel.playedOn")}
            </Typography>
            <Divider className={classes.divider} flexItem />
            <Grid item display="flex">
              <CardMedia
                className={classes.platformIcons}
                component="img"
                alt={i18next.t("image.missing")}
                image={IconSelector(playedOn.groupName, "white")}
              />
              <Typography>{playedOnName}</Typography>
            </Grid>
          </Grid>
          <Grid
            container
            item
            direction="column"
            alignItems="center"
            lg={8}
            md={12}
            className={classes.infoBoxItem}
          >
            <Typography variant="h6">
              {i18next.t("details.reviewPanel.availableOn")}
            </Typography>
            <Divider className={classes.divider} flexItem />
            <Grid
              container
              item
              direction="row"
              justifyContent="center"
              spacing={1}
            >
              {groupedPlatformIcons.map((platform) => (
                <Grid
                  item
                  key={platform.groupName}
                  display="flex"
                  overflow="hidden"
                >
                  <CardMedia
                    className={classes.platformIcons}
                    component="img"
                    alt={i18next.t("image.missing")}
                    image={IconSelector(platform.groupName, "white")}
                  />
                  <Box component="div" className={classes.groupedPlatformsBox}>
                    <Typography noWrap>{platform.groupedPlatforms}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
