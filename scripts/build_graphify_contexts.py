from __future__ import annotations

import argparse
import json
import shutil
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path

from graphify.analyze import god_nodes, suggest_questions, surprising_connections
from graphify.build import build
from graphify.cluster import cluster, score_all
from graphify.detect import detect
from graphify.export import to_html, to_json
from graphify.extract import extract
from graphify.report import generate
from graphify.wiki import to_wiki


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_ROOT = ROOT / "graphify-out"
CONTEXTS_ROOT = OUTPUT_ROOT / "contexts"


@dataclass(frozen=True)
class ContextSpec:
    slug: str
    label: str
    path: str
    use_when: str
    notes: str


CONTEXTS: tuple[ContextSpec, ...] = (
    ContextSpec(
        slug="apps-next-api",
        label="apps/next/app/api",
        path="apps/next/app/api",
        use_when="route handlers, auth/session gates, admin APIs, request validation, web BFF entry points",
        notes="API-first graph for App Router route handlers and request/auth helpers.",
    ),
    ContextSpec(
        slug="apps-next-services",
        label="apps/next/server/services",
        path="apps/next/server/services",
        use_when="business logic, orchestration, provider calls, server-side reads and mutations",
        notes="Service-layer graph for the canonical server composition layer.",
    ),
    ContextSpec(
        slug="packages-providers",
        label="packages/providers",
        path="packages/providers",
        use_when="provider contracts, registry behavior, readiness, integration boundaries",
        notes="Contract graph for provider interfaces and registry selection.",
    ),
    ContextSpec(
        slug="packages-adapters",
        label="packages/adapters",
        path="packages/adapters",
        use_when="mock adapters, external integrations, ERP/payment/CMS implementation details",
        notes="Adapter graph for integration implementations only.",
    ),
    ContextSpec(
        slug="packages-app",
        label="packages/app",
        path="packages/app",
        use_when="shared screens, shared flows, CMS block renderers, shared app logic",
        notes="Shared app graph covering screen composition and feature logic.",
    ),
    ContextSpec(
        slug="packages-ui",
        label="packages/ui",
        path="packages/ui",
        use_when="shared UI components, reusables, responsive helpers, design-system implementation",
        notes="UI graph for the active shared UI contract and reusable primitives.",
    ),
)


def _reset_dir(path: Path) -> None:
    if path.exists():
        shutil.rmtree(path)
    path.mkdir(parents=True, exist_ok=True)


def _build_context(spec: ContextSpec) -> dict[str, object]:
    target = ROOT / spec.path
    out_dir = CONTEXTS_ROOT / spec.slug
    _reset_dir(out_dir)

    detection = detect(target)
    code_files = [Path(file_path) for file_path in detection.get("files", {}).get("code", [])]
    ast = extract(code_files) if code_files else {"nodes": [], "edges": [], "input_tokens": 0, "output_tokens": 0}

    graph = build([ast])
    communities = cluster(graph)
    labels = {cid: f"Community {cid}" for cid in communities}
    cohesion = score_all(graph, communities)
    gods = god_nodes(graph)
    surprises = surprising_connections(graph, communities)
    questions = suggest_questions(graph, communities, labels)

    report = generate(
        graph,
        communities,
        cohesion,
        labels,
        gods,
        surprises,
        detection,
        {"input": ast.get("input_tokens", 0), "output": ast.get("output_tokens", 0)},
        spec.path,
        suggested_questions=questions,
    )

    (out_dir / ".graphify_detect.json").write_text(json.dumps(detection, indent=2), encoding="utf-8")
    (out_dir / ".graphify_ast.json").write_text(json.dumps(ast, indent=2), encoding="utf-8")
    (out_dir / "GRAPH_REPORT.md").write_text(report, encoding="utf-8")
    to_json(graph, communities, str(out_dir / "graph.json"))
    to_html(graph, communities, str(out_dir / "graph.html"), community_labels=labels)
    to_wiki(graph, communities, out_dir / "wiki", community_labels=labels, cohesion=cohesion, god_nodes_data=gods)

    summary = {
        "slug": spec.slug,
        "label": spec.label,
        "path": spec.path,
        "use_when": spec.use_when,
        "notes": spec.notes,
        "total_files": detection.get("total_files", 0),
        "total_words": detection.get("total_words", 0),
        "code_files": len(detection.get("files", {}).get("code", [])),
        "document_files": len(detection.get("files", {}).get("document", [])),
        "paper_files": len(detection.get("files", {}).get("paper", [])),
        "image_files": len(detection.get("files", {}).get("image", [])),
        "skipped_sensitive": len(detection.get("skipped_sensitive", [])),
        "nodes": graph.number_of_nodes(),
        "edges": graph.number_of_edges(),
        "communities": len(communities),
        "god_nodes": gods[:5],
        "suggested_questions": questions[:5],
        "report_path": str((out_dir / "GRAPH_REPORT.md").relative_to(ROOT)).replace("\\", "/"),
        "graph_path": str((out_dir / "graph.json").relative_to(ROOT)).replace("\\", "/"),
        "html_path": str((out_dir / "graph.html").relative_to(ROOT)).replace("\\", "/"),
        "wiki_index_path": str((out_dir / "wiki" / "index.md").relative_to(ROOT)).replace("\\", "/"),
    }
    (out_dir / "summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")
    return summary


def _write_root_files(summaries: list[dict[str, object]]) -> None:
    manifest = {
        "generated_at": datetime.now(UTC).isoformat(timespec="seconds").replace("+00:00", "Z"),
        "root": ".",
        "contexts": summaries,
    }
    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)
    (OUTPUT_ROOT / "contexts.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")

    lines = [
        "# Graphify Source Of Truth",
        "",
        "Start here before reading raw files.",
        "",
        "## How To Use This",
        "",
        "1. Read this file to pick the right bounded context.",
        "2. Open that context's `GRAPH_REPORT.md` for the summary.",
        "3. Use that context's `graph.json` or `wiki/index.md` for focused exploration.",
        "4. Only read raw files after the graph narrows the search.",
        "",
        "## Contexts",
        "",
    ]
    for summary in summaries:
        lines.extend(
            [
                f"### {summary['label']}",
                f"- Path: `{summary['path']}`",
                f"- Use when: {summary['use_when']}",
                f"- Notes: {summary['notes']}",
                f"- Size: {summary['total_files']} files, {summary['nodes']} nodes, {summary['edges']} edges, {summary['communities']} communities",
                f"- Report: `{summary['report_path']}`",
                f"- Graph JSON: `{summary['graph_path']}`",
                f"- Wiki index: `{summary['wiki_index_path']}`",
                "",
            ]
        )

    lines.extend(
        [
            "## Rules",
            "",
            "- Use `AGENTS.md` for platform and architecture rules.",
            "- Use `docs/architecture-index.md` for the canonical repo map.",
            "- Use the smallest context graph that matches the question.",
            "- Do not search the whole repo first when a matching context graph already exists.",
            "",
        ]
    )

    (OUTPUT_ROOT / "GRAPH_REPORT.md").write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="Build graphify outputs for the repo's bounded contexts.")
    parser.add_argument(
        "--contexts",
        nargs="*",
        default=[context.slug for context in CONTEXTS],
        help="Optional subset of context slugs to build.",
    )
    args = parser.parse_args()

    selected = [context for context in CONTEXTS if context.slug in set(args.contexts)]
    if not selected:
        raise SystemExit("No matching contexts selected.")

    summaries = [_build_context(spec) for spec in selected]
    _write_root_files(summaries)
    print(json.dumps({"built": [summary["slug"] for summary in summaries]}, indent=2))


if __name__ == "__main__":
    main()
