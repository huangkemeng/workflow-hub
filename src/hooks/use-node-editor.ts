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

  // 包装 setNodes 以触发 onChange - 使用函数式更新避免闭包问题
  const setNodes = useCallback((newNodes: WorkflowNode[] | ((prev: WorkflowNode[]) => WorkflowNode[])) => {
    setNodesState((prevNodes) => {
      const updatedNodes = typeof newNodes === 'function' 
        ? (newNodes as Function)(prevNodes) 
        : newNodes;
      onChangeRef.current?.(updatedNodes);
      return updatedNodes;
    });
  }, []);

  // 使用函数式更新避免依赖 nodes
  const addNode = useCallback((type: NodeType) => {
    let newNodeId: string = '';
    setNodesState((prevNodes) => {
      const newNode = createNode(type, prevNodes.length + 1);
      newNodeId = newNode.id;
      const updatedNodes = [...prevNodes, newNode];
      onChangeRef.current?.(updatedNodes);
      return updatedNodes;
    });
    setSelectedNodeId(newNodeId);
  }, []);

  const updateNode = useCallback((nodeId: string, updates: Partial<WorkflowNode>) => {
    setNodesState((prevNodes) => {
      const updatedNodes = prevNodes.map((node) =>
        node.id === nodeId ? { ...node, ...updates } as WorkflowNode : node
      );
      onChangeRef.current?.(updatedNodes);
      return updatedNodes;
    });
  }, []);

  const deleteNode = useCallback((nodeId: string) => {
    setNodesState((prevNodes) => {
      const filteredNodes = prevNodes.filter((node) => node.id !== nodeId);
      // 重新排序 position
      const reorderedNodes = filteredNodes.map((node, index) => ({
        ...node,
        position: index + 1,
      }));
      onChangeRef.current?.(reorderedNodes);
      return reorderedNodes;
    });
    setSelectedNodeId((prev) => prev === nodeId ? null : prev);
  }, []);

  const moveNode = useCallback((fromIndex: number, toIndex: number) => {
    setNodesState((prevNodes) => {
      const updatedNodes = reorderNodes(prevNodes, fromIndex, toIndex);
      onChangeRef.current?.(updatedNodes);
      return updatedNodes;
    });
  }, []);

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
    selectedNode,
    addNode,
    updateNode,
    deleteNode,
    moveNode,
    selectNode,
    getSelectedNode,
    setNodes,
  };
}
