import { ArticleFormData, FullArticleData } from "../api/article";
import { CoverData, GalleryData } from "./imagesReducer";
import { ImageData } from "../api/files";

export function defaultFormValues(props: {
  data?: FullArticleData;
}): ArticleFormData {
  const { data } = props;
  return {
    id: data?.id ?? null,
    articleType: data?.articleType?.id ?? ("" as unknown as number),
    title: data?.title ?? "",
    playedOn: data?.playedOn?.id ?? ("" as unknown as number),
    availableOn: data?.availableOn?.map((platform) => platform.id) ?? [],
    producer: data?.producer ?? "",
    playTime: data?.playTime ?? ("" as unknown as number),
    shortDescription: data?.shortDescription ?? "",
    longDescription: data?.longDescription ?? "",
  };
}

export function createGalleryData(images?: {
  main: ImageData | undefined;
  gallery: ImageData[] | undefined;
}): GalleryData[] {
  let array: GalleryData[] = [];

  if (images?.gallery !== undefined && images?.gallery?.length > 0) {
    images.gallery.map((i) =>
      array.push({
        id: i.id,
        file: undefined,
        preview: i.imagePathName,
        state: "active",
      })
    );
  }

  array.push({
    id: undefined,
    file: undefined,
    preview: undefined,
    state: "maintence",
  });

  return array;
}

export function createCoverData(images?: {
  main: ImageData | undefined;
  gallery: ImageData[] | undefined;
}): CoverData {
  return {
    file: undefined,
    preview: images?.main?.imagePathName ?? undefined,
    state: "active",
  };
}
