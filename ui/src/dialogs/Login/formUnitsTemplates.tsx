import React from "react";
import { LoginRequest } from "../../context/FirebaseProvider";
import {
  Control,
  Controller,
  FieldError,
  FormState,
  ValidationRule,
} from "react-hook-form";
import { FormHelperText, TextField } from "@mui/material";
import i18next from "i18next";

type PropertyName = "email" | "password";

function extractErrorMessage(
  error: FieldError | FieldError[] | undefined
): string | undefined {
  return Array.isArray(error) ? error[1].message : error?.message;
}

function requiredRule(): ValidationRule<boolean> {
  return {
    value: true,
    message: i18next.t("form.rules.required"),
  };
}

function maxLengthRule(): ValidationRule<number> {
  return { value: 50, message: i18next.t("form.rules.max50Length") };
}

function minLengthRule(): ValidationRule<number> {
  return { value: 6, message: i18next.t("form.rules.min6Length") };
}

function checkEmailFormat(value: string): boolean {
  return /\S+@\S+\.\S+/.test(value);
}

export function CustomTextField(props: {
  autocomplete: string;
  requiredField: boolean;
  maxLength: boolean;
  minLength: boolean;
  emailFormat: boolean;
  control: Control<LoginRequest, any>;
  propertyName: PropertyName;
  formState: FormState<LoginRequest>;
  inputType: string;
}): JSX.Element {
  const {
    autocomplete,
    requiredField,
    maxLength,
    minLength,
    emailFormat,
    control,
    propertyName,
    formState,
    inputType,
  } = props;
  const { errors } = formState;
  const errorMessage = extractErrorMessage(errors[propertyName]);

  return (
    <Controller
      rules={{
        required: requiredField ? requiredRule() : undefined,
        maxLength: maxLength ? maxLengthRule() : undefined,
        minLength: minLength ? minLengthRule() : undefined,
        validate: emailFormat
          ? {
              isEmail: (value) =>
                checkEmailFormat(value) ||
                i18next.t("form.rules.invalidEmailFormat").toString(),
            }
          : undefined,
      }}
      name={propertyName}
      control={control}
      render={({ field }) => (
        <React.Fragment>
          <TextField
            autoComplete={autocomplete}
            error={errorMessage !== undefined ? true : false}
            label={i18next.t(`form.label.user.${propertyName}`)}
            InputLabelProps={{ shrink: true }}
            InputProps={{ type: inputType }}
            size="small"
            {...field}
          />
          <FormHelperText error>{errorMessage}</FormHelperText>
        </React.Fragment>
      )}
    />
  );
}
