# Changelog

All notable changes to Points Terminal's data and code.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.3.0] — 2026-04-22

### Added
- 49 cards across 14 Indian banks (HDFC, Axis, Amex, ICICI, SBI, HSBC, Kotak, IndusInd, Yes, AU, IDFC, Standard Chartered, RBL, HDFC-Tata co-brand)
- 38 redemption partners across 8 categories (intl flights, domestic flights, luxury hotels, mid hotels, packages, experiences, shopping, cashback)
- 17 data sources tracked in `data/sources/registry.yaml`
- Three-tier valuations (floor / realistic / ceiling) for every partner
- Gap analysis showing shortfall and spend required to reach sweet spots
- Live data sources panel with change-feed UI
- Grouped, searchable source card dropdown
- Methodology and Glossary modals
- CI validation of YAML schema and cross-references
- GitHub Actions deploy to GitHub Pages

### Data verification notes
- Axis Bank partner purge of 2 April 2026 reflected (Accor, Marriott, Qatar removed; BA, Finnair, Vietnam added at lower ratios)
- Air India Maharaja Club post-1 April 2026 chart restructure reflected
- HSBC Premier Metal's direct Accor/Taj 1:1 benefits modeled
- Amex India Platinum Travel 9 March 2026 milestone restructure noted
- HDFC Infinia Jan 2026 SmartBuy 5X → 3X reduction noted in card card history

## [Unreleased]

### Planned
- Trip solver: "BOM → NRT J, cheapest path from my wallet"
- Multi-source wallet optimization
- Transfer bonus time-series edges
- Statement-PDF OCR balance entry
- Backend ingestion of Discord/Telegram/Reddit via bots
