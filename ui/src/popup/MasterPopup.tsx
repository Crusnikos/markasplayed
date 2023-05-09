import {
  Box,
  Breakpoint,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  Typography,
} from "@mui/material";
import React, { ReactNode } from "react";
import i18next from "i18next";
import ExceptionPage from "../components/ExceptionPage";
import LoadingIndicator from "../components/LoadingIndicator";
import { DialogState, MaintenceState } from "./state";
import { stopPropagationForTab } from "../stopPropagationForTab";
import CloseIcon from "@mui/icons-material/Close";
import { makeStyles } from "tss-react/mui";
import EditIcon from "@mui/icons-material/Edit";
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
  edit: {
    cursor: "pointer",
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

export type PopupValues = {
  open: boolean;
  optionalMessage?: string;
  errorMessage?: string;
  progressInfoMessage?: string;
  displayMenuItem: boolean;
  displayMaintence: MaintenceState;
  displayDialog: DialogState;
};

type PopupHelpers = {
  setAnchorEl?: (element: null | HTMLElement) => void;
  setOpen: (open: boolean) => void;
  closeDialog: () => void;
};

export default function MasterPopup({
  children,
  values,
  helpers,
}: {
  children: ReactNode;
  values: PopupValues;
  helpers: PopupHelpers;
}): JSX.Element {
  const {
    open,
    optionalMessage,
    errorMessage,
    progressInfoMessage,
    displayMenuItem,
    displayMaintence,
    displayDialog,
  } = values;
  const { setAnchorEl, setOpen, closeDialog } = helpers;
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

  const editButton = (
    <EditIcon
      fontSize="large"
      className={classes.edit}
      onClick={() => setOpen(true)}
    />
  );

  const menuItem = (
    <MenuItem
      onClick={() => {
        setAnchorEl!(null);
        setOpen(true);
      }}
    >
      <Typography>{i18next.t(`title.${displayDialog}`)}</Typography>
    </MenuItem>
  );

  const maintenceDialog = (
    <React.Fragment>
      {displayMenuItem && menuItem}
      {displayDialog === "editArticle" && editButton}
      <Dialog
        open={open}
        fullWidth
        onClose={displayMaintence === "ErrorState" ? closeDialog : undefined}
        disableEscapeKeyDown={
          displayMaintence === "LoadingState" ? true : false
        }
      >
        <DialogContent>
          {displayMaintence === "ErrorState" && (
            <ExceptionPage message={optionalMessage ? optionalMessage : ""} />
          )}
          {displayMaintence === "LoadingState" && (
            <LoadingIndicator
              message={i18next.t("loading.defaultMessage")}
              currentProgressInfo={progressInfoMessage}
            />
          )}
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );

  const isArticleDialog =
    displayDialog === "addArticle" || displayDialog === "editArticle";

  const dialog = (
    <React.Fragment>
      {displayMenuItem && menuItem}
      {displayDialog === "editArticle" && editButton}
      <Dialog
        onKeyDown={stopPropagationForTab}
        open={open}
        onClose={closeDialog}
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
                onClick={closeDialog}
                className={classes.closeIcon}
              >
                <CloseIcon />
              </IconButton>
            </Grid>
          </Grid>
        </DialogTitle>
        <DialogContent
          className={`${
            displayDialog === "authors"
              ? classes.dialogContentWithoutPadding
              : ""
          } ${
            isArticleDialog === true
              ? classes.dialogContentWithAlwaysVisibleScroll
              : ""
          }`}
        >
          {displayDialog !== "authors" && messageBox()}
          {children}
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );

  return (
    <React.Fragment>
      {displayMaintence ? maintenceDialog : dialog}
    </React.Fragment>
  );
}
