import React from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Divider,
  Grid,
  Typography,
} from "@mui/material";
import { makeStyles } from "tss-react/mui";
import { whiteIconSelector } from "../platformIconSelector";
import { LookupData } from "../api/lookup";

const useStyles = makeStyles()((theme) => ({
  platformIcons: {
    width: "32px",
    height: "32px",
    marginRight: theme.spacing(2),
    marginLeft: theme.spacing(2),
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
    borderWidth: "2px",
    marginBottom: theme.spacing(1),
  },
}));

export default function ArticleDetailsReviewPanel(props: {
  playTime: number;
  playedOn: LookupData;
  availableOn: LookupData[];
}): JSX.Element {
  const { classes } = useStyles();
  const { playTime, playedOn, availableOn } = props;

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
            <Typography variant="h6">Czas gry</Typography>
            <Divider className={classes.divider} flexItem />
            <Typography variant="h6">{playTime} godzin</Typography>
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
            <Typography variant="h6">Grałem na</Typography>
            <Divider className={classes.divider} flexItem />
            <CardMedia
              className={classes.platformIcons}
              component="img"
              alt="played on"
              image={whiteIconSelector(playedOn)}
            />
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
            <Typography variant="h6">Dostępne na</Typography>
            <Divider className={classes.divider} flexItem />
            <Grid container item direction="row" justifyContent="center">
              {availableOn.map((platform) => (
                <CardMedia
                  key={platform.id}
                  className={classes.platformIcons}
                  component="img"
                  alt="played on"
                  image={whiteIconSelector(platform)}
                />
              ))}
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
