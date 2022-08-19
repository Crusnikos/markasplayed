import React, { Fragment, useEffect, useState } from "react";
import { makeStyles } from "tss-react/mui";
import { ImageData, getSliderImages } from "../article/api/files";
import { useArticleData } from "../ArticleListProvider";
import { DispatchSnackbar } from "../components/SnackbarDialog";
import { DefaultPicture, PictureSlider } from "./PictureSlider";
import TopMenu from "./TopMenu";

const useStyles = makeStyles()((theme) => ({
  header: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  nav: {
    marginBottom: theme.spacing(1),
  },
}));

export default function Menu(props: {
  displaySnackbar: DispatchSnackbar;
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
    <Fragment>
      <header className={classes.header}>
        {sliderImages ? (
          <PictureSlider images={sliderImages} />
        ) : (
          <DefaultPicture />
        )}
      </header>
      <nav className={classes.nav}>
        <TopMenu displaySnackbar={props.displaySnackbar} />
      </nav>
    </Fragment>
  );
}
