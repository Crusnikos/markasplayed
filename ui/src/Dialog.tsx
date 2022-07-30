import { Dispatch, SetStateAction } from "react";
import { FullArticleData } from "./article/api/article";
import { ImageData } from "./article/api/files";

export type Dialog = {
  type: "addArticle" | "editArticle" | "authors" | "loginUser" | undefined;
  data: FullArticleData | undefined;
  images:
    | {
        main: ImageData | undefined;
        gallery: ImageData[] | undefined;
      }
    | undefined;
  returnFunction?: Dispatch<SetStateAction<boolean>>;
};
