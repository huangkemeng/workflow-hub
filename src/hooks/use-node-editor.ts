'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import { WorkflowNode, NodeType } from '@/types/node';
import { createNode, reorderNodes, sortNodesByPosition } from '@/lib/node-utils';

interface UseNodeEditorProps {
  initialNodes?: WorkflowNode[];
  onChange?: (nodes: WorkflowNode[]) => void;
}

export function useNodeEditor({ initialNodes = [], onChange }: UseNodeEditorProps = {}) {
  const [nodes, setNodesState] = useState<WorkflowNode[]>(sortNodesByPosition(initialNodes));
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  // 使用 ref 来保持 onChange 引用，避免依赖问题
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // 使用 useMemo 计算选中的节点，确保每次渲染都能获取最新值
  const selectedNode = useMemo(() => {
    return nodes.find((node) => node.id === selectedNodeId) || null;
  }, [nodes, selectedNodeId]);

  // 包装 setNodes 以触发 onChange
  const setNodes = useCallback((newNodes: WorkflowNode[] | ((prev: WorkflowNode[]) => WorkflowNode[])) => {
    const updatedNodes = typeof newNodes === 'function' 
      ? newNodes(nodes) 
      : newNodes;
    setNodesState(updatedNodes);
    onChangeRef.current?.(updatedNodes);
  }, [nodes]);

  const addNode = useCallback((type: NodeType) => {
    const newNode = createNode(type, nodes.length + 1);
    const updatedNodes = [...nodes, newNode];
    setNodesState(updatedNodes);
    setSelectedNodeId(newNode.id);
    onChangeRef.current?.(updatedNodes);
    return newNode;
  }, [nodes]);

  const updateNode = useCallback((nodeId: string, updates: Partial<WorkflowNode>) => {
    const updatedNodes = nodes.map((node) =>
      node.id === nodeId ? { ...node, ...updates } as WorkflowNode : node
    );
    setNodesState(updatedNodes);
    onChangeRef.current?.(updatedNodes);
  }, [nodes]);

  const deleteNode = useCallback((nodeId: string) => {
    const filteredNodes = nodes.filter((node) => node.id !== nodeId);
    // 重新排序 position
    const reorderedNodes = filteredNodes.map((node, index) => ({
      ...node,
      position: index + 1,
    }));
    setNodesState(reorderedNodes);
    setSelectedNodeId((prev) => prev === nodeId ? null : prev);
    onChangeRef.current?.(reorderedNodes);
  }, [nodes]);

  const moveNode = useCallback((fromIndex: number, toIndex: number) => {
    const updatedNodes = reorderNodes(nodes, fromIndex, toIndex);
    setNodesState(updatedNodes);
    onChangeRef.current?.(updatedNodes);
  }, [nodes]);

  const selectNode = useCallback((nodeId: string | null) => {
    setSelectedNodeId(nodeId);
  }, []);

  // 为了兼容性，保留 getSelectedNode 函数
  const getSelectedNode = useCallback(() => {
    return selectedNode;
  }, [selectedNode]);

  return {
    nodes,
    selectedNodeId,
    selectedNode, // 直接返回选中的节点
    addNode,
    updateNode,
    deleteNode,
    moveNode,
    selectNode,
    getSelectedNode,
    setNodes,
  };
}
