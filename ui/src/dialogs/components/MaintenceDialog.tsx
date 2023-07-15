import React from "react";
import { MaintenceProps } from "../state";
import { Dialog, DialogContent } from "@mui/material";
import LoadingIndicator from "../../components/LoadingIndicator";
import ExceptionPage from "../../components/ExceptionPage";
import i18next from "i18next";

export default function MaintenceDialog(props: MaintenceProps): JSX.Element {
  const { open, displayMaintence } = props;

  if (displayMaintence === "ErrorState") {
    return (
      <Dialog
        open={open}
        fullWidth
        onClose={props.closeDialog}
        disableEscapeKeyDown={false}
      >
        <DialogContent>
          <ExceptionPage
            message={
              props.message ??
              "Connection problems or we are offline, please refresh page"
            }
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      fullWidth
      onClose={undefined}
      disableEscapeKeyDown={true}
    >
      <DialogContent>
        <LoadingIndicator
          message={i18next.t("loading.defaultMessage")}
          currentProgressInfo={props.progressInfoMessage}
        />
      </DialogContent>
    </Dialog>
  );
}
