import { Box, Grid, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { AuthorData, getAuthorImage } from "../../api/author";
import { makeStyles } from "tss-react/mui";
import { ImageData } from "../../api/files";
import i18next from "i18next";
import { useTranslation } from "react-i18next";
import { useArticleData } from "../../context/ArticleListProvider";

const useStyles = makeStyles()((theme) => ({
  avatarBorder: {
    border: "3px solid black",
    height: theme.spacing(16),
    borderRadius: "50%",
    width: theme.spacing(16),
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
  },
  container: {
    padding: theme.spacing(3),
    height: "350px",
    overflow: "auto",
  },
}));

function descriptionSelector(
  language: string,
  author: AuthorData
): JSX.Element {
  switch (language) {
    case "pl":
      return <Typography variant="body1">{author.descriptionPl}</Typography>;
    default:
      return <Typography variant="body1">{author.descriptionEn}</Typography>;
  }
}

export default function Item(props: { data: AuthorData }): JSX.Element {
  const { classes } = useStyles();
  const { data: author } = props;
  const [authorImage, setAuthorImage] = useState<ImageData | null>(null);
  const [, syncDate] = useArticleData();
  const { i18n } = useTranslation();

  useEffect(() => {
    async function fetchAuthors() {
      const image = await getAuthorImage({ id: author.id });
      setAuthorImage(image);
    }

    void fetchAuthors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <React.Fragment>
      <Grid container spacing={1} className={classes.container}>
        <Grid item>
          <Grid
            container
            className={classes.avatarBorder}
            alignItems="center"
            justifyContent="center"
          >
            {authorImage && (
              <Box
                component="img"
                className={classes.avatarImage}
                src={`${authorImage?.imagePathName}?${syncDate}`}
                alt={i18next.t("image.missing")}
              />
            )}
          </Grid>
        </Grid>
        <Grid item>
          <Typography variant="h5">{author.name}</Typography>
        </Grid>
        <Grid item>{descriptionSelector(i18n.resolvedLanguage, author)}</Grid>
      </Grid>
    </React.Fragment>
  );
}
