# Contributing

The Indian credit card devaluation cycle is **monthly**. No single person can keep up. Contributions are welcome and expected.

## Ways to contribute

1. **Update a transfer ratio** — a bank changed something, update the YAML
2. **Add a card** — copy `data/cards/_template.yaml`, fill in, submit PR
3. **Add a sweet spot** — edit the relevant partner file in `data/partners/`
4. **Report a devaluation** — open an issue with a source link if you can't fix it yourself
5. **Improve the code** — React, algorithm, UI polish

## The data model

Everything that's not code lives in `/data` as YAML. This is intentional — it lowers the bar for non-coder contributors (travel enthusiasts, points nerds) to fix data without learning React.

### Adding or updating a card

1. Copy `data/cards/_template.yaml` to `data/cards/<bank>-<card-slug>.yaml`
2. Fill in the fields (see template comments)
3. Run `npm run validate:data` to check the schema
4. Run `npm run build:data` to regenerate the compiled data
5. Commit with a message like `card(hdfc): add Swiggy HDFC co-brand`

### Updating a transfer ratio

1. Find the card in `data/cards/`
2. Update the ratio in the `transfers` section
3. **Update `last_verified` to today's date**
4. **Add your source citation** to `sources`
5. If this is a devaluation, add an entry to `CHANGELOG.md` with the effective date

## Source citation requirements

Every change to a ratio, sweet spot, or valuation must cite at least one source. Acceptable sources:

- Blog posts with dated content: PointsMath, LiveFromALounge, CardInsider, CardExpert, Magnify.club, Points Dojo, AwardWallet
- Official bank/airline T&C pages (best — link to the specific PDF)
- Community forum threads with multiple independent confirmations (TechnoFino, r/CreditCardsIndia)
- Your own screenshot of the bank portal (attach to the PR)

## Pull request checklist

Before opening a PR:

- [ ] `npm run validate:data` passes
- [ ] `npm run build:data` produces clean diff in `src/data.js`
- [ ] At least one source cited for every changed data point
- [ ] `last_verified` dates updated for changed entries
- [ ] `CHANGELOG.md` entry added for material changes
- [ ] If this is a devaluation, flag the PR title `[DEVAL]` for priority review

## Code style

- React functional components only
- No external state management (useState/useMemo sufficient at current scale)
- Inline styles or Tailwind-like utility classes — no CSS files yet
- Lucide for icons, no other icon libraries
- Keep `src/PointsOptimizer.jsx` as the single-file main component until it exceeds 1500 lines

## What NOT to submit

- **Scraping scripts for bank portals** — their ToS forbid this, we don't touch it
- **Ratios without source citations** — no exceptions, even if you're sure
- **Affiliate links** — this tool stays ad-free and non-commercial in the MIT-licensed core
- **"Optimized" content for SEO** — data-first, not content-first

## Governance

This is a personal project maintained by [@samithr1981](https://github.com/samithr1981). PRs are reviewed on a best-effort basis. For urgent devaluation alerts, ping on the issue with `[URGENT]`.

Maintainer decisions on ratios and valuations are final — if you disagree, fork and make your own. That's the beauty of MIT.
