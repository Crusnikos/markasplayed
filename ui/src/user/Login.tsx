import React, { Dispatch, SetStateAction, useState } from "react";
import ReactDOM from "react-dom";
import {
  Button,
  Dialog as DialogMUI,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormHelperText,
  IconButton,
  Stack,
  TextField,
} from "@mui/material";
import { Dialog } from "../Dialog";
import { makeStyles } from "tss-react/mui";
import { Controller, useForm } from "react-hook-form";
import { LoginRequest, useFirebaseAuth } from "../firebase";
import CloseIcon from "@mui/icons-material/Close";
import LoadingIndicator from "../components/LoadingIndicator";

const useStyles = makeStyles()((theme) => ({
  warning: {
    backgroundColor: theme.palette.warning.light,
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    borderRadius: "10px",
  },
  error: {
    backgroundColor: theme.palette.error.light,
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    borderRadius: "10px",
    color: theme.palette.common.white,
  },
  helperMargin: {
    marginBottom: "16px",
  },
  closeIcon: {
    position: "absolute",
    right: 10,
    top: 10,
  },
}));

export default function Login(props: {
  openDialog: Dispatch<SetStateAction<Dialog>>;
}) {
  const { classes } = useStyles();
  const { app } = useFirebaseAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { openDialog } = props;
  const closeDialog = () => {
    openDialog({ type: undefined, data: undefined, images: undefined });
  };

  function checkEmailFormat(value: string): boolean {
    return /\S+@\S+\.\S+/.test(value);
  }

  const defaultValues = {
    email: "",
    password: "",
  };

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<LoginRequest>({
    defaultValues,
  });

  const onSubmit = async (formData: LoginRequest) => {
    setLoading(true);
    try {
      await app!
        .auth()
        .signInWithEmailAndPassword(formData.email, formData.password);
      closeDialog();
    } catch {
      setErrorMessage(
        "Nie udało się zalogować, sprawdź poprawność danych i spróbuj ponownie"
      );
      setLoading(false);
    }
  };

  const login = loading ? (
    <DialogMUI open={true} onClose={closeDialog} fullWidth>
      <DialogContent>
        <LoadingIndicator message="Proszę czekać, trwa logowanie" />
      </DialogContent>
    </DialogMUI>
  ) : (
    <DialogMUI open={true} onClose={closeDialog} fullWidth>
      <DialogTitle>
        Login
        <IconButton
          aria-label="close"
          onClick={closeDialog}
          className={classes.closeIcon}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <DialogContentText
          className={errorMessage ? classes.error : classes.warning}
        >
          {errorMessage ??
            "Logowanie dostępne tylko dla użytkowników administracji"}
        </DialogContentText>
        <form autoComplete="off" noValidate onSubmit={handleSubmit(onSubmit)}>
          <FormControl fullWidth variant="outlined">
            <Stack direction="column">
              <Controller
                rules={{
                  required: { value: true, message: "Pole jest wymagane" },
                  maxLength: {
                    value: 50,
                    message: "Maksymalna długość wynosi 50 znaków",
                  },
                  validate: {
                    isEmail: (value) =>
                      checkEmailFormat(value) || "Niepoprawny adres email",
                  },
                }}
                name="email"
                control={control}
                render={({ field }) => (
                  <React.Fragment>
                    <TextField
                      autoComplete="username"
                      type="email"
                      label="Email"
                      InputLabelProps={{ shrink: true }}
                      size="small"
                      {...field}
                    />
                    <FormHelperText error className={classes.helperMargin}>
                      {errors.email?.message}
                    </FormHelperText>
                  </React.Fragment>
                )}
              />
              <Controller
                rules={{
                  required: { value: true, message: "Pole jest wymagane" },
                  minLength: {
                    value: 6,
                    message: "Minimalna długość wynosi 6 znaków",
                  },
                  maxLength: {
                    value: 50,
                    message: "Maksymalna długość wynosi 50 znaków",
                  },
                }}
                name="password"
                control={control}
                render={({ field }) => (
                  <React.Fragment>
                    <TextField
                      autoComplete="current-password"
                      type="password"
                      label="Password"
                      InputLabelProps={{ shrink: true }}
                      size="small"
                      {...field}
                    />
                    <FormHelperText error className={classes.helperMargin}>
                      {errors.password?.message}
                    </FormHelperText>
                  </React.Fragment>
                )}
              />
              <Button type="submit" variant="contained">
                Zaloguj
              </Button>
            </Stack>
          </FormControl>
        </form>
      </DialogContent>
    </DialogMUI>
  );

  return ReactDOM.createPortal(
    login,
    document.getElementById(`dialog-window`)!
  );
}
