import {
  Button,
  FormControl,
  FormHelperText,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { Controller, FieldError, useForm } from "react-hook-form";
import { ArticleFormData, FullArticleData, ArticleTypes } from "../api/article";
import { Lookups } from "../api/lookup";
import { makeStyles } from "tss-react/mui";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import defaultFormValues from "./defaultFormValues";
import { useFirebaseAuth } from "../../firebase";
import i18next from "i18next";

const useStyles = makeStyles()((theme) => ({
  helperMargin: {
    marginBottom: theme.spacing(2),
  },
}));

function errorMessageFromArray(
  error: FieldError[] | undefined
): (string | undefined)[] {
  return (Array.isArray(error) ? error : [error])?.map((e) => e?.message);
}

export default function ArticleContentForm(props: {
  data?: FullArticleData;
  draft?: ArticleFormData;
  onArticleSubmit: (
    formData: ArticleFormData,
    articleType: ArticleTypes
  ) => Promise<void>;
  lookups: Lookups | undefined;
}): JSX.Element {
  const { data, draft, onArticleSubmit, lookups } = props;
  const { classes } = useStyles();
  const [articleType, setArticleType] = useState<ArticleTypes>(undefined);
  const { authenticated } = useFirebaseAuth();

  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm<ArticleFormData>({
    defaultValues: defaultFormValues({ data, draft }),
  });

  const type = watch("articleType");
  useEffect(() => {
    switch (type) {
      case 1:
        setArticleType("review");
        return;
      case 2:
        setArticleType("news");
        return;
      case 3:
        setArticleType("other");
        return;
      default:
        setArticleType(undefined);
        return;
    }
  }, [type]);

  return (
    <form
      autoComplete="off"
      noValidate
      onSubmit={handleSubmit((formData) => {
        onArticleSubmit(formData, articleType);
      })}
    >
      <FormControl fullWidth variant="outlined">
        <Stack direction="column">
          <Controller
            rules={{
              required: {
                value: true,
                message: i18next.t("form.rules.required"),
              },
            }}
            name="articleType"
            control={control}
            render={({ field }) => (
              <React.Fragment>
                <TextField
                  label={i18next.t("form.label.article.articleType")}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  select
                  {...field}
                >
                  {lookups?.articleTypes
                    .sort((a, b) => a.id - b.id)
                    .map((g) => (
                      <MenuItem key={g.id} value={g.id}>
                        {i18next.t(`dashboard.item.type.${g.name}`)}
                      </MenuItem>
                    ))}
                </TextField>
                <FormHelperText error className={classes.helperMargin}>
                  {errors.articleType?.message}
                </FormHelperText>
              </React.Fragment>
            )}
          />
          <Controller
            rules={{
              required: {
                value: true,
                message: i18next.t("form.rules.required"),
              },
              maxLength: {
                value: 50,
                message: i18next.t("form.rules.max50Length"),
              },
            }}
            name="title"
            control={control}
            render={({ field }) => (
              <React.Fragment>
                <TextField
                  label={i18next.t("form.label.article.title")}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  {...field}
                />
                <FormHelperText error className={classes.helperMargin}>
                  {errors.title?.message}
                </FormHelperText>
              </React.Fragment>
            )}
          />
          {articleType !== "news" && articleType !== "other" && (
            <Controller
              rules={{
                required: {
                  value: true,
                  message: i18next.t("form.rules.required"),
                },
              }}
              name="playedOn"
              control={control}
              render={({ field }) => (
                <React.Fragment>
                  <TextField
                    label={i18next.t("form.label.article.playedOn")}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                    select
                    {...field}
                  >
                    {lookups?.platforms.map((p) => (
                      <MenuItem key={p.id} value={p.id}>
                        {p.name}
                      </MenuItem>
                    ))}
                  </TextField>
                  <FormHelperText error className={classes.helperMargin}>
                    {errors.playedOn?.message}
                  </FormHelperText>
                </React.Fragment>
              )}
            />
          )}
          {articleType !== "other" && (
            <Controller
              rules={{
                required: {
                  value: true,
                  message: i18next.t("form.rules.required"),
                },
              }}
              name="availableOn"
              control={control}
              render={({ field }) => (
                <React.Fragment>
                  <TextField
                    label={i18next.t("form.label.article.availableOn")}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                    select
                    SelectProps={{
                      multiple: true,
                      value: field.value.map((p) => p),
                    }}
                    {...field}
                  >
                    {lookups?.platforms.map((p) => (
                      <MenuItem key={p.id} value={p.id}>
                        {p.name}
                      </MenuItem>
                    ))}
                  </TextField>
                  <FormHelperText error className={classes.helperMargin}>
                    {errorMessageFromArray(errors.availableOn)}
                  </FormHelperText>
                </React.Fragment>
              )}
            />
          )}
          {articleType !== "news" && articleType !== "other" && (
            <Controller
              rules={{
                required: {
                  value: true,
                  message: i18next.t("form.rules.required"),
                },
                maxLength: {
                  value: 50,
                  message: i18next.t("form.rules.max50Length"),
                },
              }}
              name="producer"
              control={control}
              render={({ field }) => (
                <React.Fragment>
                  <TextField
                    label={i18next.t("form.label.article.producer")}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                    {...field}
                  />
                  <FormHelperText error className={classes.helperMargin}>
                    {errors.producer?.message}
                  </FormHelperText>
                </React.Fragment>
              )}
            />
          )}
          {articleType !== "news" && articleType !== "other" && (
            <Controller
              rules={{
                required: {
                  value: true,
                  message: i18next.t("form.rules.required"),
                },
                min: { value: 1, message: i18next.t("form.rules.min1Value") },
                max: {
                  value: 1000,
                  message: i18next.t("form.rules.max1000Value"),
                },
              }}
              name="playTime"
              control={control}
              render={({ field }) => (
                <React.Fragment>
                  <TextField
                    label={i18next.t("form.label.article.playTime")}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{ type: "number" }}
                    size="small"
                    {...field}
                  />
                  <FormHelperText error className={classes.helperMargin}>
                    {errors.playTime?.message}
                  </FormHelperText>
                </React.Fragment>
              )}
            />
          )}
          <Controller
            rules={{
              required: {
                value: true,
                message: i18next.t("form.rules.required"),
              },
              maxLength: {
                value: 400,
                message: i18next.t("form.rules.max400Length"),
              },
            }}
            name="shortDescription"
            control={control}
            render={({ field }) => (
              <React.Fragment>
                <TextField
                  multiline
                  rows={4}
                  label={i18next.t("form.label.article.shortDescription")}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  {...field}
                />
                <FormHelperText error className={classes.helperMargin}>
                  {errors.shortDescription?.message}
                </FormHelperText>
              </React.Fragment>
            )}
          />
          <Controller
            rules={{
              required: {
                value: true,
                message: i18next.t("form.rules.required"),
              },
              maxLength: {
                value: 10000,
                message: i18next.t("form.rules.max10000Length"),
              },
            }}
            name="longDescription"
            control={control}
            render={({ field }) => (
              <React.Fragment>
                <TextField
                  multiline
                  rows={10}
                  label={i18next.t("form.label.article.longDescription")}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  {...field}
                />
                <FormHelperText error className={classes.helperMargin}>
                  {errors.longDescription?.message}
                </FormHelperText>
              </React.Fragment>
            )}
          />
          {authenticated ? (
            <Button type="submit" variant="contained">
              {data?.id ? (
                i18next.t("form.submit.article.edit")
              ) : (
                <React.Fragment>
                  {i18next.t("form.submit.article.save")}{" "}
                  <KeyboardDoubleArrowRightIcon />
                </React.Fragment>
              )}
            </Button>
          ) : (
            <Button type="submit" variant="contained" disabled>
              {i18next.t("form.submit.notAvailable")}
            </Button>
          )}
        </Stack>
      </FormControl>
    </form>
  );
}
