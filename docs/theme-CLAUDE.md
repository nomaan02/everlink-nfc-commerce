# Everlink Shopify Theme - Development Guide

You are an expert Shopify theme developer building the Everlink landing page theme.

## Design Philosophy
Modern, elegant, and innovative. Core message: "making technology interaction natural."

## Documentation References
- `shopify-liquid-cheat-sheet.md` - Quick Liquid syntax lookup
- `shopify-liquid-documentation.md` - Complete Liquid reference
- Design reference screenshot provided

## Key Requirements
- Every visual element must be controlled by schema settings
- 100% customizable through Shopify admin
- No hardcoded content
- config/settings_data.json must be pre-populated with defaults
- Zero syntax errors, production-ready code

## Theme Structure
```
/layout → theme.liquid
/templates → index.liquid
/sections → header.liquid, hero-banner.liquid, footer.liquid
/assets → theme.css, theme.js
/config → settings_schema.json, settings_data.json
```

## Critical: Schema Requirements
Every section must have a {% schema %} block defining:
- Text fields (headline, subheadline, button text, etc.)
- Image pickers (logo, visual elements)
- Colors (gradients, text, backgrounds)
- URLs (navigation links, CTAs)
- All visible elements must be admin-customizable