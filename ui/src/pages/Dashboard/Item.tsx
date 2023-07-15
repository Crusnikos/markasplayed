import React, {
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Box,
  Card,
  CardActionArea,
  CardHeader,
  CardMedia,
  CircularProgress,
  Grid,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { makeStyles } from "tss-react/mui";
import { useNavigate } from "react-router-dom";
import AnnouncementIcon from "@mui/icons-material/Announcement";
import ArticleIcon from "@mui/icons-material/Article";
import { DashboardArticleData } from "../../api/article";
import { getFrontImage, ImageData } from "../../api/files";
import iconSelector from "../iconSelector";
import i18next from "i18next";
import InformationTag from "../../components/InformationTag";
import IconGrouping from "../iconGrouping";

const useStyles = makeStyles()((theme) => ({
  articleItem: {
    marginBottom: theme.spacing(1.5),
  },
  imageSection: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 20% [col-start])",
    gridTemplateRows: "repeat(5, 20% [row-start])",
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
    background: `linear-gradient(90deg, ${theme.palette.primary.main} 70%, rgba(1,36,0,0) 100%)`,
    color: theme.palette.common.white,
  },
  dateDesktop: {
    padding: theme.spacing(2),
  },
  dateMobile: {
    padding: theme.spacing(2),
    color: theme.palette.common.white,
    gridRowStart: 5,
    gridColumnStart: 4,
    gridColumnEnd: 6,
    zIndex: 2,
    textShadow: "3px 3px 10px #000000, -2px 1px 20px #000000",
  },
  gamingPlatformMinis: {
    height: theme.spacing(3.5),
    width: theme.spacing(3.5),
  },
  playedOnIcon: {
    filter: "drop-shadow(6px 6px 5px #222)",
  },
  announcementIcon: {
    fontSize: 64,
    filter: "drop-shadow(6px 6px 5px #222)",
  },
  footerIcons: {
    minHeight: theme.spacing(8),
    padding: theme.spacing(2),
    paddingRight: theme.spacing(4),
    background: `linear-gradient(90deg, rgba(1,36,0,0) 20%, ${theme.palette.error.main} 80%)`,
    marginTop: "auto",
  },
  eachFooterIcons: {
    backgroundColor: theme.palette.common.white,
    marginLeft: theme.spacing(1),
    borderRadius: "50%",
    padding: theme.spacing(0.5),
    boxShadow: "5px 5px 4px 0px rgba(0, 0, 0, 1)",
  },
  shortDescriptionTextBox: {
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  cardHeader: {
    "& .MuiCardHeader-content": {
      display: "block",
      overflow: "hidden",
    },
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
  const groupedPlatformIcons = useMemo(
    () => IconGrouping(data.availableOn),
    [data]
  );

  function ArticleIconSelector(): ReactNode {
    switch (data.articleType.name) {
      case "review":
        return (
          <CardMedia
            component="img"
            image={iconSelector(data.playedOn.groupName, "white")}
            alt={i18next.t("image.missing")}
            height="64"
            className={classes.playedOnIcon}
          />
        );
      case "news":
        return <AnnouncementIcon className={classes.announcementIcon} />;
      default:
        return <ArticleIcon className={classes.announcementIcon} />;
    }
  }
  const navigate = useNavigate();

  const theme = useTheme();
  const desktopScreen = useMediaQuery(theme.breakpoints.up("md"));

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
    <Card className={classes.articleItem} elevation={6}>
      <CardActionArea onClick={handleClick}>
        <Grid container direction="row">
          {frontImage ? (
            <Grid
              item
              container
              lg={4}
              md={5}
              sm={6}
              xs={12}
              className={classes.imageSection}
            >
              <InformationTag
                text={i18next.t(`dashboard.item.type.${data.articleType.name}`)}
              />
              {!desktopScreen && (
                <Typography
                  variant="body1"
                  align="right"
                  alignSelf="center"
                  fontWeight="bold"
                  className={classes.dateMobile}
                >
                  {new Date(data.createdAt).toLocaleDateString()}
                </Typography>
              )}
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
              sm={6}
              xs={12}
              justifyContent="center"
              alignItems="center"
              className={classes.loading}
            >
              <CircularProgress />
            </Grid>
          )}
          <Grid
            container
            item
            lg={8}
            md={7}
            sm={6}
            xs={12}
            direction="column"
            justifyContent="flex-start"
          >
            <Grid container direction="row" justifyContent="space-between">
              <Grid item xl={10} md={9} xs={12} className={classes.header}>
                <CardHeader
                  avatar={ArticleIconSelector()}
                  title={
                    <Typography variant="h6" noWrap>
                      {data.title}
                    </Typography>
                  }
                  subheader={
                    <Typography variant="subtitle2">{data.producer}</Typography>
                  }
                  className={classes.cardHeader}
                />
              </Grid>
              {desktopScreen && (
                <Grid item>
                  <Typography
                    variant="subtitle1"
                    align="right"
                    fontWeight="bold"
                    className={classes.dateDesktop}
                  >
                    {new Date(data.createdAt).toLocaleDateString()}
                  </Typography>
                </Grid>
              )}
            </Grid>
            <Grid item>
              <Box component="div" className={classes.shortDescriptionTextBox}>
                <Typography
                  variant="body1"
                  textAlign="justify"
                  className={classes.shortDescription}
                >
                  {data.shortDescription}
                </Typography>
              </Box>
            </Grid>
            {data.availableOn.length > 0 && (
              <Grid
                item
                container
                wrap="nowrap"
                justifyContent="flex-end"
                alignItems="center"
                className={classes.footerIcons}
              >
                {groupedPlatformIcons.map((icon) => (
                  <Grid
                    item
                    className={classes.eachFooterIcons}
                    key={icon.groupName}
                  >
                    <CardMedia
                      className={classes.gamingPlatformMinis}
                      component="img"
                      alt={i18next.t("image.missing")}
                      image={iconSelector(icon.groupName, "color")}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>
        </Grid>
      </CardActionArea>
    </Card>
  );
}
