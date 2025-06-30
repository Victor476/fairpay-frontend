// src/app/(auth)/layout.tsx
export default function AuthLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">FairPay</h1>
          <p className="text-gray-600">Divida despesas com amigos. Sem complicação.</p>
        </div>
        {children}
      </div>
    );
  }