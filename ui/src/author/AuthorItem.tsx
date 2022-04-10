import { Box, Divider, Grid, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { AuthorData, AuthorImageData, getAuthorImage } from "./api";
import PersonIcon from "@mui/icons-material/Person";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()(() => ({
  avatarBorder: {
    border: "3px solid black",
    height: "120px",
    borderRadius: "50%",
    width: "120px",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
  },
}));

export default function AuthorItem(props: { data: AuthorData }): JSX.Element {
  const { classes } = useStyles();
  const { data: author } = props;
  const [authorImage, setAuthorImage] = useState<AuthorImageData | undefined>(
    undefined
  );

  useEffect(() => {
    async function fetchAuthors() {
      const authors = await getAuthorImage({ id: author.id });
      setAuthorImage(authors);
    }
    void fetchAuthors();
  }, [author]);

  return (
    <React.Fragment>
      <Grid item>
        <Grid
          container
          className={classes.avatarBorder}
          alignItems="center"
          justifyContent="center"
        >
          {authorImage ? (
            <Box
              component="img"
              className={classes.avatarImage}
              src={`${authorImage?.imageSrc}?${Date.now()}`}
              alt={"Missing picture"}
            />
          ) : (
            <PersonIcon fontSize="large" />
          )}
        </Grid>
      </Grid>
      <Grid item>
        <Typography variant="h5">{author.name}</Typography>
      </Grid>
      <Grid item>
        <Divider textAlign="left">Polski</Divider>
        <Typography variant="body1">{author.descriptionPl}</Typography>
      </Grid>
      <Grid item>
        <Divider textAlign="left">English</Divider>
        <Typography variant="body1">{author.descriptionEn}</Typography>
      </Grid>
    </React.Fragment>
  );
}
