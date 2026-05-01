'use client';

import { useState, useCallback } from 'react';
import { WorkflowNode, NodeType } from '@/types/node';
import { createNode, reorderNodes, sortNodesByPosition } from '@/lib/node-utils';

interface UseNodeEditorProps {
  initialNodes?: WorkflowNode[];
  onChange?: (nodes: WorkflowNode[]) => void;
}

export function useNodeEditor({ initialNodes = [], onChange }: UseNodeEditorProps = {}) {
  const [nodes, setNodesState] = useState<WorkflowNode[]>(sortNodesByPosition(initialNodes));
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // 包装 setNodes 以触发 onChange
  const setNodes = useCallback((newNodes: WorkflowNode[] | ((prev: WorkflowNode[]) => WorkflowNode[])) => {
    const updatedNodes = typeof newNodes === 'function' 
      ? newNodes(nodes) 
      : newNodes;
    setNodesState(updatedNodes);
    onChange?.(updatedNodes);
  }, [nodes, onChange]);

  const addNode = useCallback((type: NodeType) => {
    const newNode = createNode(type, nodes.length + 1);
    const updatedNodes = [...nodes, newNode];
    setNodesState(updatedNodes);
    setSelectedNodeId(newNode.id);
    onChange?.(updatedNodes);
    return newNode;
  }, [nodes, onChange]);

  const updateNode = useCallback((nodeId: string, updates: Partial<WorkflowNode>) => {
    const updatedNodes = nodes.map((node) =>
      node.id === nodeId ? { ...node, ...updates } as WorkflowNode : node
    );
    setNodesState(updatedNodes);
    onChange?.(updatedNodes);
  }, [nodes, onChange]);

  const deleteNode = useCallback((nodeId: string) => {
    const filteredNodes = nodes.filter((node) => node.id !== nodeId);
    // 重新排序 position
    const reorderedNodes = filteredNodes.map((node, index) => ({
      ...node,
      position: index + 1,
    }));
    setNodesState(reorderedNodes);
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }
    onChange?.(reorderedNodes);
  }, [nodes, selectedNodeId, onChange]);

  const moveNode = useCallback((fromIndex: number, toIndex: number) => {
    const updatedNodes = reorderNodes(nodes, fromIndex, toIndex);
    setNodesState(updatedNodes);
    onChange?.(updatedNodes);
  }, [nodes, onChange]);

  const selectNode = useCallback((nodeId: string | null) => {
    setSelectedNodeId(nodeId);
  }, []);

  const getSelectedNode = useCallback(() => {
    return nodes.find((node) => node.id === selectedNodeId) || null;
  }, [nodes, selectedNodeId]);

  return {
    nodes,
    selectedNodeId,
    addNode,
    updateNode,
    deleteNode,
    moveNode,
    selectNode,
    getSelectedNode,
    setNodes,
  };
}
