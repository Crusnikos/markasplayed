import { ArticleCreationRequest, FullArticleData } from "../../api/apiArticle";

export default function defaultFormValues(props: {
  data?: FullArticleData;
  draft?: ArticleCreationRequest;
}): ArticleCreationRequest {
  const { data, draft } = props;
  if (draft) {
    return {
      id: draft?.id ?? null,
      genre: draft?.genre ?? ("" as unknown as number),
      title: draft?.title ?? "",
      playedOn: draft?.playedOn ?? ("" as unknown as number),
      availableOn: draft?.availableOn?.map((id) => id) ?? [],
      producer: draft?.producer ?? "",
      playTime: draft?.playTime ?? ("" as unknown as number),
      shortDescription: draft?.shortDescription ?? "",
      longDescription: draft?.longDescription ?? "",
    };
  } else {
    return {
      id: data?.id ?? null,
      genre: data?.genre?.id ?? ("" as unknown as number),
      title: data?.title ?? "",
      playedOn: data?.playedOn?.id ?? ("" as unknown as number),
      availableOn: data?.availableOn?.map((platform) => platform.id) ?? [],
      producer: data?.producer ?? "",
      playTime: data?.playTime ?? ("" as unknown as number),
      shortDescription: data?.shortDescription ?? "",
      longDescription: data?.longDescription ?? "",
    };
  }
}
