import React from "react";

export const stopPropagationForTab = (e: React.KeyboardEvent<HTMLElement>) => {
  if (e.key === "Tab") {
    e.stopPropagation();
  }
};
