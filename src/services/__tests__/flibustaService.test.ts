import * as cheerio from "cheerio";
import { searchBooks } from "../flibustaService";

// Mock fetch and cheerio
global.fetch = jest.fn();
jest.mock("cheerio");

const mockedFetch = global.fetch as jest.Mock;
const mockedCheerio = cheerio as jest.Mocked<typeof cheerio>;

interface MockCheerioData {
  text?: string;
  attrs?: Record<string, string>;
  children?: MockCheerioData[];
}

interface MockDataStructure {
  [key: string]: MockCheerioData;
}

describe("flibustaService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("searchBooks", () => {
    it("should return empty array when query is empty", async () => {
      const result = await searchBooks("");
      expect(result).toEqual([]);
      expect(mockedFetch).not.toHaveBeenCalled();
    });

    it("should return full page from flibusta", async () => {
      const query = "Victor Hugo";

      const books = await searchBooks(query);
      expect(books.length).toBeGreaterThan(0);
    });
  });
});
