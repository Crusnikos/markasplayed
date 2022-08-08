import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import { AxiosError } from "axios";
import {
  ArticleDataRequest,
  ArticleDataResponse,
  getArticlesListing,
} from "./article/api/article";

type ArticleDataContextType = [
  ArticleDataResponse,
  (value: ArticleDataRequest) => Promise<void>
];

export const ArticleDataContext = createContext<ArticleDataContextType>([
  [undefined, 1, 0],
  () => Promise.resolve(),
]);

export const useArticleData: () => ArticleDataContextType = () =>
  useContext(ArticleDataContext);

export default function ArticleListProvider({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const [articles, setArticles] = useState<ArticleDataResponse>([
    undefined,
    0,
    0,
  ]);

  const refreshArticlesList = useCallback(
    async (request?: ArticleDataRequest) => {
      try {
        const articles = await getArticlesListing(request ?? { page: 1 });
        setArticles([articles.data, articles.totalCount, articles.page]);
      } catch (err) {
        const error = err as AxiosError;
        setArticles([error, 0, 1]);
      }
    },
    []
  );

  return (
    <ArticleDataContext.Provider value={[articles, refreshArticlesList]}>
      {children}
    </ArticleDataContext.Provider>
  );
}
