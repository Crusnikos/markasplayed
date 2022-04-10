import { Dispatch, SetStateAction } from "react";
import { FullArticleData } from "../article/api/apiArticle";
import { ArticleImageData } from "../article/api/apiGallery";

export type Dialogs = {
  type: "AddArticle" | "EditArticle" | "Authors" | "LoginUser" | undefined;
  data: FullArticleData | undefined;
  images:
    | {
        main: ArticleImageData | undefined;
        gallery: ArticleImageData[] | undefined;
      }
    | undefined;
  returnFunction?: Dispatch<SetStateAction<boolean>>;
};
