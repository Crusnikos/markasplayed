import React, { Dispatch, SetStateAction, useEffect } from "react";
import Snackbar from "@mui/material/Snackbar";
import { Alert, AlertColor } from "@mui/material";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()(() => ({
  alert: {
    width: "100%",
  },
}));

export default function SnackbarDialog(props: {
  message: string | undefined;
  clearMessage: Dispatch<
    SetStateAction<{
      message: string | undefined;
      severity: AlertColor | undefined;
    }>
  >;
  severity?: AlertColor;
}): JSX.Element {
  const { classes } = useStyles();
  const { message, clearMessage, severity } = props;
  const [open, setOpen] = React.useState(true);

  useEffect(() => {
    setOpen(true);
  }, [message]);

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={() => clearMessage({ message: undefined, severity: undefined })}
    >
      <Alert
        onClose={() =>
          clearMessage({ message: undefined, severity: undefined })
        }
        variant="filled"
        severity={severity ?? `info`}
        className={classes.alert}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
