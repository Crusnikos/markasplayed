import { Grid } from "@mui/material";
import { makeStyles } from "tss-react/mui";
import i18next from "i18next";
import NoPhotographyIcon from "@mui/icons-material/NoPhotography";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { useArticleData } from "../context/ArticleListProvider";
import { Fragment } from "react";

const useStyles = makeStyles()((theme) => ({
  imageSection: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 50% [col-start])",
    gridTemplateRows: "repeat(2, 50% [row-start])",
    justifyItems: "center",
  },
  imageSoftEdges: {
    boxShadow: `inset 0px 0px 10px 15px ${theme.palette.background.paper}`,
    zIndex: 3,
  },
  imageSoftEdgesWrapper: {
    display: "grid",
    aspectRatio: "16/9",
  },
  noPhotographyIconWrapper: {
    display: "grid",
    alignItems: "center",
  },
  gridWrapper: {
    gridRowStart: 1,
    gridRowEnd: 3,
    gridColumnStart: 1,
    gridColumnEnd: 3,
  },
  image: {
    zIndex: 2,
  },
}));

export default function ImageWithSoftEdges(props: {
  imageUrl: string | undefined;
  maxHeight: string;
}): JSX.Element {
  const { classes } = useStyles();
  const { imageUrl, maxHeight } = props;
  const [, syncDate] = useArticleData();

  return (
    <Grid
      item
      container
      className={classes.imageSection}
      style={{ maxHeight: maxHeight }}
    >
      {imageUrl ? (
        <Fragment>
          <Grid
            item
            className={`${classes.imageSoftEdgesWrapper} ${classes.gridWrapper}`}
          >
            <Grid className={classes.imageSoftEdges} />
          </Grid>
          <Grid item className={classes.gridWrapper}>
            <LazyLoadImage
              src={`${imageUrl}?${syncDate}`}
              alt={i18next.t("image.missing")}
              effect="blur"
              width="100%"
              height="100%"
              className={classes.image}
            />
          </Grid>
        </Fragment>
      ) : (
        <Grid
          className={`${classes.noPhotographyIconWrapper} ${classes.gridWrapper}`}
          style={{ height: maxHeight }}
        >
          <NoPhotographyIcon fontSize="large" />
        </Grid>
      )}
    </Grid>
  );
}
