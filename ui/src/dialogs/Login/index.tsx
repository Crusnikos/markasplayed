import React, { Dispatch, SetStateAction, Suspense, useState } from "react";
import { LoginRequest, useFirebaseAuth } from "../../context/FirebaseProvider";
import { MaintenceState } from "../state";
import i18next from "i18next";
import MasterDialog from "../components/MasterDialog";
import MaintenceDialog from "../components/MaintenceDialog";
import { CircularProgress, Grid } from "@mui/material";
import ErrorBoundary from "../../components/ErrorBoundary";

const Content = React.lazy(() => import("./Content"));

export default function Login(props: {
  open: boolean;
  maintence: MaintenceState;
  closeDialog: () => void;
  setMaintence: Dispatch<SetStateAction<MaintenceState>>;
}): JSX.Element {
  const { app } = useFirebaseAuth();
  const { open, maintence, setMaintence, closeDialog } = props;
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  );

  const onSubmit = async (formData: LoginRequest) => {
    setMaintence("LoadingState");
    try {
      await app!
        .auth()
        .signInWithEmailAndPassword(formData.email, formData.password);
    } catch {
      setErrorMessage(i18next.t("form.error.login"));
      setMaintence(undefined);
    }
  };

  if (maintence) {
    return (
      <MaintenceDialog
        open={open}
        displayMaintence={"LoadingState"}
        progressInfoMessage={undefined}
      />
    );
  }

  return (
    <MasterDialog
      values={{
        open: open,
        errorMessage: errorMessage,
        displayDialog: "login",
      }}
      helpers={{
        closeDialog,
      }}
    >
      <ErrorBoundary
        open={open}
        closeDialog={closeDialog}
        displayType={"Dialog"}
      >
        <Suspense
          fallback={
            <Grid
              item
              container
              direction="column"
              alignItems="center"
              justifyContent="center"
              minHeight={"20vh"}
              minWidth={"100%"}
            >
              <CircularProgress size={50} />
            </Grid>
          }
        >
          <Content onSubmit={onSubmit} />
        </Suspense>
      </ErrorBoundary>
    </MasterDialog>
  );
}
