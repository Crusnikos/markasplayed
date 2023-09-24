import React, { Suspense, useEffect, useState } from "react";
import { DispatchSnackbar } from "../../components/SnackbarDialog";
import { FullArticleData } from "../../api/article";
import { Lookups, getLookup } from "../../api/lookup";
import MasterDialog from "../components/MasterDialog";
import { MaintenceState } from "../state";
import { ImageData } from "../../api/files";
import { CircularProgress, Grid } from "@mui/material";
import MaintenceDialog from "../components/MaintenceDialog";
import ErrorBoundary from "../../components/ErrorBoundary";

const Content = React.lazy(() => import("./Content"));

export default function Article(props: {
  open: boolean;
  data?: FullArticleData;
  images?: {
    main: ImageData | undefined;
    gallery: ImageData[] | undefined;
  };
  maintence: MaintenceState;
  closeDialog: (setLoading?: boolean) => void;
  setMaintence: (element: MaintenceState) => void;
  setResponseOnSubmit: DispatchSnackbar;
}): JSX.Element {
  const {
    open,
    data,
    images,
    maintence,
    closeDialog,
    setMaintence,
    setResponseOnSubmit,
  } = props;
  const [lookups, setLookups] = useState<Lookups | undefined>(undefined);
  const [loadingProgressInfo, setLoadingProgressInfo] = useState<
    string | undefined
  >(undefined);

  useEffect(() => {
    async function fetchLookups() {
      try {
        const articleTypes = await getLookup({ lookupName: "articleTypes" });
        const platforms = await getLookup({ lookupName: "gamingPlatforms" });

        setLookups({ articleTypes, platforms });
        setMaintence(undefined);
      } catch {
        setMaintence("ErrorState");
      }
    }

    if (lookups === undefined) {
      setMaintence("LoadingState");
    }

    void fetchLookups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (maintence) {
    switch (maintence) {
      case "LoadingState":
        return (
          <MaintenceDialog
            open={open}
            displayMaintence={"LoadingState"}
            progressInfoMessage={loadingProgressInfo}
          />
        );
      default:
        return (
          <MaintenceDialog
            open={open}
            displayMaintence={"ErrorState"}
            closeDialog={closeDialog}
            message={undefined}
          />
        );
    }
  }

  return (
    <MasterDialog
      values={{
        open: open,
        errorMessage: undefined,
        displayDialog: data ? "editArticle" : "addArticle",
      }}
      helpers={{
        closeDialog,
      }}
    >
      <ErrorBoundary
        open={open}
        closeDialog={closeDialog}
        displayType={"Dialog"}
      >
        <Suspense
          fallback={
            <Grid
              item
              container
              direction="column"
              alignItems="center"
              justifyContent="center"
              minHeight={"20vh"}
            >
              <CircularProgress size={50} />
            </Grid>
          }
        >
          {lookups !== undefined && (
            <Content
              setResponseOnSubmit={setResponseOnSubmit}
              data={data}
              images={images}
              lookups={lookups}
              setLoadingProgressInfo={setLoadingProgressInfo}
              setMaintence={setMaintence}
              closeDialog={closeDialog}
            />
          )}
        </Suspense>
      </ErrorBoundary>
    </MasterDialog>
  );
}
