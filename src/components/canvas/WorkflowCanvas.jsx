import React, { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react';
import { TriggerNode, AiTransformNode, ConditionNode, ActionNode } from './CustomNodes';

export default function WorkflowCanvas({
  nodes,
  setNodes,
  edges,
  setEdges,
  onNodeSelect,
  selectedNodeId,
}) {
  const nodeTypes = useMemo(
    () => ({
      trigger: TriggerNode,
      ai_transform: AiTransformNode,
      condition: ConditionNode,
      action: ActionNode,
    }),
    []
  );

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            style: { stroke: '#3ecf8e', strokeWidth: 2 },
          },
          eds
        )
      ),
    [setEdges]
  );

  const onNodeClick = useCallback(
    (_event, node) => {
      if (onNodeSelect) {
        onNodeSelect(node);
      }
    },
    [onNodeSelect]
  );

  const onPaneClick = useCallback(() => {
    if (onNodeSelect) {
      onNodeSelect(null);
    }
  }, [onNodeSelect]);

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: '#3ecf8e', strokeWidth: 2 },
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1.2}
          color="rgba(255, 255, 255, 0.12)"
        />
        <Controls position="bottom-left" />
        <MiniMap
          nodeStrokeColor="#3ecf8e"
          nodeColor="#131924"
          maskColor="rgba(8, 11, 15, 0.85)"
          position="bottom-right"
          className="!border !border-white/10 !rounded-xl !overflow-hidden"
        />
      </ReactFlow>
    </div>
  );
}
