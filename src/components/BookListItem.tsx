import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { OpdsBook } from "../types";

interface BookListItemProps {
  book: OpdsBook;
}

export function BookListItem({ book }: BookListItemProps) {
  return (
    <List.Item
      title={book.title}
      subtitle={book.author.name}
      accessories={[{ text: book.format }]}
      actions={
        <ActionPanel>
          {book.downloadLinks.epub && (
            <Action.OpenInBrowser title="Download EPUB" url={book.downloadLinks.epub} icon={Icon.Download} />
          )}
          {book.downloadLinks.fb2 && (
            <Action.OpenInBrowser title="Download FB2" url={book.downloadLinks.fb2} icon={Icon.Download} />
          )}
          {book.downloadLinks.mobi && (
            <Action.OpenInBrowser title="Download MOBI" url={book.downloadLinks.mobi} icon={Icon.Download} />
          )}
        </ActionPanel>
      }
    />
  );
}
