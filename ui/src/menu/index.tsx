import React, {
  Dispatch,
  Fragment,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { makeStyles } from "tss-react/mui";
import { ImageData, getSliderImages } from "../article/api/files";
import { useArticleData } from "../ArticleListProvider";
import { DispatchSnackbar } from "../components/SnackbarDialog";
import { PictureSlider } from "./PictureSlider";
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
  setSnackbar: DispatchSnackbar;
  setLoading: Dispatch<SetStateAction<boolean>>;
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
        <PictureSlider images={sliderImages} setLoading={props.setLoading} />
      </header>
      <nav className={classes.nav}>
        <TopMenu setSnackbar={props.setSnackbar} />
      </nav>
    </Fragment>
  );
}
