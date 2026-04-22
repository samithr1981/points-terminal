# Methodology

## How recommendations are ranked

Every redemption option is scored by **ceiling INR per source point**:

```
score = valuation.ceiling × transfer_ratio
```

This single number expresses what one point from your wallet *could* yield at peak use. A 1:2 transfer to a partner worth ₹2.50/mile (score = ₹5.00) beats a 1:1 to a ₹1/mile partner (score = ₹1.00), regardless of how the headline ratio looks.

## Why rank by ceiling, not realistic?

The optimizer's job is to surface what's possible, not what's average. A user willing to hunt premium-cabin award space should see Turkish → business class to USA at the top, even if the realistic day-to-day use of Turkish miles is lower.

Realistic and floor tiers are shown alongside so users can make apples-to-apples comparisons. The ranking is opinionated; the data presentation is neutral.

## The three valuation tiers

### Floor

The worst-case realistic INR value per partner point. Typically:
- Bank catalog rate (₹0.30/RP for HDFC statement credit)
- Cashback equivalent
- Voucher floor rate

### Realistic

The median value a typical traveler gets. Derived from:
- [Frequent Miler's RRV (Reasonable Redemption Value)](https://frequentmiler.com/reasonable-redemption-values-rrvs/) methodology
- TPG monthly valuations, adjusted for INR and Indian origin
- Aggregated community reports

### Ceiling

The peak INR value when used for a premium-cabin sweet spot with high cash-price redemption. Example:

> Singapore KrisFlyer Business Saver DEL → SIN: 36,500 miles. Cash price: ~₹1,20,000. Taxes: ~₹8,500. Net value per mile: (1,20,000 − 8,500) / 36,500 = ₹3.05. Round up to ₹3.30 accounting for the business-class experience premium.

## What's NOT modeled yet

1. **Award availability** — partner award space is not real-time. The tool shows theoretical miles required. Always verify at the airline/hotel before transferring.
2. **Annual transfer caps** — HDFC's 150K Infinia / 75K DCB / 50K other monthly caps and Axis's Group A/B caps affect large transfers.
3. **Transfer fees** — HDFC's ₹99 + 18% GST per transfer (post-December 2024 for non-Infinia/DCB cards) and Axis's ₹199 + GST.
4. **Transfer bonus promotions** — periodic 10–30% bonuses change the math materially but aren't modeled as time-varying edges yet.

## Sweet spot selection

Sweet spots are curated, not algorithmically derived. For each partner, we pick one canonical high-value redemption that:
- Is bookable from an Indian origin (Delhi/Mumbai/Bangalore)
- Has a meaningful cash-price differential (cash > 2× award cost)
- Has reasonable real-world availability (not a 1-seat-per-day phantom)
- Appears in at least two independent source citations

## Data sourcing and verification

Every data point carries:
- `last_verified` — ISO date of last confirmation
- `sources` — list of specific sources that contributed

Ratios and sweet spots are cross-referenced against at least two of:
- PointsMath (Indian bank ratios)
- LiveFromALounge (devaluation alerts)
- CardInsider, CardExpert, Magnify.club (card-level detail)
- TechnoFino, r/CreditCardsIndia (community verification)
- Official airline/hotel award charts
- Bank T&C PDFs

When sources conflict, we take the more conservative interpretation and flag the conflict in the PR.

## What about fuel surcharges?

Fuel surcharges (YQ) on award redemptions are a major hidden cost for Indian travelers. Programs that charge high YQ from India (Emirates, British Airways on own metal, Lufthansa Group) are flagged in tags, but the specific INR amount is not modeled in the core ranking — it appears in the `sweetSpot.taxesInr` field per partner. This is a roadmap item for v2.

## Currency conversions

Global valuations (TPG, Frequent Miler) are USD-denominated. Conversion uses a rolling 3-month average USD/INR rate, rounded to the nearest ₹0.25/point for readability. Current working rate: **1 USD ≈ ₹83**.

## Versioning and change log

Data is versioned in git. Every material change (new card, ratio change, devaluation) lands in a dated entry in `CHANGELOG.md` with the source citation.
