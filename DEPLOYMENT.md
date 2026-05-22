# Deployment

## Supabase

Proyecto: `Saas_Apicola`

Variables publicas usadas por la app:

```env
NEXT_PUBLIC_SUPABASE_URL=https://qcfaprwqixadakopnxfp.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_RLZSeuYBtIcpRdNj2-61FA_iDCXEAix
```

La app usa datos reales desde Supabase para:

- Perfil de empresa y marca.
- Panel principal: apiarios, inspecciones y tratamientos.
- Ventas: pipeline comercial.

## GitHub

El repositorio local ya esta inicializado en `main` y tiene un commit inicial.

Para subirlo a GitHub cuando exista el repo remoto:

```powershell
git remote add origin https://github.com/USUARIO/REPO.git
git push -u origin main
```

## Vercel

Si tienes Vercel CLI autenticado:

```powershell
npx vercel deploy --prod
```

Si usas token:

```powershell
npx vercel deploy --prod --token TU_VERCEL_TOKEN
```

En Vercel, configura las mismas variables `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
