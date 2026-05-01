'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import { Connection, ConnectionType, CreateConnectionRequest } from '@/types/connection';
import { WorkflowNode } from '@/types/node';
import {
  createConnection,
  validateConnection,
  deleteConnection as deleteConn,
  updateConnection as updateConn,
  getNodeConnections,
} from '@/lib/connection-utils';

interface UseConnectionsProps {
  initialConnections?: Connection[];
  nodes: WorkflowNode[];
  onChange?: (connections: Connection[]) => void;
}

export function useConnections({
  initialConnections = [],
  nodes,
  onChange,
}: UseConnectionsProps) {
  const [connections, setConnectionsState] = useState<Connection[]>(initialConnections);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [tempConnection, setTempConnection] = useState<{
    source: string;
    target: string | null;
  } | null>(null);

  // 使用 ref 来保持 onChange 引用
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // 使用 useMemo 计算选中的连接
  const selectedConnection = useMemo(() => {
    return connections.find((c) => c.id === selectedConnectionId) || null;
  }, [connections, selectedConnectionId]);

  // 包装 setConnections 以触发 onChange - 使用函数式更新
  const setConnections = useCallback((newConnections: Connection[] | ((prev: Connection[]) => Connection[])) => {
    setConnectionsState((prevConnections) => {
      const updatedConnections = typeof newConnections === 'function'
        ? (newConnections as Function)(prevConnections)
        : newConnections;
      onChangeRef.current?.(updatedConnections);
      return updatedConnections;
    });
  }, []);

  // 开始创建连接
  const startConnection = useCallback((sourceNodeId: string) => {
    setIsCreating(true);
    setTempConnection({ source: sourceNodeId, target: null });
  }, []);

  // 更新临时连接目标
  const updateTempTarget = useCallback((targetNodeId: string | null) => {
    setTempConnection((prev) => prev ? { ...prev, target: targetNodeId } : null);
  }, []);

  // 完成创建连接 - 使用函数式更新避免闭包问题
  const completeConnection = useCallback(
    (type: ConnectionType = 'sequential', options?: { label?: string; condition?: string; color?: string }) => {
      let newConnection: Connection | null = null;
      
      setConnectionsState((prevConnections) => {
        setTempConnection((prevTemp) => {
          if (!prevTemp?.target) return null;

          const validation = validateConnection(
            prevTemp.source,
            prevTemp.target,
            prevConnections,
            nodes
          );

          if (!validation.valid) {
            setIsCreating(false);
            return null;
          }

          newConnection = createConnection(
            prevTemp.source,
            prevTemp.target,
            type,
            options
          );

          const updatedConnections = [...prevConnections, newConnection];
          onChangeRef.current?.(updatedConnections);
          
          // 更新 connectionsState
          setConnectionsState(() => updatedConnections);
          
          setIsCreating(false);
          return null;
        });
        return prevConnections;
      });

      return newConnection;
    },
    [nodes]
  );

  // 取消创建连接
  const cancelConnection = useCallback(() => {
    setIsCreating(false);
    setTempConnection(null);
  }, []);

  // 删除连接
  const deleteConnection = useCallback(
    (connectionId: string) => {
      setConnectionsState((prevConnections) => {
        const updatedConnections = deleteConn(connectionId, prevConnections);
        onChangeRef.current?.(updatedConnections);
        return updatedConnections;
      });
      setSelectedConnectionId((prev) => prev === connectionId ? null : prev);
    }, []
  );

  // 更新连接
  const updateConnection = useCallback(
    (connectionId: string, updates: Partial<Connection>) => {
      setConnectionsState((prevConnections) => {
        const updatedConnections = updateConn(connectionId, updates, prevConnections);
        onChangeRef.current?.(updatedConnections);
        return updatedConnections;
      });
    }, []
  );

  // 选择连接
  const selectConnection = useCallback((connectionId: string | null) => {
    setSelectedConnectionId(connectionId);
  }, []);

  // 为了兼容性，保留 getSelectedConnection 函数
  const getSelectedConnection = useCallback(() => {
    return selectedConnection;
  }, [selectedConnection]);

  // 获取节点的连接信息
  const getConnectionsForNode = useCallback(
    (nodeId: string) => {
      return getNodeConnections(nodeId, connections);
    },
    [connections]
  );

  // 验证连接
  const validateNewConnection = useCallback(
    (sourceId: string, targetId: string) => {
      return validateConnection(sourceId, targetId, connections, nodes);
    },
    [connections, nodes]
  );

  return {
    connections,
    selectedConnectionId,
    selectedConnection,
    isCreating,
    tempConnection,
    startConnection,
    completeConnection,
    cancelConnection,
    deleteConnection,
    updateConnection,
    selectConnection,
    getSelectedConnection,
    setConnections,
    updateTempTarget,
    getConnectionsForNode,
    validateNewConnection,
  };
}
