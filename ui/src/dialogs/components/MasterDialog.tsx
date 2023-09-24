import React, { ReactNode } from "react";
import {
  Box,
  Breakpoint,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import i18next from "i18next";
import { DialogState } from "../state";
import { stopPropagationForTab } from "../../utils/stopPropagationForTab";
import CloseIcon from "@mui/icons-material/Close";
import { makeStyles } from "tss-react/mui";
import InfoIcon from "@mui/icons-material/Info";
import ErrorIcon from "@mui/icons-material/Error";

const useStyles = makeStyles()((theme) => ({
  closeIcon: {
    color: theme.palette.common.white,
  },
  InfoErrorIcon: {
    paddingRight: theme.spacing(2),
  },
  topInfo: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
  },
  dialogContentWithoutPadding: {
    padding: "0px",
  },
  dialogContentWithAlwaysVisibleScroll: {
    overflowY: "scroll",
  },
  info: {
    backgroundColor: theme.palette.info.main,
    padding: theme.spacing(2),
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    borderRadius: theme.spacing(1),
    color: theme.palette.common.white,
  },
  error: {
    backgroundColor: theme.palette.error.main,
    padding: theme.spacing(2),
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    borderRadius: theme.spacing(1),
    color: theme.palette.common.white,
  },
}));

export type DialogValues = {
  open: boolean;
  errorMessage?: string;
  displayDialog: DialogState;
};

type DialogHelpers = {
  closeDialog: (setLoading?: boolean) => void;
};

export default function MasterDialog({
  children,
  values,
  helpers,
}: {
  children: ReactNode;
  values: DialogValues;
  helpers: DialogHelpers;
}): JSX.Element {
  const { open, errorMessage, displayDialog } = values;
  const { closeDialog } = helpers;
  const { classes } = useStyles();

  const setDialogWidth = (): Breakpoint => {
    switch (displayDialog) {
      case "addArticle":
        return "sm";
      case "editArticle":
        return "sm";
      default:
        return "xs";
    }
  };

  const setContentTextMessage = (): string => {
    switch (displayDialog) {
      case "login":
        return "subtitle.login";
      case "addArticle":
        return "subtitle.article";
      case "editArticle":
        return "subtitle.article";
      default:
        return "";
    }
  };

  const messageBox = (): JSX.Element => {
    return (
      <Grid
        container
        direction="row"
        justifyContent="flex-start"
        alignItems="center"
        className={errorMessage ? classes.error : classes.info}
      >
        <Grid item xs="auto" className={classes.InfoErrorIcon}>
          {errorMessage ? (
            <ErrorIcon fontSize="medium" />
          ) : (
            <InfoIcon fontSize="medium" />
          )}
        </Grid>
        <Grid item xs>
          <Typography variant="body1">
            {errorMessage ?? i18next.t(setContentTextMessage())}
          </Typography>
        </Grid>
      </Grid>
    );
  };

  const isArticleDialog =
    displayDialog === "addArticle" || displayDialog === "editArticle";

  return (
    <Dialog
      onKeyDown={stopPropagationForTab}
      open={open}
      onClose={() => closeDialog()}
      fullWidth={true}
      maxWidth={setDialogWidth()}
    >
      <DialogTitle className={classes.topInfo}>
        <Grid container direction="row" alignItems="center">
          <Grid item>
            <Typography variant="h6">
              {i18next.t(`title.${displayDialog}`)}
            </Typography>
          </Grid>
          <Box sx={{ flexGrow: 1 }} />
          <Grid item>
            <IconButton
              aria-label="close"
              onClick={() => closeDialog()}
              className={classes.closeIcon}
            >
              <CloseIcon />
            </IconButton>
          </Grid>
        </Grid>
      </DialogTitle>
      <DialogContent
        className={`${
          displayDialog === "author" ? classes.dialogContentWithoutPadding : ""
        } ${
          isArticleDialog === true
            ? classes.dialogContentWithAlwaysVisibleScroll
            : ""
        }`}
      >
        {displayDialog !== "author" && messageBox()}
        {children}
      </DialogContent>
    </Dialog>
  );
}
