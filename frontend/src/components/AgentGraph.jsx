
import React, { useMemo } from "react";

import {
  ReactFlow,
  Background,
  Controls,
  MarkerType,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";



const STEPS = [
  { id: "planner", label: "Planner", x: 20, y: 80 },
  { id: "executor", label: "Research", x: 230, y: 80 },
  { id: "summary", label: "Summary", x: 440, y: 80 },
  { id: "synthesizer", label: "Synthesizer", x: 440, y: 230 },
  { id: "verifier", label: "Verifier", x: 230, y: 230 },
  { id: "finalizer", label: "Finalizer", x: 20, y: 230 },
];

const CONNECTIONS = [
  ["planner", "executor"],
  ["executor", "summary"],
  ["summary", "synthesizer"],
  ["synthesizer", "verifier"],
  ["verifier", "finalizer"],
  ["verifier", "synthesizer"],
  ["executor", "executor"],
];


export default function AgentGraph({
  activeNode,
  completedNodes = [],
}) {
  const completed = new Set(completedNodes);

  const nodes = useMemo(
    () =>
      STEPS.map((step) => {
        const active = activeNode === step.id;
        const done = completed.has(step.id);

        return {
          id: step.id,
          position: {
            x: step.x,
            y: step.y,
          },
          data: {
            label: (
              <div className="graph-label">
                <span
                  className={
                    active
                      ? "status-dot running"
                      : done
                        ? "status-dot complete"
                        : "status-dot"
                  }
                />
                {step.label}
              </div>
            ),
          },
          style: {
            background: active
              ? "#273b77"
              : done
                ? "#173e37"
                : "#1e293b",
            border: `1px solid ${
              active
                ? "#7c9cff"
                : done
                  ? "#47b89a"
                  : "#475569"
            }`,
            color: "#e5e7eb",
            padding: 12,
            borderRadius: 12,
            width: 160,
            boxShadow: active
              ? "0 0 24px rgba(100,140,255,.35)"
              : "none",
          },
        };
      }),
    [activeNode, completedNodes]
  );

  const edges = useMemo(
    () =>
      CONNECTIONS.map(([source, target], index) => ({
        id: `edge-${index}`,
        source,
        target,
        type: "smoothstep",
        animated:
          activeNode === target ||
          (source === target && activeNode === source),
        style: {
          stroke: "#64748b",
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#64748b",
        },
      })),
    [activeNode]
  );

  return (
    <div className="panel">
      <div className="panel-header">
        <h3>Live Agent Graph</h3>
        <span className="muted">
          {activeNode ? `Active: ${activeNode}` : "Idle"}
        </span>
      </div>

      <div className="graph-container">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          proOptions={{ hideAttribution: true }}
        >
          <Background
            color="#334155"
            gap={22}
          />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}
