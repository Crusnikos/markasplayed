import React, { ReactNode } from "react";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()(() => ({
  contentWrapper: {
    margin: "auto",
    minHeight: "95vh",
    maxWidth: "1200px",
  },
}));

export default function FlexWrapper({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const { classes } = useStyles();

  return <div className={classes.contentWrapper}>{children}</div>;
}
