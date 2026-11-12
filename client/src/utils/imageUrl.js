import { API_URL } from "../api/client";

/** Full URLs (Unsplash, Firebase) pass through; uploaded filenames are served from the backend. */
export const imageUrl = (img) => {
  if (!img) return "";
  if (/^(https?:)?\/\//.test(img) || img.startsWith("data:") || img.startsWith("blob:")) return img;
  return `${API_URL}/images/${img.replace(/^\/?(images\/)?/, "")}`;
};

export const packageImage = (pkg, i = 0) => imageUrl(pkg?.packageImages?.[i]);
