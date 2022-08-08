import { Grid } from "@mui/material";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { makeStyles } from "tss-react/mui";
import { ImageData, getSliderImages } from "../article/api/files";
import { useArticleData } from "../ArticleListProvider";
import { Dialog } from "../Dialog";
import { DefaultPicture, PictureSlider } from "./PictureSlider";
import TopMenu from "./TopMenu";

const useStyles = makeStyles()((theme) => ({
  topSection: {
    width: "1200px",
    [theme.breakpoints.down("lg")]: {
      width: "100vw",
    },
  },
}));

export default function Menu(props: {
  openDialog: Dispatch<SetStateAction<Dialog>>;
}): JSX.Element {
  const { classes } = useStyles();
  const [[, count]] = useArticleData();
  const [sliderImages, setSliderImages] = useState<ImageData[] | undefined>(
    undefined
  );

  useEffect(() => {
    async function fetchSliderImages() {
      if (count > 0) {
        const images = await getSliderImages();
        setSliderImages(images);
      }
    }

    void fetchSliderImages();
  }, [count]);

  return (
    <Grid item className={classes.topSection}>
      {sliderImages ? (
        <PictureSlider images={sliderImages} />
      ) : (
        <DefaultPicture />
      )}
      <TopMenu openDialog={props.openDialog} />
    </Grid>
  );
}
