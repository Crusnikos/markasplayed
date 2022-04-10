import React, { useEffect } from "react";
import Snackbar from "@mui/material/Snackbar";

export default function SnackbarDialog(props: {
  message: string;
}): JSX.Element {
  const { message } = props;
  const [open, setOpen] = React.useState(true);

  const closeDialog = () => {
    setOpen(false);
  };

  useEffect(() => {
    setOpen(true);
  }, [message]);

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={closeDialog}
      message={message}
    />
  );
}
