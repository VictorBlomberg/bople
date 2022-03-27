export function resolveParamaters(url: string) {
  const urlObj = new URL(url);
  const searchParams =
    urlObj.hash != null && urlObj.hash.length !== 0
      ? new URLSearchParams(urlObj.hash.substring(1))
      : new URLSearchParams("");
  console.log({ url, urlObj, searchParams });

  const rulesSource = searchParams.get("r");
  const searchQuery = searchParams.get("q");
  const dry = searchParams.get("d") != null;

  return { rulesSource, searchQuery, dry };
}
