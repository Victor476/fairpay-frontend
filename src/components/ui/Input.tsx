import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string;
}

export default function Input({
  label,
  id,
  error,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className={className}>
      <label 
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      
      <input
        id={id}
        className={`block w-full rounded-md border px-3 py-2 text-gray-900 shadow-sm focus:ring-2 focus:outline-none 
          ${error 
            ? "border-red-300 focus:border-red-500 focus:ring-red-500" 
            : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          }`}
        {...props}
      />
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}