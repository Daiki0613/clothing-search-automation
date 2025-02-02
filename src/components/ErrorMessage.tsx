interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => (
  <div className="max-w-md mx-auto mt-8 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
    <p className="text-red-700">{message}</p>
  </div>
);
