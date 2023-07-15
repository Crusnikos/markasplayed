import {
  CardActionArea,
  CardMedia,
  FormHelperText,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import i18next from "i18next";
import React from "react";
import {
  Control,
  Controller,
  FieldError,
  FormState,
  ValidationRule,
} from "react-hook-form";
import { ArticleFormData } from "../../../api/article";
import { Lookups } from "../../../api/lookup";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()(() => ({
  inputWrapper: {
    aspectRatio: "16/9",
    width: "100%",
    display: "flex",
    justifyContent: "center",
  },
}));

type PropertyName =
  | "articleType"
  | "title"
  | "playedOn"
  | "availableOn"
  | "producer"
  | "playTime"
  | "shortDescription"
  | "longDescription";

function requiredRule(): ValidationRule<boolean> {
  return {
    value: true,
    message: i18next.t("form.rules.required"),
  };
}

function maxLengthRule(propertyName: PropertyName): ValidationRule<number> {
  switch (propertyName) {
    case "shortDescription":
      return { value: 400, message: i18next.t("form.rules.max400Length") };
    case "longDescription":
      return { value: 10000, message: i18next.t("form.rules.max10000Length") };
    default:
      return { value: 50, message: i18next.t("form.rules.max50Length") };
  }
}

function minValueRule(): ValidationRule<string | number> {
  return { value: 1, message: i18next.t("form.rules.min1Value") };
}

function maxValueRule(): ValidationRule<string | number> {
  return {
    value: 1000,
    message: i18next.t("form.rules.max1000Value"),
  };
}

function extractErrorMessage(
  error: FieldError | FieldError[] | undefined
): string | undefined {
  return Array.isArray(error) ? error[1].message : error?.message;
}

function createLookupMenuItems(
  lookups: Lookups | undefined,
  propertyName: PropertyName,
  blockedValues?: number[]
): JSX.Element[] | undefined {
  switch (propertyName) {
    case "articleType":
      return lookups?.articleTypes
        .sort((a, b) => a.id - b.id)
        .map((g) => (
          <MenuItem key={g.id} value={g.id}>
            {i18next.t(`dashboard.item.type.${g.name}`)}
          </MenuItem>
        ));
    case "playedOn":
    case "availableOn":
      return lookups?.platforms.map((p) => (
        <MenuItem
          key={p.id}
          value={p.id}
          disabled={blockedValues && blockedValues.includes(p.id)}
        >
          {p.name}
        </MenuItem>
      ));
    default:
      return undefined;
  }
}

export function CustomSingleDropdownSelect(props: {
  requiredField: boolean;
  control: Control<ArticleFormData, any>;
  propertyName: PropertyName;
  lookups: Lookups | undefined;
  formState: FormState<ArticleFormData>;
}): JSX.Element {
  const { requiredField, control, propertyName, lookups, formState } = props;
  const { errors } = formState;
  const errorMessage = extractErrorMessage(errors[propertyName]);

  return (
    <Controller
      rules={{
        required: requiredField ? requiredRule() : undefined,
      }}
      name={propertyName}
      control={control}
      render={({ field }) => (
        <React.Fragment>
          <TextField
            error={errorMessage !== undefined ? true : false}
            label={i18next.t(`form.label.article.${propertyName}`)}
            InputLabelProps={{ shrink: true, htmlFor: `${propertyName}-id` }}
            inputProps={{ id: `${propertyName}-id` }}
            size="small"
            select
            {...field}
          >
            {createLookupMenuItems(lookups, propertyName)}
          </TextField>
          <FormHelperText error>{errorMessage}</FormHelperText>
        </React.Fragment>
      )}
    />
  );
}

export function CustomTextField(props: {
  requiredField: boolean;
  maxLength: boolean;
  minValue: boolean;
  maxValue: boolean;
  control: Control<ArticleFormData, any>;
  propertyName: PropertyName;
  formState: FormState<ArticleFormData>;
  inputType: string;
}): JSX.Element {
  const {
    requiredField,
    maxLength,
    minValue,
    maxValue,
    control,
    propertyName,
    formState,
    inputType,
  } = props;
  const { errors } = formState;
  const errorMessage = extractErrorMessage(errors[propertyName]);

  return (
    <Controller
      rules={{
        required: requiredField ? requiredRule() : undefined,
        maxLength: maxLength ? maxLengthRule(propertyName) : undefined,
        min: minValue ? minValueRule() : undefined,
        max: maxValue ? maxValueRule() : undefined,
      }}
      name={propertyName}
      control={control}
      render={({ field }) => (
        <React.Fragment>
          <TextField
            error={errorMessage !== undefined ? true : false}
            label={i18next.t(`form.label.article.${propertyName}`)}
            InputLabelProps={{ shrink: true }}
            InputProps={{ type: inputType }}
            size="small"
            {...field}
          />
          <FormHelperText error>{errorMessage}</FormHelperText>
        </React.Fragment>
      )}
    />
  );
}

export function CustomMultipleDropdownSelect(props: {
  requiredField: boolean;
  control: Control<ArticleFormData, any>;
  propertyName: PropertyName;
  lookups: Lookups | undefined;
  formState: FormState<ArticleFormData>;
  blockedValues: number[];
}): JSX.Element {
  const {
    requiredField,
    control,
    propertyName,
    lookups,
    formState,
    blockedValues,
  } = props;
  const { errors } = formState;
  const errorMessage = extractErrorMessage(errors.availableOn);

  return (
    <Controller
      rules={{
        required: requiredField ? requiredRule() : undefined,
      }}
      name={propertyName}
      control={control}
      render={({ field }) => (
        <React.Fragment>
          <TextField
            error={errorMessage !== undefined ? true : false}
            label={i18next.t(`form.label.article.${propertyName}`)}
            InputLabelProps={{ shrink: true, htmlFor: `${propertyName}-id` }}
            inputProps={{ id: `${propertyName}-id` }}
            size="small"
            select
            SelectProps={{
              multiple: true,
              value: Array.isArray(field.value) && field.value.map((p) => p),
            }}
            {...field}
          >
            {createLookupMenuItems(lookups, propertyName, blockedValues)}
          </TextField>
          <FormHelperText error>{errorMessage}</FormHelperText>
        </React.Fragment>
      )}
    />
  );
}

export function CustomMultilineTextField(props: {
  requiredField: boolean;
  maxLength: boolean;
  control: Control<ArticleFormData, any>;
  propertyName: PropertyName;
  formState: FormState<ArticleFormData>;
  rows: number;
}): JSX.Element {
  const { requiredField, maxLength, control, propertyName, formState, rows } =
    props;
  const { errors } = formState;
  const errorMessage = extractErrorMessage(errors[propertyName]);

  return (
    <Controller
      rules={{
        required: requiredField ? requiredRule() : undefined,
        maxLength: maxLength ? maxLengthRule(propertyName) : undefined,
      }}
      name={propertyName}
      control={control}
      render={({ field }) => (
        <React.Fragment>
          <TextField
            id={`${propertyName}-id`}
            error={errorMessage !== undefined ? true : false}
            multiline
            rows={rows}
            label={i18next.t(`form.label.article.${propertyName}`)}
            InputLabelProps={{ shrink: true }}
            size="small"
            {...field}
          />
          <FormHelperText error>{errorMessage}</FormHelperText>
        </React.Fragment>
      )}
    />
  );
}

export function CustomInputImage(props: {
  image: string | undefined;
  onImagesChange: (element: React.ChangeEvent<HTMLInputElement>) => void;
  isAddPhoto: boolean;
  error: string | undefined;
  multipleUpload: boolean;
}): JSX.Element {
  const { image, isAddPhoto, onImagesChange, error, multipleUpload } = props;
  const { classes } = useStyles();

  return (
    <React.Fragment>
      <CardActionArea component="label" className={classes.inputWrapper}>
        <input
          hidden
          accept="image/webp"
          type="file"
          multiple={multipleUpload}
          onChange={(event) => onImagesChange(event)}
        />
        {image && (
          <CardMedia
            component="img"
            src={image}
            alt={i18next.t("image.missing")}
          />
        )}
        {!image && isAddPhoto && (
          <Stack alignItems="center">
            <AddPhotoAlternateIcon fontSize="large" />
            <Typography variant="subtitle2" component="span">
              {i18next.t(
                `subtitle.${multipleUpload ? "galleryImage" : "mainPicture"}`
              )}
            </Typography>
          </Stack>
        )}
      </CardActionArea>
      {error && <FormHelperText error>{error}</FormHelperText>}
    </React.Fragment>
  );
}
