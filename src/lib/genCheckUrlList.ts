export function genCheckUrlList(url: string): string[] {
  let url_object: URL | null;

  try {
    url_object = new URL(url);
  } catch {
    url_object = null;
  }

  const noQuery = url_object && url_object?.origin + url_object?.pathname;

  return [
    url_object && url.replace(`${url_object?.protocol}//`, ""),
    url.startsWith("https://")
      ? url.replace(`https://`, "http://")
      : url.replace(`http://`, "https://"),
    noQuery !== url && noQuery,
    url_object?.origin,
    url,
  ].filter(Boolean) as string[];
}
