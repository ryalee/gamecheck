# TODO: Sistema de Busca Manual com IGDB

## Status: Completo ✅ (após fix IGDB 400)

**Fix aplicado:** Query IGDB simplificada (sem minimum_system_requirements problemático, fallback defaults).

**Teste final:**
`npm run dev` → Analisar → Buscar "Minecraft" → Funciona com IGDB.

**Se ainda 400/401:**

- Verifique `.env.local` com TWITCH_CLIENT_ID/SECRET válidos (https://dev.twitch.tv).
- Teste api/cover?title=Minecraft (deve retornar cover).

App pronto para uso! 🎮