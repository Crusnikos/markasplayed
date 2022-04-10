import React, { useEffect, useState } from "react";
import {
  Card,
  CardActionArea,
  CardHeader,
  CardMedia,
  CircularProgress,
  Grid,
  Typography,
} from "@mui/material";
import { makeStyles } from "tss-react/mui";
import {
  whiteIconSelector,
  colorIconSelector,
} from "./components/platformIconSelector";
import { useNavigate } from "react-router-dom";
import AnnouncementIcon from "@mui/icons-material/Announcement";
import { ArticleImageData, getFrontImage } from "./api/apiGallery";
import { DashboardArticleData } from "./api/apiArticle";
import formatedDateDisplay from "./components/formatedDateDisplay";

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
  genre: {
    background: `linear-gradient(90deg, ${theme.palette.warning.dark} 50%, rgba(1,36,0,0) 100%)`,
    color: theme.palette.common.white,
    padding: "5px 5px 5px 15px",
    width: "130px",
    borderRadius: "10px",
    top: 10,
    left: 10,
  },
}));

export default function ArticleDashboardItem(props: {
  data: DashboardArticleData;
}): JSX.Element {
  const { classes } = useStyles();
  const { data } = props;
  const [frontImage, setFrontImage] = useState<ArticleImageData | undefined>(
    undefined
  );
  const platform = whiteIconSelector(data.playedOn);
  const navigate = useNavigate();

  const handleRedirect = () => {
    navigate(`article/${data.id}`);
    return;
  };

  useEffect(() => {
    async function fetchFrontImage() {
      const image = await getFrontImage({ id: data.id, small: true });
      setFrontImage(image);
    }

    void fetchFrontImage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card className={classes.article}>
      <CardActionArea onClick={handleRedirect}>
        <Grid container>
          {frontImage ? (
            <Grid item sm={4}>
              <CardMedia
                className={classes.image}
                component="img"
                alt="game front picture"
                image={`${frontImage.imageSrc}?${Date.now()}`}
              />
              <Typography
                variant="h6"
                position="absolute"
                className={classes.genre}
              >
                {data.genre.name}
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
                      alt="platform"
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
                {formatedDateDisplay(data.createdAt)}
              </Typography>
            </Grid>
            <Grid item sm={12}>
              <Typography className={classes.text} variant="body2">
                {data.shortDescription}
              </Typography>
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
                <Typography variant="body2">dostępne na:</Typography>
              )}
              {data.availableOn.map((icon) => (
                <CardMedia
                  key={icon.id}
                  className={classes.gamingPlatformMinis}
                  component="img"
                  alt="platform available"
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
