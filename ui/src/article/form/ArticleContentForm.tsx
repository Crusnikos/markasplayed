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

const useStyles = makeStyles()(() => ({
  helperMargin: {
    marginBottom: "16px",
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
              required: { value: true, message: "Pole jest wymagane" },
            }}
            name="articleType"
            control={control}
            render={({ field }) => (
              <React.Fragment>
                <TextField
                  label="Typ Artykułu"
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  select
                  {...field}
                >
                  {lookups?.articleTypes.map((g) => (
                    <MenuItem key={g.id} value={g.id}>
                      {g.name}
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
              required: { value: true, message: "Pole jest wymagane" },
              maxLength: {
                value: 50,
                message: "Maksymalna długość wynosi 50 znaków",
              },
            }}
            name="title"
            control={control}
            render={({ field }) => (
              <React.Fragment>
                <TextField
                  label="Tytuł"
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
                required: { value: true, message: "Pole jest wymagane" },
              }}
              name="playedOn"
              control={control}
              render={({ field }) => (
                <React.Fragment>
                  <TextField
                    label="Grane na"
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
                required: { value: true, message: "Pole jest wymagane" },
              }}
              name="availableOn"
              control={control}
              render={({ field }) => (
                <React.Fragment>
                  <TextField
                    label="Dostępne na"
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
                required: { value: true, message: "Pole jest wymagane" },
                maxLength: {
                  value: 50,
                  message: "Maksymalna długość wynosi 50 znaków",
                },
              }}
              name="producer"
              control={control}
              render={({ field }) => (
                <React.Fragment>
                  <TextField
                    label="Producent"
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
                required: { value: true, message: "Pole jest wymagane" },
                min: { value: 1, message: "Minimalna wartość wynosi 1" },
                max: {
                  value: 1000,
                  message: "Maksymalna wartość wynosi 1000",
                },
              }}
              name="playTime"
              control={control}
              render={({ field }) => (
                <React.Fragment>
                  <TextField
                    label="Czas gry"
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
              required: { value: true, message: "Pole jest wymagane" },
              maxLength: {
                value: 400,
                message: "Maksymalna długość wynosi 400 znaków",
              },
            }}
            name="shortDescription"
            control={control}
            render={({ field }) => (
              <React.Fragment>
                <TextField
                  multiline
                  rows={4}
                  label="Wstęp do artykułu"
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
              required: { value: true, message: "Pole jest wymagane" },
              maxLength: {
                value: 5000,
                message: "Maksymalna długość wynosi 5000 znaków",
              },
            }}
            name="longDescription"
            control={control}
            render={({ field }) => (
              <React.Fragment>
                <TextField
                  multiline
                  rows={10}
                  label="Artykuł"
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
                "Edytuj artykuł"
              ) : (
                <React.Fragment>
                  Zapisz <KeyboardDoubleArrowRightIcon />
                </React.Fragment>
              )}
            </Button>
          ) : (
            <Button type="submit" variant="contained" disabled>
              Nie dostępne
            </Button>
          )}
        </Stack>
      </FormControl>
    </form>
  );
}
