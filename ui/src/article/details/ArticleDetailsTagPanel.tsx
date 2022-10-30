import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { makeStyles } from "tss-react/mui";
import {
  Chip,
  Grid,
  Skeleton,
  SxProps,
  Theme,
  TextField,
  MenuItem,
  InputAdornment,
  Typography,
} from "@mui/material";
import i18next from "i18next";
import {
  createTag,
  deactivateTag,
  getArticleTags,
  getTagLookup,
  LookupTagData,
} from "../api/tag";
import { useFirebaseAuth } from "../../firebase";
import { useParams } from "react-router-dom";
import { tryParseInt } from "../../parsing";
import SearchIcon from "@mui/icons-material/Search";
import { DispatchSnackbar } from "../../components/SnackbarDialog";

const useStyles = makeStyles()((theme) => ({
  functionChip: { padding: theme.spacing(1) },
  tagChip: {
    padding: theme.spacing(1),
    color: theme.palette.common.white,
    "& .MuiChip-deleteIcon": {
      color: "white",
    },
  },
  skeleton: {
    height: theme.spacing(6),
  },
}));

function ColorPicker(groupName: string): SxProps<Theme> | undefined {
  switch (groupName) {
    case "E":
      return {
        backgroundColor: "#5fb02c",
      };
    case "G":
      return {
        backgroundColor: "#ad42f5",
      };
    case "M":
      return {
        backgroundColor: "#429ef5",
      };
    case "P":
      return {
        backgroundColor: "#f54275",
      };
    case "T":
      return {
        backgroundColor: "#f56c42",
      };
    default:
      return {
        backgroundColor: "#f5429c",
      };
  }
}

export default function ArticleDetailsTagPanel(props: {
  setSnackbar: DispatchSnackbar;
  tags: LookupTagData[];
  setTags: Dispatch<SetStateAction<LookupTagData[] | undefined>>;
}): JSX.Element {
  const { classes } = useStyles();
  const { tags, setTags, setSnackbar } = props;

  const [edit, setEdit] = useState<boolean>(false);

  const [lookup, setLookup] = useState<LookupTagData[] | undefined>(undefined);
  const [searchResults, setSearchResults] = useState<
    LookupTagData[] | undefined
  >(undefined);
  const [selectedTags, setSelectedTags] = useState<LookupTagData[]>([]);

  const [loadingTags, setLoadingTags] = useState<boolean>(false);
  const { app, authenticated } = useFirebaseAuth();

  const params = useParams();
  const parsedId = tryParseInt(params.id);

  useEffect(() => {
    async function fetchTagLookup() {
      const lookup = await getTagLookup();
      setLookup(lookup);
    }

    if (edit) {
      setSearchResults(undefined);

      void fetchTagLookup();
    } else {
      setSelectedTags([]);
    }
  }, [edit]);

  const handleDelete = async (tagId: number) => {
    setLoadingTags(true);
    const token = await app!.auth().currentUser?.getIdToken();
    if (!token) {
      throw new Error();
    }

    if (!parsedId) {
      throw new Error();
    }

    try {
      await deactivateTag({ ArticleId: parsedId, TagId: tagId }, token);
      const updatedtags = await getArticleTags({ id: parsedId });
      setTags(updatedtags);
    } catch {
      setSnackbar({
        message: i18next.t("details.tag.error"),
        severity: `error`,
      });
    }
  };

  const handleSearch = (value: string) => {
    if (value.length > 2 && lookup) {
      const fullResult = lookup.filter((item) =>
        i18next
          .t(`tags.${item.groupName.toLowerCase()}.${item.name}`)
          .includes(value.toLocaleLowerCase())
      );

      const trimedResult = fullResult.filter((result) => {
        return !tags.find((item) => item.name === result.name);
      });

      if (trimedResult.length > 0) {
        setSearchResults(trimedResult);
      }
    }
  };

  const handleAddToSelected = async (tag: LookupTagData) => {
    if (!!selectedTags.find((item) => item === tag)) {
      const temp = selectedTags.filter((item) => item !== tag);
      setSelectedTags(temp);
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAddToTags = async () => {
    if (selectedTags.length < 1) {
      return;
    }

    setLoadingTags(true);
    const token = await app!.auth().currentUser?.getIdToken();
    if (!token) {
      throw new Error();
    }

    if (!parsedId) {
      throw new Error();
    }

    const request = selectedTags.map(async (tag) => {
      await createTag({ ArticleId: parsedId, TagId: tag.id }, token);
    });

    return Promise.all(request)
      .then(async () => {
        setSelectedTags([]);
        const updatedtags = await getArticleTags({ id: parsedId });
        setTags(updatedtags);
      })
      .catch(() =>
        setSnackbar({
          message: i18next.t("details.tag.error"),
          severity: `error`,
        })
      );
  };

  if (loadingTags) {
    return (
      <Grid
        container
        item
        direction="column"
        justifyContent="flex-start"
        alignItems="stretch"
      >
        <Skeleton animation="wave" className={classes.skeleton} />
      </Grid>
    );
  }

  return (
    <React.Fragment>
      <Grid container item alignItems="flex-start" spacing={1}>
        {tags.length > 0 &&
          tags.map((item) => (
            <Grid item key={item.id}>
              {edit ? (
                <Chip
                  className={classes.tagChip}
                  sx={ColorPicker(item.groupName)}
                  size="medium"
                  label={i18next
                    .t(`tags.${item.groupName.toLowerCase()}.${item.name}`)
                    .toLocaleUpperCase()}
                  onDelete={async () => {
                    await handleDelete(item.id);
                    setLoadingTags(false);
                  }}
                  disabled={!authenticated}
                />
              ) : (
                <Chip
                  className={classes.tagChip}
                  sx={ColorPicker(item.groupName)}
                  size="medium"
                  label={i18next
                    .t(`tags.${item.groupName.toLowerCase()}.${item.name}`)
                    .toUpperCase()}
                />
              )}
            </Grid>
          ))}
        {!edit && (
          <Grid item>
            <Chip
              className={classes.functionChip}
              size="medium"
              label={i18next.t("details.tag.edit").toLocaleUpperCase()}
              variant="outlined"
              onClick={() => setEdit(!edit)}
            />
          </Grid>
        )}
      </Grid>
      {edit && lookup && (
        <Grid container item spacing={1}>
          <Grid container item sm md={4}>
            <TextField
              label={i18next.t("details.tag.search")}
              InputLabelProps={{ shrink: true }}
              size="small"
              fullWidth
              select
              value={selectedTags}
              SelectProps={{
                multiple: true,
                onClose: () => {
                  setSearchResults(undefined);
                },
                renderValue: () => {
                  if (selectedTags.length === 0) {
                    return;
                  }

                  return selectedTags
                    .map((item) =>
                      i18next
                        .t(`tags.${item.groupName.toLowerCase()}.${item.name}`)
                        .toLocaleUpperCase()
                    )
                    .join(", ");
                },
              }}
            >
              <Grid container direction="column">
                <Grid item sx={{ margin: "8px" }}>
                  <TextField
                    size="small"
                    autoFocus
                    placeholder={i18next.t("details.tag.placeholder")}
                    fullWidth
                    onChange={(event) => {
                      setSearchResults(undefined);
                      handleSearch(event.target.value);
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                {searchResults ? (
                  searchResults.map((item) => (
                    <Grid item key={item.id}>
                      <MenuItem
                        value={item.id}
                        onClick={async () => await handleAddToSelected(item)}
                        selected={
                          !!selectedTags.find((result) => result === item)
                        }
                      >
                        {i18next
                          .t(
                            `tags.${item.groupName.toLowerCase()}.${item.name}`
                          )
                          .toLocaleUpperCase()}
                      </MenuItem>
                    </Grid>
                  ))
                ) : (
                  <Grid item>
                    <Typography variant="subtitle2" sx={{ marginLeft: "8px" }}>
                      {i18next.t("details.tag.noResults")}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </TextField>
          </Grid>
          <Grid container item spacing={1} sm>
            <Grid item>
              <Chip
                className={classes.functionChip}
                size="medium"
                label={i18next.t("details.tag.confirm").toLocaleUpperCase()}
                variant="outlined"
                color="primary"
                disabled={selectedTags.length < 1 || !authenticated}
                onClick={async () => {
                  await handleAddToTags();
                  setLoadingTags(false);
                }}
              />
            </Grid>
            <Grid item>
              <Chip
                className={classes.functionChip}
                size="medium"
                label={i18next.t("details.tag.finish").toLocaleUpperCase()}
                variant="outlined"
                color="error"
                onClick={() => setEdit(!edit)}
              />
            </Grid>
          </Grid>
        </Grid>
      )}
    </React.Fragment>
  );
}
