import { CheckIcon, CloseXIcon, DeleteIcon, EditIcon } from "./icons";

export default function BookmarkRow({
  bookmark,
  isDeleting,
  onOpen,
  onEdit,
  onDelete,
  onCancelDelete,
  onConfirmDelete,
}) {
  if (isDeleting) {
    return (
      <div className="bookmarks-list-item">
        <span className="bookmarks-list-title">Delete &quot;{bookmark.title}&quot;?</span>
        <button type="button" className="icon-btn" aria-label="Delete" onClick={onConfirmDelete}>
          <CheckIcon />
        </button>
        <button type="button" className="icon-btn" aria-label="Cancel" onClick={onCancelDelete}>
          <CloseXIcon />
        </button>
      </div>
    );
  }

  return (
    <div className="bookmarks-list-item">
      <button
        type="button"
        className="bookmarks-list-title bookmarks-nav-btn"
        onClick={() => onOpen(bookmark)}
      >
        {bookmark.title}
      </button>
      <button
        type="button"
        className="icon-btn"
        aria-label={`Edit ${bookmark.title}`}
        onClick={() => onEdit(bookmark)}
      >
        <EditIcon />
      </button>
      <button
        type="button"
        className="icon-btn"
        aria-label={`Delete ${bookmark.title}`}
        onClick={() => onDelete(bookmark)}
      >
        <DeleteIcon />
      </button>
    </div>
  );
}