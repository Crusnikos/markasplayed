import i18next from "i18next";

type GalleryPreview = {
  id: number | undefined;
  link: string;
  isActive: boolean;
  isNew: boolean;
};

type InitState = {
  mainImage: {
    file: File | undefined;
    preview: string | undefined;
    error?: string | undefined;
  };
  gallery: {
    files: File[] | undefined;
    previews: GalleryPreview[];
    error?: string | undefined;
    message?: string | undefined;
  };
};

type ActionType =
  | { type: "setFrontImage"; data: FileList | null }
  | { type: "setFrontImageError"; data: string }
  | { type: "setGalleryImageAsConcealed"; data: number }
  | { type: "setFrontImageAndGalleryError"; data: string }
  | { type: "addNewGalleryImages"; data: FileList | null }
  | {
      type: "deleteNewGalleryImage";
      data: { fileIndex: number; previewIndex: number };
    };

export default function galleryReducer(state: InitState, action: ActionType) {
  const copyState = state;
  switch (action.type) {
    case "setFrontImage":
      return setFrontImage(copyState, action.data);
    case "setFrontImageError":
      return setFrontImageError(copyState, action.data);
    case "setGalleryImageAsConcealed":
      return setGalleryImageAsConcealed(copyState, action.data);
    case "setFrontImageAndGalleryError":
      return setFrontImageAndGalleryError(copyState, action.data);
    case "addNewGalleryImages":
      return addNewGalleryImages(copyState, action.data);
    case "deleteNewGalleryImage":
      return deleteNewGalleryImage(
        copyState,
        action.data.fileIndex,
        action.data.previewIndex
      );
    default:
      throw new Error();
  }
}

function setFrontImage(state: InitState, file: FileList | null) {
  if (file && file.length !== 0) {
    return {
      mainImage: {
        file: file[0],
        preview: URL.createObjectURL(file[0]),
        error: undefined,
      },
      gallery: {
        ...state.gallery,
        error: undefined,
      },
    };
  }
  return { ...state };
}

function setFrontImageError(state: InitState, error: string) {
  return {
    mainImage: {
      ...state.mainImage,
      error: error,
    },
    gallery: {
      ...state.gallery,
      error: undefined,
    },
  };
}

function setGalleryImageAsConcealed(state: InitState, requestedId: number) {
  return {
    mainImage: {
      ...state.mainImage,
      error: undefined,
    },
    gallery: {
      ...state.gallery,
      previews: state.gallery.previews.map((image) =>
        image.id === requestedId
          ? {
              ...image,
              isActive: !image.isActive,
            }
          : image
      ),
      error: undefined,
      message: i18next.t("form.warning.gallery.setHidden"),
    },
  };
}

function setFrontImageAndGalleryError(state: InitState, error: string) {
  return {
    mainImage: {
      ...state.mainImage,
      error: error,
    },
    gallery: {
      ...state.gallery,
      error: error,
    },
  };
}

function addNewGalleryImages(state: InitState, files: FileList | null) {
  if (files && files.length !== 0) {
    const newPreviews = Array.from(files).map((file) => ({
      id: undefined,
      link: URL.createObjectURL(file),
      isActive: true,
      isNew: true,
    })) as GalleryPreview[];
    const newFiles = Array.from(files);
    const lastIndex = state.gallery.previews.length - 1;

    return {
      mainImage: {
        ...state.mainImage,
        error: undefined,
      },
      gallery: {
        files: state.gallery.files
          ? [...state.gallery.files, ...newFiles]
          : newFiles,
        previews: [
          ...state.gallery.previews.slice(0, lastIndex),
          ...newPreviews,
          ...state.gallery.previews.slice(lastIndex),
        ],
        message: state.gallery.message,
        error: undefined,
      },
    };
  }
  return { ...state };
}

function deleteNewGalleryImage(
  state: InitState,
  fileIndex: number,
  previewIndex: number
) {
  state.gallery.files?.splice(fileIndex, 1);
  state.gallery.previews?.splice(previewIndex, 1);

  if (state.gallery.files?.length === 0) {
    return {
      mainImage: {
        ...state.mainImage,
      },
      gallery: {
        ...state.gallery,
        files: undefined,
      },
    };
  }

  return { ...state };
}
