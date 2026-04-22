# Points Terminal 🪙

**An INR-first reward-points optimizer for Indian credit card holders.**

Most Indians redeem points at the bank catalog rate (₹0.25–₹1.00/point). The transfer-partner ceiling is 3–5× higher. Points Terminal closes that information gap.

![Points Terminal Screenshot](docs/screenshot.png)

## What it does

Given your card + balance, Points Terminal ranks every possible redemption path by INR value:

- **39 cards** across 14 Indian banks (HDFC, Axis, Amex, ICICI, SBI, HSBC, Kotak, IndusInd, Yes, AU, IDFC, Standard Chartered, RBL)
- **30 redemption partners** — airlines, hotels, flexible packages, experiences, shopping
- **Three-tier valuations** — floor (catalog), realistic (median), ceiling (premium cabin sweet spot)
- **Gap analysis** — if you don't have enough, how many more points do you need and how to earn them
- **Deep-links** to redemption portals
- **Live data sources panel** with change-feed from blogs, forums, Discord, Telegram

## Why this exists

US travelers have Point.me, TPG, AwardHacker. Indians have scattered blogs in 14 different places. A single 100,000 HDFC Infinia balance can be worth anywhere from ₹30,000 (statement credit) to ₹3,30,000 (SQ business class to Singapore) — and no public tool surfaces this.

## The honest data story

Official bank portals (HDFC SmartBuy, Axis EDGE) block scraping per Terms of Service. So Points Terminal doesn't scrape them. Instead, it aggregates from:

- **Blogs with RSS**: PointsMath, LiveFromALounge, CardInsider, CardExpert, Magnify.club, AwardWallet
- **Forums**: TechnoFino, TapNow, r/CreditCardsIndia
- **Real-time channels**: Discord (IN Points), Telegram (CCIndia)
- **Aggregators**: Points Dojo
- **Official pages**: Airline/hotel award charts, bank T&Cs

Every data point carries a `last_verified` date and contributing sources.

## Quick start

```bash
git clone https://github.com/yourusername/points-terminal.git
cd points-terminal
npm install
npm run dev
```

Open `http://localhost:5173`.

## Project structure

```
points-terminal/
├── src/
│   ├── PointsOptimizer.jsx       # Main React component
│   ├── data.js                   # Compiled data (auto-generated from YAML)
│   └── utils/
├── data/                         # Git-versioned YAML (source of truth)
│   ├── cards/                    # One file per card
│   ├── partners/                 # One file per redemption partner
│   └── sources/                  # Data source registry
├── scripts/
│   └── build-data.js             # Compiles YAML → src/data.js
├── docs/
│   ├── METHODOLOGY.md
│   ├── GLOSSARY.md
│   └── CONTRIBUTING.md
└── .github/workflows/
    └── validate-data.yml         # CI validation on PRs
```

## Methodology

Options are ranked by **ceiling INR per source point**:

```
score = valuation.ceiling × transfer_ratio
```

A 1:2 transfer to a partner worth ₹2.50/mile beats a 1:1 to a ₹1/mile partner. Ranking optimizes for peak achievable value; realistic and floor tiers are shown alongside for context.

Full methodology at [docs/METHODOLOGY.md](docs/METHODOLOGY.md). Glossary at [docs/GLOSSARY.md](docs/GLOSSARY.md).

## Key findings from building this

1. **Marriott Bonvoy is quietly the airline hub for Indians.** ANA, Alaska, American, Cathay have no direct Indian bank transfer partners. The only path is Marriott at 3:1. Marriott devaluations cascade as airline devaluations.

2. **Transfer ratios vary by card tier within the same bank.** HDFC Infinia → KrisFlyer is 1:1; Regalia Gold is 3:1. Most existing tools treat this as a single bank-level ratio.

3. **Community channels catch devaluations faster than blogs.** The April 2026 Axis purge of Accor/Marriott/Qatar was on r/CreditCardsIndia within minutes; blog confirmations took hours.

4. **Floor vs Ceiling matters more than any single number.** Cashback (₹0.30/point) and Turkish business class (₹3.50/point) are both "valid" valuations of the same point. A single-number tool misleads.

## Contributing

The devaluation cycle is monthly; no one person can keep up. Contributions welcome:

1. **Update a transfer ratio**: Edit the relevant YAML in `data/cards/` or `data/partners/`, add a `last_verified` date and source citation, open a PR
2. **Add a card**: Copy `data/cards/_template.yaml`, fill in, submit
3. **Add a sweet spot**: Edit the relevant partner file in `data/partners/`
4. **Report a devaluation**: Open an issue with source link

See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for the full workflow.

## Roadmap

- [x] MVP: 39 cards, 30 partners, three-tier valuations, gap analysis
- [x] Data sources panel with change feed
- [ ] Trip solver: "Delhi → Tokyo J, what's the cheapest path from my wallet?"
- [ ] Multi-source wallet (hold HDFC + Amex + Axis simultaneously)
- [ ] Transfer bonus alerts (WhatsApp via Gupshup)
- [ ] Portfolio optimizer: recommend optimal 3-card stack given spending categories
- [ ] Statement-PDF OCR for balance entry
- [ ] Backend: FastAPI + Postgres, Discord/Telegram bot ingestion
- [ ] Pro tier (₹299/mo) with real-time alerts and trip solver

## Disclaimer

Not financial advice. Award availability is not real-time. Bank transfer ratios change without notice — always verify at source before transferring. Transfers are one-way and irreversible.

## License

MIT — see [LICENSE](LICENSE). Data files under `data/` are CC-BY-SA 4.0 so community contributions remain open.

## Acknowledgements

Data methodology borrowed from [Frequent Miler's RRV framework](https://frequentmiler.com/reasonable-redemption-values-rrvs/) and adapted for INR. Indian bank data verified against [PointsMath](https://pointsmath.com), [LiveFromALounge](https://livefromalounge.com), [CardInsider](https://cardinsider.com), and community reports from [TechnoFino](https://technofino.in/community) and [r/CreditCardsIndia](https://reddit.com/r/CreditCardsIndia).

Built by [Samith](https://github.com/samithr1981). Not affiliated with any bank or loyalty program.
