export interface FeedbackMessage {
  tone: 'success' | 'error';
  text: string;
}

export function FormFeedback({ message }: { message: FeedbackMessage | null }) {
  if (!message) return null;
  return (
    <p
      role="status"
      className={`rounded-xl px-4 py-3 text-sm font-semibold ${
        message.tone === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
      }`}
    >
      {message.text}
    </p>
  );
}
