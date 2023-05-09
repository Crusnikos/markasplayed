import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { makeStyles } from "tss-react/mui";
import {
  Chip,
  Grid,
  Skeleton,
  SxProps,
  Theme,
  Typography,
  Card,
  CardContent,
  Divider,
  useTheme,
  useMediaQuery,
  TextField,
  InputAdornment,
  MenuItem,
} from "@mui/material";
import i18next from "i18next";
import {
  createTag,
  deactivateTag,
  getArticleTags,
  LookupTagData,
} from "../api/tag";
import { useFirebaseAuth } from "../../firebase";
import { useParams } from "react-router-dom";
import { tryParseInt } from "../../parsing";
import SearchIcon from "@mui/icons-material/Search";
import { DispatchSnackbar } from "../../components/SnackbarDialog";
import { getLookup } from "../api/lookup";
import DoneIcon from "@mui/icons-material/Done";
import CloseIcon from "@mui/icons-material/Close";

const useStyles = makeStyles()((theme) => ({
  functionChip: {
    padding: theme.spacing(1),
    margin: theme.spacing(0.5),
    color: theme.palette.common.white,
    fontWeight: "bold",
    borderColor: theme.palette.common.white,
    boxShadow: "8px 8px 29px -5px rgba(66, 68, 90, 1)",
  },
  componentTitle: { textShadow: "5px 5px 10px rgba(66, 68, 90, 1)" },
  tagChip: {
    padding: theme.spacing(0.5),
    color: theme.palette.common.white,
    fontWeight: "bold",
    "& .MuiChip-deleteIcon": {
      color: "white",
    },
    boxShadow: "8px 8px 15px -5px rgba(66, 68, 90, 1)",
  },
  searchBox: {
    boxShadow: "8px 8px 29px -5px rgba(66, 68, 90, 1)",
  },
  skeleton: {
    height: theme.spacing(6),
  },
  infoBox: {
    color: theme.palette.common.white,
    backgroundColor: theme.palette.primary.light,
    width: "100%",
  },
  infoBoxItem: {
    padding: theme.spacing(1),
  },
  divider: {
    borderColor: theme.palette.common.white,
    borderWidth: theme.spacing(0.2),
    marginBottom: theme.spacing(1),
  },
  searchNoResults: {
    marginLeft: theme.spacing(1),
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

  const theme = useTheme();
  const desktopScreen = useMediaQuery(theme.breakpoints.up("sm"));

  useEffect(() => {
    async function fetchTagLookup() {
      const lookup = await getLookup({ lookupName: "tagData" });
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

  const buttonsSection =
    !edit || !lookup ? (
      <Grid item>
        <Chip
          className={classes.functionChip}
          size="medium"
          label={i18next.t("details.tag.edit").toLocaleUpperCase()}
          variant="outlined"
          onClick={() => setEdit(!edit)}
        />
      </Grid>
    ) : (
      <Grid item>
        <Chip
          className={classes.functionChip}
          size="medium"
          label={
            desktopScreen ? (
              i18next.t("details.tag.confirm").toLocaleUpperCase()
            ) : (
              <DoneIcon />
            )
          }
          variant="outlined"
          disabled={selectedTags.length < 1 || !authenticated}
          onClick={async () => {
            await handleAddToTags();
            setLoadingTags(false);
          }}
        />
        <Chip
          className={classes.functionChip}
          size="medium"
          label={
            desktopScreen ? (
              i18next.t("details.tag.finish").toLocaleUpperCase()
            ) : (
              <CloseIcon />
            )
          }
          variant="outlined"
          onClick={() => setEdit(!edit)}
        />
      </Grid>
    );

  const tagSection = (
    <Grid container item md spacing={1}>
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
    </Grid>
  );

  const searchSection = (
    <Grid container item md={4}>
      <TextField
        label={i18next.t("details.tag.search")}
        InputLabelProps={{ shrink: true, htmlFor: `search-section` }}
        inputProps={{ id: `search-section` }}
        size="small"
        fullWidth
        select
        value={selectedTags}
        SelectProps={{
          className: classes.searchBox,
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
                  selected={!!selectedTags.find((result) => result === item)}
                >
                  {i18next
                    .t(`tags.${item.groupName.toLowerCase()}.${item.name}`)
                    .toLocaleUpperCase()}
                </MenuItem>
              </Grid>
            ))
          ) : (
            <Grid item>
              <Typography
                variant="subtitle2"
                className={classes.searchNoResults}
              >
                {i18next.t("details.tag.noResults")}
              </Typography>
            </Grid>
          )}
        </Grid>
      </TextField>
    </Grid>
  );

  return (
    <Card className={classes.infoBox}>
      <CardContent>
        <Grid container direction="column">
          <Grid
            container
            item
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            className={classes.infoBoxItem}
          >
            <Typography
              variant="h5"
              fontWeight="bold"
              className={classes.componentTitle}
            >
              {i18next.t("details.title.tag")}
            </Typography>
            {buttonsSection}
          </Grid>
          <Grid item>
            <Divider className={classes.divider} flexItem />
          </Grid>
          <Grid
            container
            item
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={2}
          >
            {edit && lookup && searchSection}
            {tagSection}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
