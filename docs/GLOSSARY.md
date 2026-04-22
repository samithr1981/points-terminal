# Glossary

Plain-English definitions for every term used in Points Terminal.

## Source Program

The reward currency you already hold — HDFC Reward Points, Axis EDGE Miles, Amex Membership Rewards, etc. This is your "wallet". Each source program has a bank-catalog baseline INR value (the `baseInr` field) that represents the floor.

## Partner Program

Where your points go after a transfer — Singapore KrisFlyer, Marriott Bonvoy, Flying Blue, etc. Partner programs are airline or hotel loyalty currencies.

## Transfer Ratio

The conversion rate between source and partner. Format in this tool:

- **1:1** — one source point becomes one partner mile
- **2:1** — two source points become one partner mile (you lose half)
- **1:2** — one source mile becomes two partner points (you gain double — Axis Atlas style)
- **5:2** — five source points become two partner miles
- **3:1** — three source points become one partner mile (HDFC Regalia tier)

## Effective Miles

How many miles/points you receive at the partner after applying the transfer ratio.

- 100,000 HDFC Infinia points at 1:1 to KrisFlyer → **100,000 KrisFlyer miles**
- 100,000 HDFC Infinia points at 2:1 to Marriott → **50,000 Marriott points**
- 100,000 Axis Atlas miles at 1:2 to KrisFlyer → **200,000 KrisFlyer miles**

## Floor Value

The worst-case realistic INR value per partner point. Usually the bank catalog rate or cashback baseline. For HDFC RP on Infinia, floor ≈ ₹0.30 (statement credit rate). For KrisFlyer miles, floor ≈ ₹1.20 (SQ Spontaneous Escapes economy redemption).

## Realistic Value

The median value a typical traveler extracts. For KrisFlyer, realistic ≈ ₹2.00 — a mix of economy and business redemptions across peak and saver inventory. Use this number for everyday planning.

## Ceiling Value

The peak INR value when used for a premium-cabin sweet spot. For KrisFlyer, ceiling ≈ ₹3.30 — business class saver from India to Singapore. Use this to maximize a specific luxury trip.

## Sweet Spot

A curated high-value redemption route for each partner. Not every redemption with a partner is a sweet spot — sweet spots are the redemptions where the cash price is disproportionately high relative to the miles required. Examples:

- **Singapore KrisFlyer**: DEL/BOM → SIN Business Saver at 36,500 miles vs ₹1,20,000 cash
- **Qatar Avios**: DEL/BOM → DOH Qsuite off-peak at 30,000 Avios vs ₹1,85,000 cash
- **Marriott Bonvoy**: ITC Grand Chola standard night at 50,000 points vs ₹28,000 cash

## Gap

How many more source points you need to unlock a partner's sweet spot. Computed as:

```
gap = max(0, source_points_needed - your_balance)
```

If your balance ≥ points needed, gap = 0 and you're eligible now.

## Completion Percentage

How far along you are toward the sweet spot, expressed as a percentage:

```
completion = min(100, (balance / source_points_needed) × 100)
```

## Dynamic Pricing

Programs that flex award prices based on the underlying cash fare. Examples: Marriott Bonvoy (since 2022), Hilton Honors, IHG One Rewards, United MileagePlus (own metal), Flying Blue, Delta SkyMiles.

Dynamic programs are flagged `• DYNAMIC` in the UI because the quoted miles cost can shift between when you see the number here and when you actually redeem. Always verify the actual price on the partner site before transferring — **transfers are one-way and irreversible**.

## Fixed Chart

Programs that publish a zone-based or distance-based award chart that doesn't flex with cash fares. Fixed charts are more predictable but do get devalued in periodic overhauls. Examples: Turkish Miles&Smiles, ANA Mileage Club, all Avios programs (distance bands), World of Hyatt (category 1–8), Accor ALL (fixed 2,000 points = €40), Air India Maharaja Club post-April 2026.

## Fuel Surcharge (YQ)

A taxes-and-fees line item that some airlines add to award tickets. Indian travelers get hit hardest on:

- **Emirates**: ₹25K–85K+ on J/F awards from India
- **British Airways** on own metal: ₹40–70K+ in business
- **Lufthansa Group** (since June 2025 dynamic pricing): similar punitive YQ

Programs that charge **no YQ** on their own metal are valuable: Qatar Airways, Air India, United, Virgin Atlantic, Avianca LifeMiles (on any partner).

## Base INR Rate

The guaranteed, no-effort INR value of one source point when redeemed through the bank's default catalog (usually SmartBuy for HDFC, Travel EDGE for Axis Atlas, brand vouchers for others). This is the floor that the optimizer measures uplift against.

## Uplift

The percentage improvement from the base rate to the ceiling. Example:

```
100,000 HDFC Infinia points
- Base: ₹1,00,000 (₹1.00/pt SmartBuy)
- Top ceiling: ₹3,30,000 (₹3.30/pt via KrisFlyer J)
- Uplift: +230%
```
