import i18next from "i18next";
import React, { useEffect, useState } from "react";
import { FullArticleData } from "../article/api/article";
import { getLookup, Lookups } from "../article/api/lookup";
import ArticleForm from "../article/ArticleForm";
import Authors from "../author";
import { AuthorData, getAuthorsListing } from "../author/api";
import { DispatchSnackbar } from "../components/SnackbarDialog";
import { LoginRequest, useFirebaseAuth } from "../firebase";
import Login from "../user/Login";
import MasterPopup from "./MasterPopup";
import { DialogState, MaintenceState } from "./state";
import { ImageData } from "../article/api/files";

export function LoginPopup(props: {
  setAnchorEl?: (element: null | HTMLElement) => void;
}): JSX.Element {
  const [maintence, setMaintence] = useState<MaintenceState>(undefined);
  const [open, setOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  );
  const { app } = useFirebaseAuth();

  const closeDialog = () => {
    setOpen(false);
    setErrorMessage(undefined);
  };

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

  return (
    <MasterPopup
      values={{
        open: open,
        optionalMessage: undefined,
        errorMessage: errorMessage,
        progressInfoMessage: undefined,
        displayMenuItem: true,
        displayMaintence: maintence,
        displayDialog: "login",
      }}
      helpers={{
        setAnchorEl: props.setAnchorEl,
        setOpen: setOpen,
        closeDialog: closeDialog,
      }}
    >
      <Login onSubmit={onSubmit} />
    </MasterPopup>
  );
}

export function AuthorsPopup(props: {
  setAnchorEl?: (element: null | HTMLElement) => void;
}): JSX.Element {
  const [maintence, setMaintence] = useState<MaintenceState>(undefined);
  const [open, setOpen] = useState<boolean>(false);
  const [authors, setAuthors] = useState<AuthorData[] | undefined>(undefined);

  const closeDialog = () => {
    setOpen(false);
  };

  useEffect(() => {
    async function fetchAuthors() {
      setMaintence("LoadingState");
      try {
        const authors = await getAuthorsListing();
        setAuthors(authors);
        setMaintence(undefined);
      } catch {
        setMaintence("ErrorState");
        return;
      }
    }

    if (!open) return;

    void fetchAuthors();
  }, [open]);

  return (
    <MasterPopup
      values={{
        open: open,
        optionalMessage:
          maintence === "ErrorState"
            ? i18next.t("author.error.retrieve")
            : undefined,
        errorMessage: undefined,
        progressInfoMessage: undefined,
        displayMenuItem: true,
        displayMaintence: maintence,
        displayDialog: "authors",
      }}
      helpers={{
        setAnchorEl: props.setAnchorEl,
        setOpen: setOpen,
        closeDialog: closeDialog,
      }}
    >
      <Authors authors={authors} />
    </MasterPopup>
  );
}

export function ArticlePopup(props: {
  responseOnSubmitForm: DispatchSnackbar;
  data?: FullArticleData;
  images?: {
    main: ImageData | undefined;
    gallery: ImageData[] | undefined;
  };
  returnFunction?: (element: boolean) => void;
  setAnchorEl?: (element: null | HTMLElement) => void;
}): JSX.Element {
  const { data, images, returnFunction, responseOnSubmitForm } = props;
  const [maintence, setMaintence] = useState<MaintenceState>(undefined);
  const [lookups, setLookups] = useState<Lookups | undefined>(undefined);
  const [open, setOpen] = useState<boolean>(false);
  const [loadingProgressInfo, setLoadingProgressInfo] = useState<
    string | undefined
  >(undefined);
  const [dialogState] = useState<DialogState>(
    data?.id ? "editArticle" : "addArticle"
  );

  const closeDialog = () => {
    setLoadingProgressInfo(undefined);
    setOpen(false);
  };

  useEffect(() => {
    async function fetchLookups() {
      setMaintence("LoadingState");
      try {
        const articleTypes = await getLookup({ lookupName: "articleTypes" });
        const platforms = await getLookup({ lookupName: "gamingPlatforms" });

        setLookups({ articleTypes, platforms });
        setMaintence(undefined);
      } catch {
        setMaintence("ErrorState");
      }
    }

    if (!open) return;

    void fetchLookups();
  }, [open]);

  return (
    <MasterPopup
      values={{
        open: open,
        optionalMessage:
          maintence === "ErrorState"
            ? i18next.t("form.error.lookup.retrieve")
            : undefined,
        errorMessage: undefined,
        progressInfoMessage: loadingProgressInfo,
        displayMenuItem: dialogState === "addArticle" ? true : false,
        displayMaintence: maintence,
        displayDialog: dialogState,
      }}
      helpers={{
        setAnchorEl: props.setAnchorEl,
        setOpen: setOpen,
        closeDialog: closeDialog,
      }}
    >
      <ArticleForm
        responseOnSubmitForm={responseOnSubmitForm}
        data={data}
        images={images}
        lookups={lookups}
        setLoadingProgressInfo={setLoadingProgressInfo}
        returnFunction={returnFunction}
        setMaintence={setMaintence}
        closeDialog={closeDialog}
      />
    </MasterPopup>
  );
}
