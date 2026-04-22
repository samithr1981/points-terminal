#!/usr/bin/env node
/**
 * validate-data.js
 *
 * Validates that all YAML data files conform to the expected schema.
 * Run in CI on PRs to catch malformed contributions before merge.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const CARDS_DIR = path.join(ROOT, 'data', 'cards');
const PARTNERS_DIR = path.join(ROOT, 'data', 'partners');

const errors = [];

function fail(file, msg) {
  errors.push(`${file}: ${msg}`);
}

function validateCard(file, card) {
  const required = ['id', 'label', 'bank', 'tier', 'earn_rate', 'base_inr', 'last_verified', 'sources'];
  for (const field of required) {
    if (card[field] === undefined || card[field] === null) {
      fail(file, `missing required field: ${field}`);
    }
  }
  if (card.transfers) {
    for (const t of card.transfers) {
      if (!t.partner) fail(file, `transfer missing partner`);
      if (typeof t.ratio !== 'number' || t.ratio <= 0) fail(file, `invalid ratio for ${t.partner}`);
      if (!t.note) fail(file, `transfer missing note for ${t.partner}`);
    }
  }
  if (card.base_inr < 0 || card.base_inr > 10) fail(file, `base_inr out of sane range: ${card.base_inr}`);
  if (!Array.isArray(card.sources) || card.sources.length === 0) fail(file, 'at least one source required');
}

function validatePartner(file, p) {
  const required = ['id', 'name', 'category', 'program_type', 'dynamic_pricing', 'valuation', 'sweet_spot', 'last_verified', 'sources'];
  for (const field of required) {
    if (p[field] === undefined || p[field] === null) {
      fail(file, `missing required field: ${field}`);
    }
  }
  if (p.valuation) {
    const { floor, realistic, ceiling } = p.valuation;
    if (floor > realistic) fail(file, `floor (${floor}) > realistic (${realistic})`);
    if (realistic > ceiling) fail(file, `realistic (${realistic}) > ceiling (${ceiling})`);
  }
  if (p.sweet_spot) {
    const required = ['example', 'miles_needed', 'cash_value_inr', 'cabin'];
    for (const f of required) {
      if (!p.sweet_spot[f] && p.sweet_spot[f] !== 0) fail(file, `sweet_spot missing ${f}`);
    }
  }
  const validCategories = ['intl_flight', 'domestic_flight', 'luxury_hotel', 'mid_hotel', 'package', 'experiences', 'shopping', 'cashback'];
  if (!validCategories.includes(p.category)) fail(file, `invalid category: ${p.category}`);
}

function run() {
  console.log('Validating data...');

  const cardFiles = fs.readdirSync(CARDS_DIR).filter(f => f.endsWith('.yaml') && !f.startsWith('_'));
  const cardIds = new Set();
  for (const f of cardFiles) {
    try {
      const card = yaml.load(fs.readFileSync(path.join(CARDS_DIR, f), 'utf8'));
      if (cardIds.has(card.id)) fail(f, `duplicate card id: ${card.id}`);
      cardIds.add(card.id);
      validateCard(f, card);
    } catch (err) {
      fail(f, `YAML parse error: ${err.message}`);
    }
  }

  const partnerFiles = fs.readdirSync(PARTNERS_DIR).filter(f => f.endsWith('.yaml') && !f.startsWith('_'));
  const partnerIds = new Set();
  for (const f of partnerFiles) {
    try {
      const p = yaml.load(fs.readFileSync(path.join(PARTNERS_DIR, f), 'utf8'));
      if (partnerIds.has(p.id)) fail(f, `duplicate partner id: ${p.id}`);
      partnerIds.add(p.id);
      validatePartner(f, p);
    } catch (err) {
      fail(f, `YAML parse error: ${err.message}`);
    }
  }

  // Cross-reference: every card transfer should point to an existing partner
  for (const f of cardFiles) {
    const card = yaml.load(fs.readFileSync(path.join(CARDS_DIR, f), 'utf8'));
    for (const t of (card.transfers || [])) {
      if (!partnerIds.has(t.partner)) {
        fail(f, `transfer references unknown partner: ${t.partner}`);
      }
    }
  }

  if (errors.length > 0) {
    console.error('\n✗ Validation failed:\n');
    errors.forEach(e => console.error(`  - ${e}`));
    process.exit(1);
  }

  console.log(`✓ ${cardFiles.length} cards + ${partnerFiles.length} partners all valid`);
}

run();
