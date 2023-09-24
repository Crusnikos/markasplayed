import { useMediaQuery, useTheme } from "@mui/material";
import React, {
  Dispatch,
  Fragment,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { makeStyles } from "tss-react/mui";
import { getSliderImages, SliderData } from "../../api/files";
import { useArticleData } from "../../context/ArticleListProvider";
import { DispatchSnackbar } from "../../components/SnackbarDialog";
import { PictureSlider } from "./PictureSlider";
import TopMenu from "./TopMenu";

const useStyles = makeStyles()((theme) => ({
  header: {
    overflow: "hidden",
  },
  nav: {
    marginBottom: theme.spacing(1.5),
  },
}));

export default function Menu(props: {
  setSnackbar: DispatchSnackbar;
  setLoading: Dispatch<SetStateAction<boolean>>;
}): JSX.Element {
  const { classes } = useStyles();
  const [[, count], syncDate] = useArticleData();
  const [sliderImages, setSliderImages] = useState<SliderData[] | undefined>(
    undefined
  );

  const theme = useTheme();
  const desktopScreen = useMediaQuery(theme.breakpoints.up("sm"));

  useEffect(() => {
    async function fetchSliderImages() {
      if (count > 0) {
        const images = await getSliderImages();
        setSliderImages(images);
      }
    }
    void fetchSliderImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncDate]);

  return (
    <Fragment>
      <header className={classes.header} id="slider-header">
        <PictureSlider
          images={sliderImages}
          setLoading={props.setLoading}
          desktopScreen={desktopScreen}
        />
      </header>
      <nav className={classes.nav}>
        <TopMenu
          setSnackbar={props.setSnackbar}
          desktopScreen={desktopScreen}
        />
      </nav>
    </Fragment>
  );
}
