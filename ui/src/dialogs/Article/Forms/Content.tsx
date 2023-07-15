import { Stack } from "@mui/material";
import React, { useEffect, useState } from "react";
import {
  Control,
  FormState,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { ArticleFormData, ArticleTypes } from "../../../api/article";
import { Lookups } from "../../../api/lookup";
import {
  CustomMultilineTextField,
  CustomMultipleDropdownSelect,
  CustomSingleDropdownSelect,
  CustomTextField,
} from "../utils/formUnitsTemplates";
import { makeStyles } from "tss-react/mui";

export function GetArticleTypeName(articleType: number): ArticleTypes {
  switch (articleType) {
    case 1:
      return "review";
    case 2:
      return "news";
    case 3:
      return "other";
    default:
      return undefined;
  }
}

const useStyles = makeStyles()((theme) => ({
  stack: {
    paddingTop: theme.spacing(1),
  },
}));

export default function Content(props: {
  control: Control<ArticleFormData, any>;
  lookups: Lookups | undefined;
  formState: FormState<ArticleFormData>;
  watch: UseFormWatch<ArticleFormData>;
  setValue: UseFormSetValue<ArticleFormData>;
}): JSX.Element {
  const { classes } = useStyles();
  const { control, lookups, formState, watch, setValue } = props;

  const [articleType, setArticleType] = useState<ArticleTypes | undefined>(
    undefined
  );
  const [blockedValues, setBlockedValues] = useState<number[]>([]);

  const observedPlayedOn = watch("playedOn");
  const observedAvailableOn = watch("availableOn");
  const observedArticleType = watch("articleType");

  useEffect(() => {
    if (!observedPlayedOn) return;
    if (observedAvailableOn.includes(observedPlayedOn)) {
      setBlockedValues([observedPlayedOn]);
      return;
    }

    const currentAvailableOn = observedAvailableOn;

    setBlockedValues([observedPlayedOn]);
    currentAvailableOn.push(observedPlayedOn);
    setValue("availableOn", currentAvailableOn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [observedPlayedOn]);

  useEffect(() => {
    setArticleType(GetArticleTypeName(observedArticleType));
  }, [observedArticleType]);

  return (
    <Stack direction="column" className={classes.stack} spacing={1}>
      <CustomSingleDropdownSelect
        requiredField={true}
        control={control}
        propertyName="articleType"
        lookups={lookups}
        formState={formState}
      />
      <CustomTextField
        requiredField={true}
        maxLength={true}
        minValue={false}
        maxValue={false}
        control={control}
        propertyName="title"
        formState={formState}
        inputType="text"
      />
      {articleType !== "news" && articleType !== "other" && (
        <CustomSingleDropdownSelect
          requiredField={true}
          control={control}
          lookups={lookups}
          propertyName="playedOn"
          formState={formState}
        />
      )}
      {articleType !== "other" && (
        <CustomMultipleDropdownSelect
          requiredField={true}
          control={control}
          lookups={lookups}
          propertyName="availableOn"
          formState={formState}
          blockedValues={blockedValues}
        />
      )}
      {articleType !== "news" && articleType !== "other" && (
        <CustomTextField
          requiredField={true}
          maxLength={true}
          minValue={false}
          maxValue={false}
          control={control}
          propertyName="producer"
          formState={formState}
          inputType="text"
        />
      )}
      {articleType !== "news" && articleType !== "other" && (
        <CustomTextField
          requiredField={true}
          maxLength={false}
          minValue={true}
          maxValue={true}
          control={control}
          propertyName="playTime"
          formState={formState}
          inputType="number"
        />
      )}
      <CustomMultilineTextField
        requiredField={true}
        maxLength={true}
        control={control}
        propertyName="shortDescription"
        formState={formState}
        rows={4}
      />
      <CustomMultilineTextField
        requiredField={true}
        maxLength={true}
        control={control}
        propertyName="longDescription"
        formState={formState}
        rows={12}
      />
    </Stack>
  );
}
