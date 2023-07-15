import React, { Component } from "react";
import MaintenceDialog from "../dialogs/components/MaintenceDialog";
import ExceptionPage from "./ExceptionPage";

type Props = DialogProps | PageProps;

type DialogProps = {
  displayType: "Dialog";
  open: boolean;
  closeDialog: () => void;
};

type PageProps = {
  displayType: "Page";
};

type State = {
  hasError: boolean;
};

export default class ErrorBoundary extends Component<Props, State> {
  public state = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError && this.props.displayType === "Dialog") {
      return (
        <MaintenceDialog
          open={this.props.open}
          displayMaintence={"ErrorState"}
          closeDialog={this.props.closeDialog}
          message={undefined}
        />
      );
    }

    if (this.state.hasError && this.props.displayType === "Page") {
      return <ExceptionPage message={undefined} />;
    }

    return this.props.children;
  }
}
