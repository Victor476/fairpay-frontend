"use client";
import { useState } from "react";

export default function ConvidarMembrosPage() {
  const [email, setEmail] = useState("");
  const [copiado, setCopiado] = useState(false);

  const linkConvite = "https://meusite.com/grupo/convite/abc123";

  const copiarLink = () => {
    navigator.clipboard.writeText(linkConvite);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const enviarConvite = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Convite enviado para: ${email}`);
    setEmail("");
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 flex justify-center items-center">
      <div className="bg-white w-full max-w-xl rounded-lg shadow-md p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center">Convidar Membros</h1>

        {/* Compartilhamento por link */}
        <div>
          <h2 className="font-semibold mb-2">Compartilhar via link</h2>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={linkConvite}
              className="w-full p-2 border rounded text-sm bg-gray-100"
            />
            <button
              onClick={copiarLink}
              className="bg-indigo-600 text-white px-3 py-2 rounded hover:bg-indigo-700 transition text-sm"
            >
              {copiado ? "Copiado!" : "Copiar"}
            </button>
          </div>
        </div>

        {/* Convite por e-mail */}
        <div>
          <h2 className="font-semibold mb-2 mt-6">Enviar por e-mail</h2>
          <form onSubmit={enviarConvite} className="flex gap-2 flex-col sm:flex-row">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nome@email.com"
              className="w-full p-2 border rounded"
              required
            />
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
            >
              Enviar
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
