export default function ContentPanel({ children, className = "" }) {
  return (
    <div className={`flex-1 min-h-0 overflow-y-auto ${className}`}>
      {children}
    </div>
  );
}
