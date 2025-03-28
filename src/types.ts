export interface Book {
  title: string;
  author: string;
  url: string;
  formats: {
    epub?: string;
    fb2?: string;
    mobi?: string;
  };
}

export type SearchStatus = "idle" | "searching" | "found" | "not_found"; 