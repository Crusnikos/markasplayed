import React, { useState } from "react";
import {
  AppBar,
  Box,
  IconButton,
  Menu,
  Toolbar,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";
import { makeStyles } from "tss-react/mui";
import { AccountCircle } from "@mui/icons-material";
import MenuItem from "@mui/material/MenuItem";
import { useFirebaseAuth } from "../../context/FirebaseProvider";
import i18next from "i18next";
import { DispatchSnackbar } from "../../components/SnackbarDialog";
import { DialogController } from "../../dialogs";

const useStyles = makeStyles()((theme) => ({
  toolbar: {
    backgroundColor: theme.palette.primary.main,
    height: theme.spacing(8),
  },
  logo: { color: theme.palette.common.white, textDecoration: "none" },
}));

export default function TopMenu(props: {
  setSnackbar: DispatchSnackbar;
  desktopScreen: boolean;
}): JSX.Element {
  const { classes } = useStyles();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { app, authenticated } = useFirebaseAuth();

  const logo = props.desktopScreen ? "MAPlayed" : "MAP";

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogoutClick = async () => {
    setAnchorEl(null);
    await app!.auth().signOut();
  };

  const userLoginState = !authenticated ? (
    <DialogController setAnchorEl={setAnchorEl} displayDialog="login" />
  ) : (
    <MenuItem onClick={handleLogoutClick}>{i18next.t("title.logout")}</MenuItem>
  );

  return (
    <AppBar position="sticky">
      <Toolbar className={classes.toolbar}>
        <Typography component="h1" variant="h6" color="inherit" noWrap>
          <Link to="/" className={classes.logo}>
            {logo}
          </Link>
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <IconButton
          size="large"
          aria-label="account"
          aria-controls="menu-appbar"
          color="inherit"
          onClick={handleMenu}
        >
          <AccountCircle />
        </IconButton>
        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          keepMounted
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <DialogController
            displayDialog="addArticle"
            setAnchorEl={setAnchorEl}
            setResponseOnSubmit={props.setSnackbar}
          />
          <DialogController displayDialog="author" setAnchorEl={setAnchorEl} />
          {userLoginState}
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
