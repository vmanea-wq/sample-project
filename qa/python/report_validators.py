"""Small helpers for QA metric validation (Pylint runs on this package)."""


def coverage_meets_target(coverage_pct: float, minimum: float = 80.0) -> bool:
    """Return True when line coverage meets the minimum percentage."""
    return coverage_pct >= minimum


def complexity_meets_target(max_score: float, ceiling: float = 10.0) -> bool:
    """Return True when observed max cyclomatic complexity is below the ceiling."""
    return max_score < ceiling


def critical_vuln_count_ok(count: int) -> bool:
    """Return True when there are zero critical findings."""
    return count == 0


def latency_meets_target(p95_ms: float, ceiling_ms: float = 500.0) -> bool:
    """Return True when p95 latency is under the ceiling."""
    return p95_ms < ceiling_ms


def error_rate_ok(rate_pct: float, ceiling_pct: float = 1.0) -> bool:
    """Return True when error rate is under the ceiling percentage."""
    return rate_pct < ceiling_pct
