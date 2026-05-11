import { NextRequest, NextResponse } from "next/server";

// Endpoint desativado: sugestões removidas do sistema.
// Mantemos o arquivo como módulo para não quebrar o build.
export async function GET(request: NextRequest) {
  void request;
  // Mesmo desativado, mantemos retorno para compatibilidade.
  return NextResponse.json({ success: true, suggestions: [] });
}
