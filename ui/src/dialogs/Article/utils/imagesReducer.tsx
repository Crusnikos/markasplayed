export type GalleryData = {
  id: number | undefined;
  file: File | undefined;
  preview: string | undefined;
  state: "active" | "new" | "deactivated" | "maintence";
};

export type CoverData = {
  file: File | undefined;
  preview: string | undefined;
  state: "active" | "new" | "maintence";
};

export type ArticleImagesData = {
  coverImage: CoverData;
  gallery: GalleryData[];
};

export type ActionType =
  | { type: "setCoverImage"; data: FileList | null }
  | { type: "addNewGalleryImages"; data: FileList | null }
  | { type: "setGalleryImageAsConcealed"; data: number }
  | { type: "deleteNewGalleryImage"; data: number };

export default function imagesReducer(
  state: ArticleImagesData,
  action: ActionType
) {
  const copyState = state;

  switch (action.type) {
    case "setCoverImage":
      return setCoverImage(copyState, action.data);
    case "addNewGalleryImages":
      return addNewGalleryImages(copyState, action.data);
    case "deleteNewGalleryImage":
      return deleteNewGalleryImage(copyState, action.data);
    case "setGalleryImageAsConcealed":
      return setGalleryImageAsConcealed(copyState, action.data);
    default:
      throw new Error();
  }
}

function setCoverImage(
  state: ArticleImagesData,
  file: FileList | null
): ArticleImagesData {
  if (file && file.length !== 0) {
    return {
      coverImage: {
        file: file[0],
        preview: URL.createObjectURL(file[0]),
        state: "new",
      },
      gallery: state.gallery,
    };
  }
  return { ...state };
}

function addNewGalleryImages(
  state: ArticleImagesData,
  files: FileList | null
): ArticleImagesData {
  if (files && files.length !== 0) {
    let newGalleryEntries: GalleryData[] = [];
    Array.from(files).map((f) =>
      newGalleryEntries.push({
        id: undefined,
        file: f,
        preview: URL.createObjectURL(f),
        state: "new",
      })
    );
    const lastIndex = state.gallery.length - 1;

    return {
      coverImage: {
        ...state.coverImage,
      },
      gallery: [
        ...state.gallery.slice(0, lastIndex),
        ...newGalleryEntries,
        ...state.gallery.slice(lastIndex),
      ],
    };
  }
  return { ...state };
}

function setGalleryImageAsConcealed(
  state: ArticleImagesData,
  imageId: number
): ArticleImagesData {
  let newGalleryEntries: GalleryData[] = state.gallery;
  const index = state.gallery.findIndex((i) => i.id === imageId);
  newGalleryEntries[index].state = "deactivated";

  return {
    coverImage: {
      ...state.coverImage,
    },
    gallery: [...newGalleryEntries],
  };
}

function deleteNewGalleryImage(state: ArticleImagesData, index: number) {
  let newGalleryEntries: GalleryData[] = state.gallery;
  const currentGalleryLength = state.gallery.filter(
    (i) => i.state === "active" || i.state === "deactivated"
  ).length;

  newGalleryEntries.splice(currentGalleryLength + index, 1);

  return {
    coverImage: {
      ...state.coverImage,
    },
    gallery: [...newGalleryEntries],
  };
}
