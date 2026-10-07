export function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.[0]) return null;
  return (
    <p className="mt-1 text-small font-medium text-red-700" role="alert">
      {messages[0]}
    </p>
  );
}
