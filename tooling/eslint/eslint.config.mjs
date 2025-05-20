import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import reactCompiler from "eslint-plugin-react-compiler";
import { defineConfig } from "eslint/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  {
    extends: compat.extends("next/core-web-vitals", "prettier"),

    plugins: {
      "react-compiler": reactCompiler,
    },

    rules: {
      "max-params": ["error", 4],
      "prefer-const": "error",
      "react-compiler/react-compiler": "error",
      "react/no-children-prop": "off",
    },
  },
]);
