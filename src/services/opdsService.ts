import axios from "axios";
import { OpdsBook } from "../types";
import * as xml2js from "xml2js";

export const baseSiteUrl = "https://flibusta.site";
const defaultHeaders = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
};

const parser = new xml2js.Parser({
  explicitArray: false,
  mergeAttrs: true,
  valueProcessors: [xml2js.processors.parseBooleans, xml2js.processors.parseNumbers],
});

function parseOpdsBook(entry: any): OpdsBook {
  const downloadLinks: OpdsBook["downloadLinks"] = {};

  // Parse download links
  if (Array.isArray(entry.link)) {
    entry.link.forEach((link: any) => {
      if (link.rel === "http://opds-spec.org/acquisition/open-access") {
        const type = link.type.split("+")[0];
        if (type === "application/fb2") downloadLinks.fb2 = link.href;
        if (type === "application/epub") downloadLinks.epub = link.href;
        if (type === "application/x-mobipocket-ebook") downloadLinks.mobi = link.href;
      }
    });
  }

  // Parse cover image
  const coverLink = Array.isArray(entry.link)
    ? entry.link.find((link: any) => link.rel === "http://opds-spec.org/image")
    : null;
  const coverUrl = coverLink ? coverLink.href : undefined;

  return {
    title: entry.title,
    author: {
      name: entry.author.name,
      uri: entry.author.uri,
    },
    categories: Array.isArray(entry.category)
      ? entry.category.map((cat: any) => ({
          term: cat.term,
          label: cat.label,
        }))
      : [],
    language: entry["dc:language"],
    format: entry["dc:format"],
    issued: entry["dc:issued"],
    description: entry.content,
    coverUrl,
    downloadLinks,
  };
}

async function fetchOpdsXml(url: string): Promise<string> {
  const response = await axios.get(url, { headers: defaultHeaders });
  return response.data;
}

export async function searchBooks(query: string): Promise<OpdsBook[]> {
  if (query.length === 0) {
    return [];
  }

  const url = `${baseSiteUrl}/opds/search?searchType=books&searchTerm=${encodeURIComponent(query)}`;
  const xml = await fetchOpdsXml(url);
  const result = await parser.parseStringPromise(xml);

  const feed = result.feed;
  const entries = Array.isArray(feed.entry) ? feed.entry : [feed.entry];

  return entries.map(parseOpdsBook);
}
