// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import path from "node:path";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    resolve: {
      alias: [
        // Semi Design 依赖 date-fns v2 的内部子路径（经由 date-fns-tz@1），
        // 而项目使用 date-fns v4，其 exports 不再暴露 _lib/*。这里把这些
        // 内部子路径指向并存安装的 date-fns v2。
        { find: /^date-fns\/(.+)$/, replacement: "date-fns-v2/$1" },
        {
          // Semi Design 的 dist CSS 未通过 package.json exports 暴露，这里
          // 直接映射到实际文件，便于全局引入。
          find: "@douyinfe/semi-ui/dist/css/semi.min.css",
          replacement: path.resolve(
            process.cwd(),
            "node_modules/@douyinfe/semi-ui/dist/css/semi.min.css",
          ),
        },
        // Semi 内部引用 lodash 子路径；lodash-es 提供等价的 ESM 默认导出，避免 Vite CJS 解析错误。
        { find: /^lodash\/(.*)$/, replacement: "lodash-es/$1" },
        { find: "lodash", replacement: "lodash-es" },
      ],
    },
    optimizeDeps: {
      include: ["@douyinfe/semi-ui", "@douyinfe/semi-icons"],
    },
  },
});
