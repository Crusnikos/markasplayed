import React from "react";
import EditIcon from "@mui/icons-material/Edit";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()(() => ({
  edit: {
    cursor: "pointer",
  },
}));

export default function PencilButton(props: {
  setOpen: (element: boolean) => void;
}): JSX.Element {
  const { classes } = useStyles();
  const { setOpen } = props;

  return (
    <EditIcon
      fontSize="large"
      className={classes.edit}
      onClick={() => setOpen(true)}
    />
  );
}
