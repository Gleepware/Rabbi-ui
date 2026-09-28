export default function LoadingIndicator({ size = 16, label = "Loading" }) {
  return (
    <span
      className="loading-indicator"
      role="status"
      aria-label={label}
      style={{ width: `${size}px`, height: `${size}px` }}
    />
  );
}
