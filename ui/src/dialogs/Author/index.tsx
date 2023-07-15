import React, {
  Dispatch,
  SetStateAction,
  Suspense,
  useEffect,
  useState,
} from "react";
import { MaintenceState } from "../state";
import { AuthorData, getAuthorsListing } from "../../api/author";
import MasterDialog from "../components/MasterDialog";
import MaintenceDialog from "../components/MaintenceDialog";
import { CircularProgress, Grid } from "@mui/material";
import ErrorBoundary from "../../components/ErrorBoundary";

const Content = React.lazy(() => import("./Content"));

export default function Author(props: {
  open: boolean;
  maintence: MaintenceState;
  closeDialog: () => void;
  setMaintence: Dispatch<SetStateAction<MaintenceState>>;
}): JSX.Element {
  const { open, maintence, closeDialog, setMaintence } = props;
  const [authors, setAuthors] = useState<AuthorData[] | undefined>(undefined);

  useEffect(() => {
    async function fetchAuthors() {
      try {
        const authors = await getAuthorsListing();
        setAuthors(authors);
        setMaintence(undefined);
      } catch {
        setMaintence("ErrorState");
        return;
      }
    }

    if (authors === undefined) {
      setMaintence("LoadingState");
    }

    void fetchAuthors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (maintence) {
    switch (maintence) {
      case "LoadingState":
        return (
          <MaintenceDialog
            open={open}
            displayMaintence={"LoadingState"}
            progressInfoMessage={undefined}
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
    <React.Fragment>
      <MasterDialog
        values={{
          open: open,
          errorMessage: undefined,
          displayDialog: "author",
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
                minWidth={"100%"}
              >
                <CircularProgress size={50} />
              </Grid>
            }
          >
            {authors !== undefined && <Content authors={authors} />}
          </Suspense>
        </ErrorBoundary>
      </MasterDialog>
    </React.Fragment>
  );
}
