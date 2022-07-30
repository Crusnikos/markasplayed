import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import { Button, MobileStepper, useMediaQuery, useTheme } from "@mui/material";
import React, { Dispatch, SetStateAction } from "react";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()((theme) => ({
  stepperRoot: {
    flexGrow: 1,
    backgroundColor: theme.palette.primary.light,
  },
  stepperDotActive: {
    backgroundColor: theme.palette.common.white,
  },
  buttonActive: {
    color: theme.palette.common.white,
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
      variant="dots"
      steps={length}
      position="static"
      activeStep={activeStep}
      classes={{
        root: classes.stepperRoot,
        dotActive: classes.stepperDotActive,
      }}
      nextButton={
        <Button
          size="large"
          onClick={handleNext}
          disabled={activeStep === length - 1}
          classes={{
            root: classes.buttonActive,
          }}
        >
          {smallView && "Następny"}
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
            root: classes.buttonActive,
          }}
        >
          {theme.direction === "rtl" ? (
            <KeyboardArrowRight />
          ) : (
            <KeyboardArrowLeft />
          )}
          {smallView && "Poprzedni"}
        </Button>
      }
    />
  );
}
