import i18next from "i18next";
import React, { useState, useMemo } from "react";
import { MaintenceState, DialogProps } from "./state";
import { MenuItem, Typography } from "@mui/material";
import PencilButton from "../components/PencilButton";
import Article from "./Article";
import Login from "./Login";
import Author from "./Author";

export function DialogController(props: DialogProps): JSX.Element {
  const { displayDialog } = props;
  const [maintence, setMaintence] = useState<MaintenceState>(undefined);
  const [open, setOpen] = useState<boolean>(false);

  const closeDialog = () => {
    setMaintence(undefined);
    setOpen(false);
  };

  const dialogButtons = useMemo(() => {
    switch (displayDialog) {
      case "editArticle":
        return <PencilButton setOpen={setOpen} />;
      default: {
        return createMenuItem(props.setAnchorEl);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function createMenuItem(
    setAnchorEl: (element: null | HTMLElement) => void
  ): JSX.Element {
    return (
      <MenuItem
        onClick={() => {
          setAnchorEl(null);
          setOpen(true);
        }}
      >
        <Typography>{i18next.t(`title.${displayDialog}`)}</Typography>
      </MenuItem>
    );
  }

  if (open === true && displayDialog === "addArticle") {
    return (
      <Article
        open={open}
        maintence={maintence}
        closeDialog={closeDialog}
        setMaintence={setMaintence}
        setResponseOnSubmit={props.setResponseOnSubmit}
      />
    );
  }

  if (open === true && displayDialog === "editArticle") {
    return (
      <Article
        open={open}
        maintence={maintence}
        data={props.data}
        images={props.images}
        closeDialog={closeDialog}
        setMaintence={setMaintence}
        setResponseOnSubmit={props.setResponseOnSubmit}
        setSyncRequired={props.setSyncRequired}
      />
    );
  }

  if (open === true && displayDialog === "login") {
    return (
      <Login
        open={open}
        maintence={maintence}
        closeDialog={closeDialog}
        setMaintence={setMaintence}
      />
    );
  }

  if (open === true && displayDialog === "author") {
    return (
      <Author
        open={open}
        maintence={maintence}
        closeDialog={closeDialog}
        setMaintence={setMaintence}
      />
    );
  }

  return <React.Fragment>{dialogButtons}</React.Fragment>;
}
