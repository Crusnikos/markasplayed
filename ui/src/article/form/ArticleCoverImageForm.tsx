import { Stack } from "@mui/material";
import React from "react";
import { makeStyles } from "tss-react/mui";
import { CustomInputImage } from "./formUnitsTemplates";
import { ActionType, CoverData } from "./imagesReducer";

const useStyles = makeStyles()((theme) => ({
  stack: {
    paddingTop: theme.spacing(1),
  },
}));

export default function ArticleFrontImageForm(props: {
  coverData: CoverData;
  imagesDispatch: React.Dispatch<ActionType>;
  error: string | undefined;
}): JSX.Element {
  const { classes } = useStyles();

  function onImagesChange(event: React.ChangeEvent<HTMLInputElement>) {
    props.imagesDispatch({
      type: "setCoverImage",
      data: event.currentTarget.files,
    });
  }

  return (
    <Stack direction="column" className={classes.stack} spacing={1}>
      <CustomInputImage
        image={props.coverData.preview}
        onImagesChange={onImagesChange}
        isAddPhoto={true}
        error={props.error}
        multipleUpload={false}
      />
    </Stack>
  );
}
