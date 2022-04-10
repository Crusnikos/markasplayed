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
import { Dialogs } from "../components/Dialogs";
import { useAuth } from "../UserProvider";
import { SignOut } from "../user/firebase";

const useStyles = makeStyles()((theme) => ({
  toolbar: {
    backgroundColor: theme.palette.primary.main,
  },
  logo: { color: theme.palette.common.white, textDecoration: "none" },
}));

export default function TopMenu(props: {
  openDialog: Dispatch<SetStateAction<Dialogs>>;
}): JSX.Element {
  const { classes } = useStyles();
  const { openDialog } = props;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { authenticated } = useAuth();

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
    openDialog({ type: "AddArticle", data: undefined, images: undefined });
  };

  const handleAuthorsClick = () => {
    setAnchorEl(null);
    openDialog({ type: "Authors", data: undefined, images: undefined });
  };

  const handleLoginClick = () => {
    setAnchorEl(null);
    openDialog({ type: "LoginUser", data: undefined, images: undefined });
  };

  const handleLogoutClick = async () => {
    setAnchorEl(null);
    await SignOut();
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
          <MenuItem onClick={handleAddArticleClick}>Dodaj artykuł</MenuItem>
          <MenuItem onClick={handleAuthorsClick}>Autorzy</MenuItem>
          {!authenticated ? (
            <MenuItem onClick={handleLoginClick}>
              Zaloguj(administracja)
            </MenuItem>
          ) : (
            <MenuItem onClick={handleLogoutClick}>Wyloguj</MenuItem>
          )}
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
