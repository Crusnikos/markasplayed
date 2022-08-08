import {
  Dialog as DialogMUI,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
} from "@mui/material";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Dialog } from "../Dialog";
import ExceptionPage from "../components/ExceptionPage";
import LoadingIndicator from "../components/LoadingIndicator";
import CloseIcon from "@mui/icons-material/Close";
import { makeStyles } from "tss-react/mui";
import { AuthorData, getAuthorsListing } from "./api";
import AuthorItem from "./AuthorItem";
import Stepper from "../components/Stepper";
import i18next from "i18next";

const useStyles = makeStyles()((theme) => ({
  closeIcon: {
    position: "absolute",
    color: theme.palette.common.white,
    right: 8,
    top: 8,
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
  openDialog: Dispatch<SetStateAction<Dialog>>;
}) {
  const { classes } = useStyles();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [authors, setAuthors] = useState<AuthorData[] | undefined>(undefined);
  const [activeStep, setActiveStep] = useState(0);
  const { openDialog } = props;

  const closeDialog = () => {
    openDialog({ type: undefined, data: undefined, images: undefined });
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
    void fetchAuthors();
  }, []);

  if (loading) {
    const loadingDialog = (
      <DialogMUI open={true} onClose={closeDialog} fullWidth>
        <DialogContent>
          <LoadingIndicator message={i18next.t("loading")} />
        </DialogContent>
      </DialogMUI>
    );

    return ReactDOM.createPortal(
      loadingDialog,
      document.getElementById(`dialog-window`)!
    );
  }

  if (error) {
    const errorDialog = (
      <DialogMUI open={true} onClose={closeDialog} fullWidth>
        <DialogContent>
          <ExceptionPage message={i18next.t("author.error.retrieve")} />
        </DialogContent>
      </DialogMUI>
    );

    return ReactDOM.createPortal(
      errorDialog,
      document.getElementById(`dialog-window`)!
    );
  }

  const listingDialog = (
    <DialogMUI open={true} onClose={closeDialog} fullWidth>
      <DialogTitle className={classes.topInfo}>
        {i18next.t("title.authors")} Mark as Played
        <IconButton
          aria-label="close"
          onClick={closeDialog}
          className={classes.closeIcon}
        >
          <CloseIcon />
        </IconButton>
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
          {authors && (
            <AuthorItem
              data={authors[activeStep]}
              key={authors[activeStep].id}
            />
          )}
        </Grid>
      </DialogContent>
      <DialogActions className={classes.navigation}>
        <Stepper
          activeStep={activeStep}
          setActiveStep={setActiveStep}
          length={authors?.length ?? 0}
        />
      </DialogActions>
    </DialogMUI>
  );

  return ReactDOM.createPortal(
    listingDialog,
    document.getElementById(`dialog-window`)!
  );
}
