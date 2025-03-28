// eslint.config.js
import js from "@eslint/js";

export default [
    js.configs.recommended,
    {
        rules: {
            "no-unused-vars": [
                "warn",
                {
                    "varsIgnorePattern": "^_",
                    "argsIgnorePattern": "^_",
                }
            ]
        },
        languageOptions: {
            globals: {
                Cities: "readonly",
                Constructibles: "readonly",
                GameInfo: "readonly",
                GameplayMap: "readonly",
                MapCities: "readonly",
                MapConstructibles: "readonly",
                MapUnits: "readonly",
                console: "readonly",
                document: "readonly",
                engine: "readonly",
            }
        }

    }
];
