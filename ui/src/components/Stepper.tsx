import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import { Button, MobileStepper, useMediaQuery, useTheme } from "@mui/material";
import React, { Dispatch, SetStateAction } from "react";
import { makeStyles } from "tss-react/mui";
import i18next from "i18next";

const useStyles = makeStyles()((theme) => ({
  stepperRoot: {
    flexGrow: 1,
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.common.white,
    fontWeight: "bold",
    textShadow: "3px 3px 10px #000000, -2px 1px 20px #000000",
  },
  buttonActive: {
    color: theme.palette.common.white,
    fontWeight: "bold",
    textShadow: "3px 3px 10px #000000, -2px 1px 20px #000000",
  },
  buttonDisabled: {
    color: theme.palette.common.white,
    fontWeight: "bold",
  },
}));

export default function Stepper(props: {
  activeStep: number;
  setActiveStep: Dispatch<SetStateAction<number>>;
  length: number;
}): JSX.Element {
  const { classes } = useStyles();
  const { activeStep, setActiveStep, length } = props;
  const theme = useTheme();
  const smallView = useMediaQuery(theme.breakpoints.up("sm"));

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  return (
    <MobileStepper
      variant="text"
      steps={length}
      position="static"
      activeStep={activeStep}
      classes={{
        root: classes.stepperRoot,
      }}
      nextButton={
        <Button
          size="large"
          onClick={handleNext}
          disabled={activeStep === length - 1}
          classes={{
            root:
              activeStep === length - 1
                ? classes.buttonDisabled
                : classes.buttonActive,
          }}
        >
          {smallView && i18next.t("stepper.next")}
          {theme.direction === "rtl" ? (
            <KeyboardArrowLeft />
          ) : (
            <KeyboardArrowRight />
          )}
        </Button>
      }
      backButton={
        <Button
          size="large"
          onClick={handleBack}
          disabled={activeStep === 0}
          classes={{
            root:
              activeStep === 0 ? classes.buttonDisabled : classes.buttonActive,
          }}
        >
          {theme.direction === "rtl" ? (
            <KeyboardArrowRight />
          ) : (
            <KeyboardArrowLeft />
          )}
          {smallView && i18next.t("stepper.back")}
        </Button>
      }
    />
  );
}
