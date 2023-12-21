import papa from "papaparse";

/**
 * @description parse csv to array of objects
 */
export function parsecsv(
  csv: string,
  columns: string[] = [],
  options?: {
    comments?: string;
    quoteChar?: string;
    delimiter?: string;
  }
) {
  const parse_options = Object.assign(
    {
      comments: "#",
      quoteChar: '"',
      delimiter: ",",
    },
    options
  ) as {
    comments: string;
    quoteChar: string;
    delimiter: string;
  };
  const { comments, delimiter, quoteChar } = parse_options;
  return (
    papa.parse(csv.trim(), { delimiter, comments, quoteChar })
      .data as string[][]
  ).map((col) => {
    const obj: { [key: string]: string } = {};
    col.forEach((v, i) => {
      obj[columns[i]] = v;
    });
    return obj;
  });
}
