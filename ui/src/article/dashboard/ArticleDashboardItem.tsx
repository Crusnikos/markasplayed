import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardActionArea,
  CardHeader,
  CardMedia,
  CircularProgress,
  Grid,
  Typography,
} from "@mui/material";
import { makeStyles } from "tss-react/mui";
import { useNavigate } from "react-router-dom";
import AnnouncementIcon from "@mui/icons-material/Announcement";
import { DashboardArticleData } from "../api/article";
import { getFrontImage, ImageData } from "../api/files";
import { colorIconSelector, whiteIconSelector } from "../platformIconSelector";
import i18next from "i18next";

const useStyles = makeStyles()((theme) => ({
  article: {
    marginTop: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  text: {
    padding: "16px 26px 16px 16px",
  },
  image: {
    minHeight: "270px",
    height: "100%",
    display: "inline-block",
    objectFit: "cover",
    objectPosition: "60% 40%",
  },
  loading: {
    minHeight: "270px",
  },
  header: {
    background: `linear-gradient(90deg, ${theme.palette.primary.main} 50%, rgba(1,36,0,0) 100%)`,
    color: theme.palette.common.white,
  },
  subheader: {
    color: theme.palette.common.white,
  },
  date: {
    padding: "16px 26px 0px 16px",
  },
  gamingPlatformMinis: {
    height: "32px",
    width: "32px",
  },
  announcementIcon: {
    fontSize: "64px",
  },
  footer: {
    padding: "16px 26px 16px 16px",
  },
  articleType: {
    background: `linear-gradient(90deg, ${theme.palette.warning.dark} 50%, rgba(1,36,0,0) 100%)`,
    color: theme.palette.common.white,
    padding: "5px 5px 5px 15px",
    width: "130px",
    borderRadius: "10px",
    top: 10,
    left: 10,
  },
  textBox: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    width: "98%",
  },
}));

export default function ArticleDashboardItem(props: {
  data: DashboardArticleData;
}): JSX.Element {
  const { classes } = useStyles();
  const { data } = props;
  const [frontImage, setFrontImage] = useState<ImageData | undefined>(
    undefined
  );
  const platform = whiteIconSelector(data.playedOn);
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`article/${data.id}`);
    return;
  };

  useEffect(() => {
    async function fetchFrontImage() {
      try {
        const image = await getFrontImage({ id: data.id, small: true });
        setFrontImage(image);
      } catch (error) {
        setFrontImage(undefined);
      }
    }

    void fetchFrontImage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card className={classes.article}>
      <CardActionArea onClick={handleClick}>
        <Grid container>
          {frontImage ? (
            <Grid item sm={4}>
              <CardMedia
                className={classes.image}
                component="img"
                alt={i18next.t("image.missing")}
                image={`${frontImage.imagePathName}?${Date.now()}`}
              />
              <Typography
                variant="h6"
                position="absolute"
                className={classes.articleType}
              >
                {data.articleType.name}
              </Typography>
            </Grid>
          ) : (
            <Grid
              item
              container
              sm={4}
              justifyContent="center"
              alignItems="center"
              className={classes.loading}
            >
              <CircularProgress />
            </Grid>
          )}
          <Grid container item sm={8}>
            <Grid container item lg={8} className={classes.header}>
              <CardHeader
                avatar={
                  data.playedOn.id !== null ? (
                    <CardMedia
                      component="img"
                      image={platform}
                      alt={i18next.t("image.missing")}
                      height="64"
                    />
                  ) : (
                    <AnnouncementIcon className={classes.announcementIcon} />
                  )
                }
                title={data.title}
                subheader={
                  <Typography color={classes.subheader}>
                    {data.producer}
                  </Typography>
                }
              />
            </Grid>
            <Grid item lg={4}>
              <Typography
                variant="subtitle1"
                align="right"
                className={classes.date}
              >
                {new Date(data.createdAt).toLocaleDateString()}
              </Typography>
            </Grid>
            <Grid item sm={12}>
              <Box component="div" className={classes.textBox}>
                <Typography className={classes.text} variant="body2">
                  {data.shortDescription}
                </Typography>
              </Box>
            </Grid>
            <Grid
              item
              container
              sm={12}
              justifyContent="flex-end"
              alignItems="center"
              className={classes.footer}
            >
              {data.availableOn.length > 0 && (
                <Typography variant="body2">
                  {i18next.t("dashboard.item.availableOn")}
                </Typography>
              )}
              {data.availableOn.map((icon) => (
                <CardMedia
                  key={icon.id}
                  className={classes.gamingPlatformMinis}
                  component="img"
                  alt={i18next.t("image.missing")}
                  image={colorIconSelector(icon)}
                />
              ))}
            </Grid>
          </Grid>
        </Grid>
      </CardActionArea>
    </Card>
  );
}
