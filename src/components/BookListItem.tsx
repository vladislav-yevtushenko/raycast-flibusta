import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { Book } from "../types";

interface BookListItemProps {
  book: Book;
}

export function BookListItem({ book }: BookListItemProps) {
  return (
    <List.Item
      title={book.title}
      subtitle={book.author}
      accessories={[{ text: Object.keys(book.formats).join(", ") }]}
      actions={
        <ActionPanel>
          {book.formats.epub && (
            <Action.OpenInBrowser title="Download EPUB" url={book.formats.epub} icon={Icon.Download} />
          )}
          {book.formats.fb2 && (
            <Action.OpenInBrowser title="Download FB2" url={book.formats.fb2} icon={Icon.Download} />
          )}
          {book.formats.mobi && (
            <Action.OpenInBrowser title="Download MOBI" url={book.formats.mobi} icon={Icon.Download} />
          )}
        </ActionPanel>
      }
    />
  );
} 