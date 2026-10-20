# Nuxt 5: module virtual nested under an alias → `ENOTDIR`

Reproduction for https://github.com/nuxt/nuxt/pull/36619 (first case).

Found while porting `@nuxt/content` + `nuxt-studio` to Nuxt 5: `nuxt-component-meta` sets

- alias `#nuxt-component-meta` → `<buildDir>/component-meta.mjs` (a **file**)
- Nitro virtual `#nuxt-component-meta/nitro`
- server handlers that `import … from '#nuxt-component-meta/nitro'` (and `h3`, which counts as nitro v2 code)

`modules/meta` does the same with `#meta` / `#meta/nitro`.

## Steps

```sh
pnpm install
pnpm build   # ✔
pnpm build   # ✔
pnpm build   # ✖ from here on, every build fails
```

```
ERROR  ENOTDIR: not a directory, lstat '.../node_modules/.cache/nuxt/.nuxt/meta.mjs/nitro'
    at resolveModuleURL (exsolve/dist/index.mjs:840:16)
    at resolveModulePath (exsolve/dist/index.mjs:884:19)
    at registrationPaths (@nuxt/nitro-server-nightly/dist/index.mjs:1808:16)
    at attributable (@nuxt/nitro-server-nightly/dist/index.mjs:2019:53)
    at rescan (...)
    at setupNitroCompat (...)
```

## Cause

`setupNitroCompat` (`registrationPaths` / `resolveScopeImport`) alias-expands `#meta/nitro` to
`<buildDir>/meta.mjs/nitro` before checking whether it is a registered Nitro virtual. Once
`meta.mjs` exists, exsolve's `try: true` mode throws `ENOTDIR` (it only swallows `ENOENT`,
see https://github.com/unjs/exsolve/pull/69).

Versions: `nuxt-nightly@5.0.0-2610161133-5adfcb1`, `exsolve@1.1.3`, Nitro `3.0.260903-beta`.
