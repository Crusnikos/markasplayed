import { Stack } from "@mui/material";
import React from "react";
import { Control, FormState } from "react-hook-form";
import { ArticleFormData, ArticleTypes } from "../api/article";
import { Lookups } from "../api/lookup";
import {
  CustomMultilineTextField,
  CustomMultipleDropdownSelect,
  CustomSingleDropdownSelect,
  CustomTextField,
} from "./formUnitsTemplates";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()((theme) => ({
  stack: {
    paddingTop: theme.spacing(1),
  },
}));

export default function ArticleContentForm(props: {
  control: Control<ArticleFormData, any>;
  lookups: Lookups | undefined;
  formState: FormState<ArticleFormData>;
  articleType: ArticleTypes;
}): JSX.Element {
  const { classes } = useStyles();
  const { articleType } = props;

  return (
    <Stack direction="column" className={classes.stack} spacing={1}>
      <CustomSingleDropdownSelect
        requiredField={true}
        control={props.control}
        propertyName="articleType"
        lookups={props.lookups}
        formState={props.formState}
      />
      <CustomTextField
        requiredField={true}
        maxLength={true}
        minValue={false}
        maxValue={false}
        control={props.control}
        propertyName="title"
        formState={props.formState}
        inputType="text"
      />
      {articleType !== "news" && articleType !== "other" && (
        <CustomSingleDropdownSelect
          requiredField={true}
          control={props.control}
          lookups={props.lookups}
          propertyName="playedOn"
          formState={props.formState}
        />
      )}
      {articleType !== "other" && (
        <CustomMultipleDropdownSelect
          requiredField={true}
          control={props.control}
          lookups={props.lookups}
          propertyName="availableOn"
          formState={props.formState}
        />
      )}
      {articleType !== "news" && articleType !== "other" && (
        <CustomTextField
          requiredField={true}
          maxLength={true}
          minValue={false}
          maxValue={false}
          control={props.control}
          propertyName="producer"
          formState={props.formState}
          inputType="text"
        />
      )}
      {articleType !== "news" && articleType !== "other" && (
        <CustomTextField
          requiredField={true}
          maxLength={false}
          minValue={true}
          maxValue={true}
          control={props.control}
          propertyName="playTime"
          formState={props.formState}
          inputType="number"
        />
      )}
      <CustomMultilineTextField
        requiredField={true}
        maxLength={true}
        control={props.control}
        propertyName="shortDescription"
        formState={props.formState}
        rows={4}
      />
      <CustomMultilineTextField
        requiredField={true}
        maxLength={true}
        control={props.control}
        propertyName="longDescription"
        formState={props.formState}
        rows={12}
      />
    </Stack>
  );
}
