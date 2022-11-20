import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
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
import IconSelector from "../IconSelector";
import i18next from "i18next";

const useStyles = makeStyles()((theme) => ({
  articleItem: {
    marginTop: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  imageSection: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 20% [col-start])",
    gridTemplateRows: "repeat(5, 20% [row-start])",
  },
  imageSectionTypeItem: {
    backgroundColor: theme.palette.warning.main,
    borderRadius: theme.spacing(1),
    boxShadow: "6px 6px 5px #222",
    margin: theme.spacing(1),
    minWidth: "100px",
    maxHeight: "40px",
    gridRowStart: 1,
    gridColumnStart: 1,
    zIndex: 2,
    opacity: 0.8,
  },
  imageSectionImageItem: {
    gridRowStart: 1,
    gridRowEnd: 6,
    gridColumnStart: 1,
    gridColumnEnd: 6,
    zIndex: 1,
  },
  shortDescription: {
    padding: theme.spacing(2),
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
    padding: theme.spacing(2),
  },
  gamingPlatformMinis: {
    height: theme.spacing(4),
    width: theme.spacing(4),
  },
  playedOnIcon: {
    filter: "drop-shadow(6px 6px 5px #222)",
  },
  announcementIcon: {
    fontSize: 64,
    filter: "drop-shadow(6px 6px 5px #222)",
  },
  footerIcons: {
    padding: theme.spacing(2),
  },
  articleType: {
    color: theme.palette.common.white,
    fontWeight: "bolder",
    textShadow: "4px 4px 8px #000000",
    padding: theme.spacing(0.5),
  },
  shortDescriptionTextBox: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    width: "98%",
  },
}));

export default function ArticleDashboardItem(props: {
  data: DashboardArticleData;
  setLoading: Dispatch<SetStateAction<boolean>>;
}): JSX.Element {
  const { classes } = useStyles();
  const { data } = props;
  const [frontImage, setFrontImage] = useState<ImageData | undefined>(
    undefined
  );
  const platform = IconSelector(data.playedOn.id, "white");
  const navigate = useNavigate();

  const handleClick = () => {
    props.setLoading(true);
    navigate(`article/${data.id}`);
    window.scrollTo(0, 0);
    return;
  };

  useEffect(() => {
    async function fetchFrontImage() {
      try {
        const image = await getFrontImage({ id: data.id, size: "Small" });
        setFrontImage(image);
      } catch (error) {
        setFrontImage(undefined);
      }
    }

    void fetchFrontImage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card className={classes.articleItem}>
      <CardActionArea onClick={handleClick}>
        <Grid container>
          {frontImage ? (
            <Grid
              item
              container
              lg={4}
              md={5}
              sm={12}
              className={classes.imageSection}
            >
              <Grid item className={classes.imageSectionTypeItem}>
                <Typography
                  variant="body2"
                  className={classes.articleType}
                  textAlign="center"
                >
                  {i18next
                    .t(`dashboard.item.type.${data.articleType.name}`)
                    .toLocaleUpperCase()}
                </Typography>
              </Grid>
              <Grid item className={classes.imageSectionImageItem}>
                <CardMedia
                  className={classes.image}
                  component="img"
                  alt={i18next.t("image.missing")}
                  image={`${frontImage.imagePathName}?${Date.now()}`}
                />
              </Grid>
            </Grid>
          ) : (
            <Grid
              item
              container
              lg={4}
              md={5}
              sm={12}
              justifyContent="center"
              alignItems="center"
              className={classes.loading}
            >
              <CircularProgress />
            </Grid>
          )}
          <Grid container item lg={8} md={7} sm={12}>
            <Grid container item lg={8} className={classes.header}>
              <CardHeader
                avatar={
                  data.playedOn.id !== null ? (
                    <CardMedia
                      component="img"
                      image={platform}
                      alt={i18next.t("image.missing")}
                      height="64"
                      className={classes.playedOnIcon}
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
              <Box component="div" className={classes.shortDescriptionTextBox}>
                <Typography
                  className={classes.shortDescription}
                  variant="body2"
                  textAlign="justify"
                >
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
              className={classes.footerIcons}
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
                  image={IconSelector(icon.id, "color")}
                />
              ))}
            </Grid>
          </Grid>
        </Grid>
      </CardActionArea>
    </Card>
  );
}
