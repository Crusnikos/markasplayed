import axios from "axios";
import { settings } from "../../api";
import firebase from "../../user/firebase";

export async function getFrontImage(request: {
  id: number;
  small?: boolean;
}): Promise<ArticleImageData> {
  const response = await axios.get<ArticleImageData>(
    `${settings.url}/image/front`,
    {
      params: request,
    }
  );

  return response.data;
}

export async function getSliderImages(): Promise<ArticleImageData[]> {
  const response = await axios.get<ArticleImageData[]>(
    `${settings.url}/image/slider`
  );
  return response.data;
}

export async function getGallery(request: {
  id: number;
}): Promise<ArticleImageData[]> {
  const response = await axios.get<ArticleImageData[]>(
    `${settings.url}/image/gallery`,
    {
      params: request,
    }
  );
  return response.data;
}

export async function setFrontImage(request: {
  id: number;
  file: File;
}): Promise<void> {
  const token = await firebase.auth().currentUser?.getIdToken();
  const formData = new FormData();
  formData.append("id", request.id.toString());
  formData.append("file", request.file);
  await axios.post<MainImageCreationRequest>(
    `${settings.url}/image/front/update`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

export async function setArticleGallery(
  updateRequest?: {
    galleryIds: number[];
  },
  addRequest?: { articleId: number; files: File[] }
): Promise<void> {
  const token = await firebase.auth().currentUser?.getIdToken();

  if (updateRequest) {
    await axios.post(`${settings.url}/image/gallery/update`, updateRequest, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  if (addRequest) {
    const formData = new FormData();
    formData.append("id", addRequest.articleId.toString());
    Array.from(addRequest.files).forEach((f) => {
      formData.append("files", f);
    });
    await axios.post(`${settings.url}/image/gallery/add`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}

export type ArticleImageData = {
  id: number;
  imageName: string;
  imageSrc: string;
};

export type MainImageCreationRequest = {
  id: number;
  file: File;
};
