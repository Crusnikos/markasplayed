import React from "react";
import { MenuItem as Item, Typography } from "@mui/material";
import i18next from "i18next";

export default function PencilButton(props: {
  displayDialog: string;
  setAnchorEl: (element: null | HTMLElement) => void;
  setOpen: (element: boolean) => void;
}): JSX.Element {
  const { displayDialog, setAnchorEl, setOpen } = props;

  return (
    <Item
      onClick={() => {
        setAnchorEl(null);
        setOpen(true);
      }}
    >
      <Typography>{i18next.t(`title.${displayDialog}`)}</Typography>
    </Item>
  );
}
