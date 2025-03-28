import * as cheerio from "cheerio";
import { Book } from "../types";
import type { AnyNode } from "domhandler";
import fetch from "node-fetch";
import { Response } from "node-fetch";

function parseBookElement($: cheerio.CheerioAPI, element: AnyNode): Book {
  const titleElement = $(element).find("h3 a");
  const title = titleElement.text().trim();
  const url = titleElement.attr("href") || "";
  const author = $(element).find("h3").text().replace(title, "").trim();

  const formats: Book["formats"] = {};
  $(element)
    .find("a")
    .each((_, formatElement) => {
      const href = $(formatElement).attr("href") || "";
      if (href.includes(".epub")) formats.epub = href;
      if (href.includes(".fb2")) formats.fb2 = href;
      if (href.includes(".mobi")) formats.mobi = href;
    });

  return { title, author, url, formats };
}

function parseSearchResults(html: string): Book[] {
  const $ = cheerio.load(html);
  const results: Book[] = [];

  $(".booksearch").each((_, element) => {
    results.push(parseBookElement($, element));
  });

  return results;
}

export function searchBooks(query: string): Promise<Book[]> {
  if (query.length === 0) {
    return Promise.resolve([]);
  }

  console.log("Making request to flibusta.site...");
  const url = `https://flibusta.site/booksearch?ask=${encodeURIComponent(query)}`;
  console.log("Request URL:", url);

  return fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    },
  })
    .then((res: Response) => {
      if (!res) {
        throw new Error("No response received from fetch");
      }
      console.log("Response status:", res.status);
      console.log("Response headers:", Object.fromEntries(res.headers.entries()));
      return res.text();
    })
    .then((html: string) => {
      if (!html) {
        throw new Error("No HTML content received");
      }
      console.log("Response HTML length:", html.length);
      console.log("First 500 characters of response:", html.substring(0, 500));
      return parseSearchResults(html);
    })
    .catch((error: Error) => {
      console.error("Error in searchBooks:", error);
      throw error;
    });
}
