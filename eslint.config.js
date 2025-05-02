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
                CombatTypes: "readonly",
                Constructibles: "readonly",
                Controls: "readonly",
                CustomEvent: "readonly",
                DistrictTypes: "readonly",
                Districts: "readonly",
                Game: "readonly",
                GameContext: "readonly",
                GameInfo: "readonly",
                GameplayMap: "readonly",
                GrowthTypes: "readonly",
                IndependentRelationship: "readonly",
                Input: "readonly",
                Loading: "readonly",
                Locale: "readonly",
                MapCities: "readonly",
                MapConstructibles: "readonly",
                MapPlotEffects: "readonly",
                MapUnits: "readonly",
                Players: "readonly",
                RevealedStates: "readonly",
                RiverTypes: "readonly",
                UI: "readonly",
                UIHTMLCursorTypes: "readonly",
                Units: "readonly",
                Visibility: "readonly",
                WorldAnchors: "readonly",
                YieldTypes: "readonly",
                console: "readonly",
                document: "readonly",
                engine: "readonly",
                localStorage: "readonly",
                window: "readonly",
            }
        }

    }
];
