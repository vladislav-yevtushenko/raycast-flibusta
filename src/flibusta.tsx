import { Action, ActionPanel, Icon, List, showToast, Toast } from "@raycast/api";
import { useEffect, useState } from "react";
import axios from "axios";
import * as cheerio from "cheerio";

interface Book {
  title: string;
  author: string;
  url: string;
  formats: {
    epub?: string;
    fb2?: string;
    mobi?: string;
  };
}

export default function Command() {
  const [searchText, setSearchText] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (searchText.length > 0) {
      searchBooks();
    } else {
      setBooks([]);
    }
  }, [searchText]);

  async function searchBooks() {
    setIsLoading(true);
    try {
      const response = await axios.get(`https://flibusta.site/booksearch?ask=${encodeURIComponent(searchText)}`, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });

      const $ = cheerio.load(response.data);
      const results: Book[] = [];

      $(".booksearch").each((_, element) => {
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

        results.push({ title, author, url, formats });
      });

      setBooks(results);
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Failed to search books. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <List
      isLoading={isLoading}
      searchText={searchText}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Search for books..."
    >
      {books.map((book, index) => (
        <List.Item
          key={index}
          title={book.title}
          subtitle={book.author}
          accessories={[
            { text: Object.keys(book.formats).join(", ") },
          ]}
          actions={
            <ActionPanel>
              {book.formats.epub && (
                <Action.OpenInBrowser
                  title="Download EPUB"
                  url={book.formats.epub}
                  icon={Icon.Download}
                />
              )}
              {book.formats.fb2 && (
                <Action.OpenInBrowser
                  title="Download FB2"
                  url={book.formats.fb2}
                  icon={Icon.Download}
                />
              )}
              {book.formats.mobi && (
                <Action.OpenInBrowser
                  title="Download MOBI"
                  url={book.formats.mobi}
                  icon={Icon.Download}
                />
              )}
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
