import React, { Dispatch, SetStateAction, useState } from "react";
import {
  AppBar,
  Box,
  IconButton,
  Menu,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Link } from "react-router-dom";
import { makeStyles } from "tss-react/mui";
import { AccountCircle } from "@mui/icons-material";
import MenuItem from "@mui/material/MenuItem";
import { Dialog } from "../Dialog";
import { useFirebaseAuth } from "../firebase";
import i18next from "i18next";

const useStyles = makeStyles()((theme) => ({
  toolbar: {
    backgroundColor: theme.palette.primary.main,
  },
  logo: { color: theme.palette.common.white, textDecoration: "none" },
}));

export default function TopMenu(props: {
  openDialog: Dispatch<SetStateAction<Dialog>>;
}): JSX.Element {
  const { classes } = useStyles();
  const { openDialog } = props;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { app, authenticated } = useFirebaseAuth();

  const theme = useTheme();
  const logo = useMediaQuery(theme.breakpoints.up("sm")) ? "MAPlayed" : "MAP";

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAddArticleClick = () => {
    setAnchorEl(null);
    openDialog({ type: "addArticle", data: undefined, images: undefined });
  };

  const handleAuthorsClick = () => {
    setAnchorEl(null);
    openDialog({ type: "authors", data: undefined, images: undefined });
  };

  const handleLoginClick = () => {
    setAnchorEl(null);
    openDialog({ type: "loginUser", data: undefined, images: undefined });
  };

  const handleLogoutClick = async () => {
    setAnchorEl(null);
    await app!.auth().signOut();
  };

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
          <MenuItem onClick={handleAddArticleClick}>
            {i18next.t("title.addArticle")}
          </MenuItem>
          <MenuItem onClick={handleAuthorsClick}>
            {i18next.t("title.authors")}
          </MenuItem>
          {!authenticated ? (
            <MenuItem onClick={handleLoginClick}>
              {i18next.t("title.login")}
            </MenuItem>
          ) : (
            <MenuItem onClick={handleLogoutClick}>
              {i18next.t("title.logout")}
            </MenuItem>
          )}
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
