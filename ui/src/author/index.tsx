import React, { useState } from "react";
import { AuthorData } from "./api";
import AuthorItem from "./AuthorItem";
import Stepper from "../components/Stepper";

export default function Authors(props: { authors: AuthorData[] | undefined }) {
  const { authors } = props;
  const [activeStep, setActiveStep] = useState(0);

  const author = authors?.find((author) => author.id === activeStep + 1);

  return (
    <React.Fragment>
      <AuthorItem data={author!} />
      <Stepper
        activeStep={activeStep}
        setActiveStep={setActiveStep}
        length={authors?.length ?? 0}
      />
    </React.Fragment>
  );
}
