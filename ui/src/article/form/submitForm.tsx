import { DispatchSnackbar } from "../../components/SnackbarDialog";
import { MaintenceState } from "../../popup/state";
import { ArticleFormData, createArticle, updateArticle } from "../api/article";
import { ArticleImagesData } from "./imagesReducer";
import i18next from "i18next";
import firebase from "firebase/compat/app";
import { addToGallery, setFrontImage, updateGallery } from "../api/files";
import { AxiosError } from "axios";
import { GetArticleTypeName } from "./ArticleContentForm";

type ProcessingData = {
  token?: string;
  articleId?: number;
  addToGalleryFailedCalls: number;
  updateGalleryFailedCalls: number;
};

type SubmitResponse = {
  status: string;
  processingData?: ProcessingData;
};

async function FilterNumberOfRejectedCalls(
  result: PromiseSettledResult<void>[]
): Promise<number> {
  return result.filter((call) => call.status === "rejected").length;
}

export default async function submitForm(
  responseOnSubmitForm: DispatchSnackbar,
  data: ArticleFormData,
  articleType: number,
  images: ArticleImagesData,
  setMaintence: (element: MaintenceState) => void,
  setLoadingProgressInfo: (element: string | undefined) => void,
  app: firebase.app.App | undefined,
  transactionId: string
): Promise<SubmitResponse> {
  setMaintence("LoadingState");

  let processingData: ProcessingData = {
    token: undefined,
    articleId: undefined,
    addToGalleryFailedCalls: 0,
    updateGalleryFailedCalls: 0,
  };

  let { token, articleId, addToGalleryFailedCalls, updateGalleryFailedCalls } =
    processingData;

  //Getting Token
  try {
    setLoadingProgressInfo(i18next.t("loading.progress.authentication"));

    token = await app!.auth().currentUser?.getIdToken();
    if (!token) {
      throw new Error();
    }
  } catch {
    responseOnSubmitForm({
      message: i18next.t("form.error.article.create"),
      severity: `error`,
    });
    return { status: "failure" };
  }

  //Handling article data - create or update
  if (data?.id) {
    try {
      //Update article
      setLoadingProgressInfo(i18next.t("loading.progress.articleUpdate"));

      await updateArticle(
        data,
        GetArticleTypeName(articleType),
        transactionId,
        token
      );
      articleId = data?.id;
    } catch {
      responseOnSubmitForm({
        message: i18next.t("form.error.article.update"),
        severity: `error`,
      });
      return { status: "failure" };
    }
  } else {
    try {
      //Create article
      setLoadingProgressInfo(i18next.t("loading.progress.articleCreate"));

      articleId = await createArticle(
        data,
        GetArticleTypeName(articleType),
        transactionId,
        token
      );
    } catch {
      responseOnSubmitForm({
        message: i18next.t("form.error.article.create"),
        severity: `error`,
      });
      return { status: "failure" };
    }
  }

  //Handling front image - create or update
  if (
    images.coverImage.state === "new" &&
    images.coverImage.file !== undefined
  ) {
    try {
      setLoadingProgressInfo(i18next.t("loading.progress.frontImageCreate"));

      await setFrontImage(
        { id: articleId, file: images.coverImage.file },
        token
      );
    } catch {
      responseOnSubmitForm({
        message: i18next.t("form.error.frontImage.set"),
        severity: `error`,
      });
      return { status: "failure" };
    }
  }

  //Handling gallery - add
  const newGalleryEntries = images.gallery.filter((i) => i.state === "new");
  if (newGalleryEntries.length > 0) {
    setLoadingProgressInfo(i18next.t("loading.progress.galleryAdd"));
    var newEntriesResult: PromiseSettledResult<void>[] = [];

    try {
      newEntriesResult = await Promise.allSettled(
        newGalleryEntries.map(async (image) => {
          await addToGallery(articleId!, image.file!, token!);
        })
      );
    } catch (err) {
      const error = err as AxiosError;
      console.log(error.message);
    } finally {
      addToGalleryFailedCalls = await FilterNumberOfRejectedCalls(
        newEntriesResult
      );
    }
  }

  //Handling gallery - deactivate
  const deactivateGalleryEntries = images.gallery.filter(
    (i) => i.state === "deactivated"
  );
  if (deactivateGalleryEntries.length > 0) {
    setLoadingProgressInfo(i18next.t("loading.progress.galleryUpdate"));
    var deactivateEntriesResult: PromiseSettledResult<void>[] = [];

    try {
      deactivateEntriesResult = await Promise.allSettled(
        deactivateGalleryEntries.map(async (image) => {
          await updateGallery(articleId!, image.id!, token!);
        })
      );
    } catch (err) {
      const error = err as AxiosError;
      console.log(error.message);
    } finally {
      updateGalleryFailedCalls = await FilterNumberOfRejectedCalls(
        deactivateEntriesResult
      );
    }
  }

  return {
    status: "success",
    processingData: {
      addToGalleryFailedCalls,
      updateGalleryFailedCalls,
    },
  };
}
