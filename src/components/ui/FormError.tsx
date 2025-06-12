interface FormErrorProps {
    message: string;
    className?: string;
  }
  
  export default function FormError({ message, className = "" }: FormErrorProps) {
    if (!message) return null;
    
    return (
      <div className={`p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm ${className}`}>
        {message}
      </div>
    );
  }