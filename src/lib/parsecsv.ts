export function parsecsv(
  csv: string,
  columns: string[] = [],
  options?: {
    comments?: string;
    noQuote?: boolean;
    delimiter?: string;
  }
) {
  const parse_options = Object.assign(
    {
      comments: "#",
      noQuote: false,
      delimiter: ",",
    },
    options
  ) as {
    comments: string;
    noQuote: boolean;
    delimiter: string;
  };
  const { comments, delimiter, noQuote } = parse_options;
  return csv
    .trim()
    .split("\n")
    .map((line) => line.trim())
    .filter(
      (line) => line?.length > 0 && (!comments || !line.startsWith(comments))
    )
    .map((line) => {
      const obj: { [key: string]: string } = {};
      line
        .split(delimiter)
        .map((v) => {
          v = v.trim();
          if (!noQuote) v = v.slice(1, v.length - 1);
          return v;
        })
        .forEach((v, i) => {
          obj[columns[i]] = v;
        });
      return obj;
    });
}
