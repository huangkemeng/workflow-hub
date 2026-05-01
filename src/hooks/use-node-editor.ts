'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { WorkflowNode, NodeType } from '@/types/node';
import { createNode, reorderNodes, sortNodesByPosition } from '@/lib/node-utils';

interface UseNodeEditorProps {
  initialNodes?: WorkflowNode[];
  onChange?: (nodes: WorkflowNode[]) => void;
}

export function useNodeEditor({ initialNodes = [], onChange }: UseNodeEditorProps = {}) {
  const [nodes, setNodesState] = useState<WorkflowNode[]>(sortNodesByPosition(initialNodes));
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  // 使用 ref 来保持最新的 nodes 状态
  const nodesRef = useRef(nodes);
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  // 包装 setNodes 以触发 onChange
  const setNodes = useCallback((newNodes: WorkflowNode[] | ((prev: WorkflowNode[]) => WorkflowNode[])) => {
    const updatedNodes = typeof newNodes === 'function' 
      ? newNodes(nodesRef.current) 
      : newNodes;
    setNodesState(updatedNodes);
    onChange?.(updatedNodes);
  }, [onChange]);

  const addNode = useCallback((type: NodeType) => {
    const currentNodes = nodesRef.current;
    const newNode = createNode(type, currentNodes.length + 1);
    const updatedNodes = [...currentNodes, newNode];
    setNodesState(updatedNodes);
    setSelectedNodeId(newNode.id);
    onChange?.(updatedNodes);
    return newNode;
  }, [onChange]);

  const updateNode = useCallback((nodeId: string, updates: Partial<WorkflowNode>) => {
    const currentNodes = nodesRef.current;
    const updatedNodes = currentNodes.map((node) =>
      node.id === nodeId ? { ...node, ...updates } as WorkflowNode : node
    );
    setNodesState(updatedNodes);
    onChange?.(updatedNodes);
  }, [onChange]);

  const deleteNode = useCallback((nodeId: string) => {
    const currentNodes = nodesRef.current;
    const filteredNodes = currentNodes.filter((node) => node.id !== nodeId);
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
  }, [selectedNodeId, onChange]);

  const moveNode = useCallback((fromIndex: number, toIndex: number) => {
    const currentNodes = nodesRef.current;
    const updatedNodes = reorderNodes(currentNodes, fromIndex, toIndex);
    setNodesState(updatedNodes);
    onChange?.(updatedNodes);
  }, [onChange]);

  const selectNode = useCallback((nodeId: string | null) => {
    setSelectedNodeId(nodeId);
  }, []);

  const getSelectedNode = useCallback(() => {
    return nodesRef.current.find((node) => node.id === selectedNodeId) || null;
  }, [selectedNodeId]);

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
