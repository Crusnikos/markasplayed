import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import ExceptionPage from "../components/ExceptionPage";
import LoadingIndicator from "../components/LoadingIndicator";
import CloseIcon from "@mui/icons-material/Close";
import { makeStyles } from "tss-react/mui";
import { AuthorData, getAuthorsListing } from "./api";
import AuthorItem from "./AuthorItem";
import Stepper from "../components/Stepper";
import i18next from "i18next";
import { stopPropagationForTab } from "../stopPropagationForTab";

const useStyles = makeStyles()((theme) => ({
  closeIcon: {
    color: theme.palette.common.white,
  },
  topInfo: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
  },
  navigation: {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.common.white,
  },
  content: {
    height: "550px",
  },
  container: {
    padding: theme.spacing(2),
  },
}));

export default function AuthorsListing(props: {
  setAnchorEl?: Dispatch<SetStateAction<null | HTMLElement>>;
}) {
  const { classes } = useStyles();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [authors, setAuthors] = useState<AuthorData[] | undefined>(undefined);
  const [activeStep, setActiveStep] = useState(0);

  const theme = useTheme();
  const logo = useMediaQuery(theme.breakpoints.up("sm"))
    ? "Mark as Played"
    : "MAP";

  const [open, setOpen] = useState<boolean>(false);
  const closeDialog = () => {
    setOpen(false);
  };

  useEffect(() => {
    async function fetchAuthors() {
      try {
        const authors = await getAuthorsListing();
        setAuthors(authors);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    if (!open) {
      return;
    }

    void fetchAuthors();
  }, [open]);

  const authorsMenuItem = (
    <MenuItem
      onClick={() => {
        props.setAnchorEl!(null);
        setOpen(true);
      }}
    >
      {i18next.t("title.authors")}
    </MenuItem>
  );

  if (loading) {
    return (
      <React.Fragment>
        {authorsMenuItem}
        <Dialog open={open} fullWidth disableEscapeKeyDown={true}>
          <DialogContent>
            <LoadingIndicator message={i18next.t("loading")} />
          </DialogContent>
        </Dialog>
      </React.Fragment>
    );
  }

  if (error) {
    return (
      <React.Fragment>
        {authorsMenuItem}
        <Dialog open={open} onClose={closeDialog} fullWidth>
          <DialogContent>
            <ExceptionPage message={i18next.t("author.error.retrieve")} />
          </DialogContent>
        </Dialog>
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      {authorsMenuItem}
      <Dialog
        onKeyDown={stopPropagationForTab}
        open={open}
        onClose={closeDialog}
        fullWidth
      >
        <DialogTitle className={classes.topInfo}>
          <Grid
            container
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
          >
            {`${i18next.t("title.authors")} ${logo}`}
            <IconButton
              aria-label="close"
              onClick={closeDialog}
              className={classes.closeIcon}
            >
              <CloseIcon />
            </IconButton>
          </Grid>
        </DialogTitle>
        <DialogContent className={classes.content}>
          <Grid
            container
            alignItems="center"
            justifyContent="center"
            direction="column"
            spacing={1}
            className={classes.container}
          >
            {authors &&
              authors.map((author) => (
                <AuthorItem data={author} key={author.id} />
              ))}
          </Grid>
        </DialogContent>
        <DialogActions className={classes.navigation}>
          <Stepper
            activeStep={activeStep}
            setActiveStep={setActiveStep}
            length={authors?.length ?? 0}
          />
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
