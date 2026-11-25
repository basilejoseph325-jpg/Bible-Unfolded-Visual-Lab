'use strict';
const assert=require('node:assert/strict'),bank=require('../family-fresh-mix/friendship-prompts-v1.js'),fs=require('node:fs');
const all=Object.values(bank).flat();assert.equal(Object.keys(bank).length,6);assert.equal(all.length,300);assert.equal(new Set(all.map(p=>p.id)).size,300);assert.equal(new Set(all.map(p=>p.text.toLowerCase())).size,300);
for(const [type,prompts]of Object.entries(bank)){assert.equal(prompts.length,50);for(const q of prompts){assert(q.text.length>=20&&q.text.length<=240);assert(!/[<>]/.test(q.text));if(type==='predict'){assert.equal(q.choices.length,3);assert.equal(new Set(q.choices).size,3)}else assert(!q.choices)}}
const source=fs.readFileSync('family-fresh-mix/friendship-activities-v1.js','utf8');assert(!/awardOnce|economy\.|InsightWallet|localStorage\.(set|remove)/.test(source));
console.log('PASS 300 unique prompts, six banks of 50, 50 fair three-choice predictions; no direct wallet/reward/storage mutation');
