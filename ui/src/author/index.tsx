import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
} from "@mui/material";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Dialogs } from "../components/Dialogs";
import ExceptionPage from "../components/ExceptionPage";
import LoadingIndicator from "../components/LoadingIndicator";
import CloseIcon from "@mui/icons-material/Close";
import { makeStyles } from "tss-react/mui";
import { AuthorData, getAuthorsListing } from "./api";
import AuthorItem from "./AuthorItem";
import CommonStepper from "../components/CommonStepper";

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
  openDialog: Dispatch<SetStateAction<Dialogs>>;
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
      <Dialog open={true} onClose={closeDialog} fullWidth>
        <DialogContent>
          <LoadingIndicator />
        </DialogContent>
      </Dialog>
    );

    return ReactDOM.createPortal(
      loadingDialog,
      document.getElementById(`dialog-window`)!
    );
  }

  if (error) {
    const errorDialog = (
      <Dialog open={true} onClose={closeDialog} fullWidth>
        <DialogContent>
          <ExceptionPage message="Wystąpił problem z pobraniem danych" />
        </DialogContent>
      </Dialog>
    );

    return ReactDOM.createPortal(
      errorDialog,
      document.getElementById(`dialog-window`)!
    );
  }

  const listingDialog = (
    <Dialog open={true} onClose={closeDialog} fullWidth>
      <DialogTitle className={classes.topInfo}>
        Autorzy na Mark as Played
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
          {authors?.map((author) => (
            <AuthorItem data={author} key={author.id} />
          ))}
        </Grid>
      </DialogContent>
      <DialogActions className={classes.navigation}>
        <CommonStepper
          activeStep={activeStep}
          setActiveStep={setActiveStep}
          length={authors?.length ?? 0}
        />
      </DialogActions>
    </Dialog>
  );

  return ReactDOM.createPortal(
    listingDialog,
    document.getElementById(`dialog-window`)!
  );
}
