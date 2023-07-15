import React from "react";
import { Button, FormControl, Stack } from "@mui/material";
import { useForm } from "react-hook-form";
import { LoginRequest } from "../../context/FirebaseProvider";
import i18next from "i18next";
import { CustomTextField } from "./formUnitsTemplates";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()((theme) => ({
  stack: {
    paddingTop: theme.spacing(1),
  },
}));

export default function Content(props: {
  onSubmit: (formData: LoginRequest) => Promise<void>;
}) {
  const { classes } = useStyles();
  const { onSubmit } = props;
  const { handleSubmit, control, formState } = useForm<LoginRequest>({
    defaultValues: { email: "", password: "" },
  });

  return (
    <form autoComplete="off" noValidate onSubmit={handleSubmit(onSubmit)}>
      <FormControl fullWidth variant="outlined">
        <Stack direction="column" className={classes.stack} spacing={1}>
          <CustomTextField
            autocomplete="email"
            requiredField={true}
            maxLength={true}
            minLength={false}
            emailFormat={true}
            control={control}
            propertyName="email"
            formState={formState}
            inputType="email"
          />
          <CustomTextField
            autocomplete="current-password"
            requiredField={true}
            maxLength={true}
            minLength={true}
            emailFormat={false}
            control={control}
            propertyName="password"
            formState={formState}
            inputType="password"
          />
          <Button type="submit" variant="contained" size="large">
            {i18next.t("form.submit.login")}
          </Button>
        </Stack>
      </FormControl>
    </form>
  );
}
