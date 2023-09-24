import { FullArticleData } from "../api/article";
import { DispatchSnackbar } from "../components/SnackbarDialog";
import { ImageData } from "../api/files";

export type DialogState = "addArticle" | "author" | "editArticle" | "login";

export type DialogProps =
  | LoginProps
  | AuthorProps
  | ArticleAddProps
  | ArticleEditProps;

type LoginProps = {
  displayDialog: "login";
  setAnchorEl: (element: null | HTMLElement) => void;
};

type AuthorProps = {
  displayDialog: "author";
  setAnchorEl: (element: null | HTMLElement) => void;
};

type ArticleAddProps = {
  displayDialog: "addArticle";
  setAnchorEl: (element: null | HTMLElement) => void;
  setResponseOnSubmit: DispatchSnackbar;
};

type ArticleEditProps = {
  displayDialog: "editArticle";
  data: FullArticleData;
  images: {
    main: ImageData | undefined;
    gallery: ImageData[] | undefined;
  };
  setResponseOnSubmit: DispatchSnackbar;
  setLoading: (element: boolean) => void;
  setAnchorEl?: (element: null | HTMLElement) => void;
};

export type MaintenceState = "LoadingState" | "ErrorState" | undefined;

export type MaintenceProps = {
  open: boolean;
} & (LoadingProps | ErrorProps);

type LoadingProps = {
  displayMaintence: "LoadingState";
  progressInfoMessage: string | undefined;
};

type ErrorProps = {
  displayMaintence: "ErrorState";
  closeDialog: (setLoading?: boolean) => void;
  message: string | undefined;
};
