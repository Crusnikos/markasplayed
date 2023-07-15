import React, { useState } from "react";
import { AuthorData } from "../../api/author";
import Item from "./Item";
import Stepper from "../../components/Stepper";

export default function Content(props: { authors: AuthorData[] | undefined }) {
  const { authors } = props;
  const [activeStep, setActiveStep] = useState(0);

  const author = authors?.find((author) => author.id === activeStep + 1);

  return (
    <React.Fragment>
      <Item data={author!} />
      <Stepper
        activeStep={activeStep}
        setActiveStep={setActiveStep}
        length={authors?.length ?? 0}
      />
    </React.Fragment>
  );
}
