import { Pagination, useMediaQuery, useTheme } from "@mui/material";
import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useArticleData } from "../context/ArticleListProvider";

export default function ArticlePagination(props: {
  onPageChange: (page: number) => Promise<void>;
}): JSX.Element {
  const { onPageChange } = props;
  const [[, totalCount, page]] = useArticleData();
  const location = useLocation();
  const navigate = useNavigate();
  const qs = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const pageCount = Math.ceil(totalCount / 5);

  const theme = useTheme();
  const smallView = useMediaQuery(theme.breakpoints.up("sm"));

  useEffect(() => {
    if (page > 1) {
      qs.set("page", page.toString());
    } else {
      qs.delete("page");
    }

    navigate({ search: qs.toString() }, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <Pagination
      count={pageCount !== 0 ? pageCount : 1}
      page={page}
      onChange={(_, nextPage) => onPageChange(nextPage)}
      color="primary"
      size="medium"
      hidePrevButton={!smallView}
      hideNextButton={!smallView}
    />
  );
}
