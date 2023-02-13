import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import Snackbar from "@mui/material/Snackbar";
import {
  Alert,
  AlertColor,
  Slide,
  SlideProps,
  Typography,
} from "@mui/material";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()(() => ({
  alert: {
    width: "100%",
    whiteSpace: "pre-wrap",
  },
}));

export type DispatchSnackbar = Dispatch<
  SetStateAction<{
    message: string | undefined;
    severity: AlertColor | undefined;
  }>
>;

function displaySubmessages(message: string) {
  return (
    <Typography
      variant="subtitle1"
      lineHeight={"0.6rem"}
      fontSize={13}
    >{`\n${message}`}</Typography>
  );
}

function TransitionRight(props: SlideProps) {
  return <Slide {...props} direction="right" />;
}

export default function SnackbarDialog(props: {
  message: string;
  clearMessage: DispatchSnackbar;
  severity?: AlertColor;
}): JSX.Element {
  const { classes } = useStyles();
  const { message, clearMessage, severity } = props;
  const [open, setOpen] = useState(true);
  const [splitMessage, setSplitMessage] = useState<string[]>([]);

  useEffect(() => {
    if (message === undefined || message === "") return;

    setOpen(true);
    setSplitMessage(message.split(";"));
  }, [message]);

  return (
    <Snackbar
      open={open}
      TransitionComponent={TransitionRight}
      autoHideDuration={12000}
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
        {splitMessage[0]}
        {splitMessage.slice(1).map((sm) => displaySubmessages(sm))}
      </Alert>
    </Snackbar>
  );
}
