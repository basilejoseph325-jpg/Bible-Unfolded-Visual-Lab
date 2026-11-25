#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),cp=require('node:child_process'),assert=require('node:assert/strict');
const BASE='2836475c8e21bcf080ed2fd0fd812aac7aea1ee8',git=(...a)=>cp.execFileSync('git',a,{encoding:'utf8',maxBuffer:16*1024*1024});
// The original grant PR is already merged. Audit its immutable release diff,
// then lock the actual grant runtime in this candidate. Later game additions
// are not changes to the grant and must not fail its original PR-only allowlist.
const GRANT='dd712a60a1562ea268781501605c1b2e1a92ad48';
const allowed=new Set(['.github/workflows/qa-genesis13-test-integration.yml','index.html','test-developer-grant-v1.js','scripts/qa_test_developer_grant_v1.cjs','scripts/qa_test_developer_grant_scope_v1.cjs','scripts/qa_test_developer_grant_browser_v1.cjs','scripts/qa_test_published_release_smoke_v1.cjs','.github/workflows/qa-test-developer-grant-v1.yml','docs/TEST_DEVELOPER_GRANT_45000.md']);
for(const file of new Set(git('diff','--name-only',BASE,GRANT).trim().split('\n').filter(Boolean)))assert(allowed.has(file),'Unrelated file changed: '+file);
const hook='<script src="test-developer-grant-v1.js?v=explicit-topup-v1" defer></script>',index=git('show',GRANT+':index.html');assert.equal(fs.readFileSync('index.html','utf8').split(hook).length,2,'Current entry retains exactly one TEST grant loader');assert.equal(fs.readFileSync('test-developer-grant-v1.js','utf8'),git('show',GRANT+':test-developer-grant-v1.js'),'Released grant runtime must remain unchanged');assert.equal(index.split(hook).length,2);assert.equal(index.replace(hook,''),git('show',BASE+':index.html'),'Only the explicit tool loader may change in the native entry');
const source=fs.readFileSync('test-developer-grant-v1.js','utf8');assert(source.includes("params.get('bu_test_grant')!=='45000'"));assert(source.includes("host==='basilejoseph325-jpg.github.io'"));assert(source.includes("f.scopeKey(W)===PREFIX+W"));assert(!source.includes('wtReceipts='));
console.log('PASS_TEST_GRANT_SCOPE immutable release diff is limited to approved grant files; actual candidate retains one loader and the byte-identical released grant runtime');

const g13='.github/workflows/qa-genesis13-test-integration.yml',clause="github.ref_name == 'feature/test-word-trails-51-55-integration'";
assert.equal(fs.readFileSync(g13,'utf8'),git('show',BASE+':'+g13).replace(clause,clause+" || github.head_ref == 'feature/test-owner-grant-45000' || github.ref_name == 'feature/test-owner-grant-45000'"),'Only authorize this feature branch for the existing immutable-chapter cross-mode checks; all gameplay checks retained');
