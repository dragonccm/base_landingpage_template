# Commercial Readiness Beta Checklist

## Current status
- Multi-agent pipeline v1: ✅
- Structured gates: ✅
- Stage retries + loop-back: ✅
- Template baseline compliance gates: ✅
- Release verify hook: ✅
- Kit bootstrap (`kit:init`, `kit:doctor`): ✅
- Basic metrics endpoint (`/api/metrics/autoflow`): ✅

## Remaining before broad commercial rollout
- Queue/worker for high concurrency
- Persistent DB for runs/metrics (replace flat files)
- Role-based approval policy engine (enterprise mode)
- Installer/EXE packaging
- Billing/license/activation flow

## Recommended release label
- **v1.0-beta (pilot-ready)**
