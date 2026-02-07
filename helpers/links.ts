export function displayUrl(url: string, maxLength: number = 50) {
  try {
    const urlToProcess = url.match(/^https?:\/\//) ? url : `https://${url}`;
    const { hostname, pathname, search } = new URL(urlToProcess);

    const cleanHostname = hostname.replace(/^www\./, "");

    let display = cleanHostname + pathname;

    if (search) {
      const firstParam = search.split("&")[0];
      display += firstParam;
    }

    if (display.length > maxLength) {
      display = display.substring(0, maxLength - 3) + "...";
    }

    return display;
  } catch (error) {
    const cleaned = url.replace(/^https?:\/\/(www\.)?/, "");
    return cleaned.length > maxLength
      ? cleaned.substring(0, maxLength - 3) + "..."
      : cleaned;
  }
}
