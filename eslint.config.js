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
                GameContext: "readonly",
                GameInfo: "readonly",
                GameplayMap: "readonly",
                IndependentRelationship: "readonly",
                MapCities: "readonly",
                MapConstructibles: "readonly",
                MapUnits: "readonly",
                Players: "readonly",
                console: "readonly",
                document: "readonly",
                engine: "readonly",
                localStorage: "readonly",
            }
        }

    }
];
