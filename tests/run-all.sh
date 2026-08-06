#!/bin/bash
# VetCloud Complete Test Suite
# Run from project root: bash tests/run-all.sh

echo "========================================="
echo "  VetCloud Test Suite"
echo "  $(date)"
echo "========================================="
echo ""

PASS=0
FAIL=0
TOTAL=0

run_test() {
  local name="$1"
  local cmd="$2"
  TOTAL=$((TOTAL + 1))
  echo "▶ Running: $name"
  echo "  Command: $cmd"
  echo "  ---"
  if eval "$cmd"; then
    PASS=$((PASS + 1))
    echo "  ✅ $name PASSED"
  else
    FAIL=$((FAIL + 1))
    echo "  ❌ $name FAILED"
  fi
  echo ""
}

# Phase 1: API Testing
echo "═══════════════════════════════════════"
echo "  PHASE 1: API Testing"
echo "═══════════════════════════════════════"
run_test "API Endpoints" "node tests/api/test-all-endpoints.js"

# Phase 3: Security Testing
echo "═══════════════════════════════════════"
echo "  PHASE 3: Security Testing"
echo "═══════════════════════════════════════"
run_test "Security Tests" "node tests/security/test-security.js"

# Phase 4: Responsive Testing
echo "═══════════════════════════════════════"
echo "  PHASE 4: Responsive Testing"
echo "═══════════════════════════════════════"
run_test "Responsive Tests" "node tests/responsive/test-responsive.js"

# Summary
echo ""
echo "========================================="
echo "  TEST SUMMARY"
echo "========================================="
echo "  Total:  $TOTAL"
echo "  Passed: $PASS"
echo "  Failed: $FAIL"
echo "========================================="

if [ $FAIL -eq 0 ]; then
  echo "  🎉 ALL TESTS PASSED!"
else
  echo "  ⚠️  $FAIL TEST(S) FAILED"
fi
echo ""
