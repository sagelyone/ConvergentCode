#!/usr/bin/env bash
set -euo pipefail

TEST_CMD=$(jq -r '.test.command // "go test"' .sdlc/config.json 2>/dev/null || echo "go test")
TEST_UNIT=$(jq -r '.test.unit // "./..."' .sdlc/config.json 2>/dev/null || echo "./...")
TEST_PROP=$(jq -r '.test.property // "-run Prop ./..."' .sdlc/config.json 2>/dev/null || echo "-run Prop ./...")
TEST_ACCEPT=$(jq -r '.test.acceptance // "-run Acceptance ./..."' .sdlc/config.json 2>/dev/null || echo "-run Acceptance ./...")
LINT_CMD=$(jq -r '.test.lint // "true"' .sdlc/config.json 2>/dev/null || echo "true")

unit_fail=$($TEST_CMD $TEST_UNIT 2>&1 | grep -c '^--- FAIL\|^FAIL' || true)
prop_fail=$($TEST_CMD $TEST_PROP 2>&1 | grep -c '^--- FAIL\|^FAIL' || true)
accept_fail=$($TEST_CMD $TEST_ACCEPT 2>&1 | grep -c '^--- FAIL\|^FAIL' || true)
unimpl=$(grep -c '^\*\*Status:\*\* \[ \]' docs/spec.md 2>/dev/null || true)
uncov_exp=$(grep -c 'none — needs implementation' docs/expectations.md 2>/dev/null || true)
unconf_int=$(grep -c '^\*\*Status:\*\* \[ \]' docs/intent.md 2>/dev/null || true)
lint_err=$($LINT_CMD 2>&1 | wc -l || true)
blocked=$(grep -c '^## \[' .sdlc/blockers.md 2>/dev/null || true)
gaps=$(grep -c 'awaiting_human' .sdlc/spec-gaps.md 2>/dev/null || true)

total=$((accept_fail*100 + unit_fail*50 + prop_fail*50 + unimpl*25 + \
         uncov_exp*15 + unconf_int*10 + lint_err*5 + blocked*3 + gaps*1))
prev=$(grep -oP 'total=\K[0-9]+' .sdlc/state.md 2>/dev/null || echo 0)
delta=$((total - prev))

jq -n --argjson t "$total" --argjson d "$delta" \
  --argjson af "$accept_fail" --argjson uf "$unit_fail" \
  --argjson pf "$prop_fail" --argjson un "$unimpl" \
  --argjson ue "$uncov_exp" --argjson ui "$unconf_int" \
  --argjson le "$lint_err" --argjson bl "$blocked" --argjson sg "$gaps" \
  '{total:$t,delta:$d,components:{failing_acceptance:$af,failing_unit:$uf,
    failing_property:$pf,unimplemented:$un,uncovered_expectations:$ue,
    unconfirmed_intents:$ui,lint_errors:$le,blocked:$bl,spec_gaps:$sg}}'
