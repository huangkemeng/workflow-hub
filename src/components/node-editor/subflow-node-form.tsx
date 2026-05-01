'use client';

import { useState, useEffect } from 'react';
import { SubflowNodeData } from '@/types/node';
import { SubflowSelector } from '@/components/subflow/subflow-selector';
import { MappingEditor, ParameterMapping } from '@/components/subflow/mapping-editor';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitBranch, Settings, ArrowRightLeft, ArrowLeftRight } from 'lucide-react';

interface SubflowNodeFormProps {
  currentWorkflowId: string;
  data: SubflowNodeData;
  onChange: (data: SubflowNodeData) => void;
}

// 模拟可用字段
const mockAvailableFields = [
  'input.data',
  'input.userId',
  'input.timestamp',
  'context.workflowId',
  'context.executionId',
];

export function SubflowNodeForm({
  currentWorkflowId,
  data,
  onChange,
}: SubflowNodeFormProps) {
  const [activeTab, setActiveTab] = useState('basic');

  const handleSelectWorkflow = (workflowId: string, workflowTitle: string) => {
    onChange({
      ...data,
      subflowId: workflowId,
      subflowTitle: workflowTitle,
    });
  };

  const handleInputMappingsChange = (mappings: ParameterMapping[]) => {
    onChange({
      ...data,
      inputMappings: mappings.map((m) => ({
        sourceField: m.sourceField,
        targetField: m.targetField,
      })),
    });
  };

  const handleOutputMappingsChange = (mappings: ParameterMapping[]) => {
    onChange({
      ...data,
      outputMappings: mappings.map((m) => ({
        sourceField: m.sourceField,
        targetField: m.targetField,
      })),
    });
  };

  const handleVersionChange = (version: string) => {
    onChange({
      ...data,
      version,
    });
  };

  // 转换映射格式
  const inputMappings: ParameterMapping[] = (data.inputMappings || []).map(
    (m, index) => ({
      id: `input-${index}`,
      sourceField: m.sourceField,
      targetField: m.targetField,
    })
  );

  const outputMappings: ParameterMapping[] = (data.outputMappings || []).map(
    (m, index) => ({
      id: `output-${index}`,
      sourceField: m.sourceField,
      targetField: m.targetField,
    })
  );

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="w-full grid grid-cols-3">
        <TabsTrigger value="basic">
          <GitBranch className="mr-2 h-4 w-4" />
          基础配置
        </TabsTrigger>
        <TabsTrigger value="input">
          <ArrowRightLeft className="mr-2 h-4 w-4" />
          输入映射
        </TabsTrigger>
        <TabsTrigger value="output">
          <ArrowLeftRight className="mr-2 h-4 w-4" />
          输出映射
        </TabsTrigger>
      </TabsList>

      <TabsContent value="basic" className="mt-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">选择子流程</CardTitle>
          </CardHeader>
          <CardContent>
            <SubflowSelector
              currentWorkflowId={currentWorkflowId}
              selectedWorkflowId={data.subflowId}
              onSelect={handleSelectWorkflow}
            />
          </CardContent>
        </Card>

        {data.subflowId && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">版本选择</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Button
                  variant={data.version === 'latest' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleVersionChange('latest')}
                >
                  最新版本
                </Button>
                <Button
                  variant={data.version && data.version !== 'latest' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleVersionChange('v1')}
                >
                  指定版本
                </Button>
              </div>
              {data.version && data.version !== 'latest' && (
                <Input
                  className="mt-2"
                  placeholder="输入版本号 (如: v1, v2)"
                  value={data.version}
                  onChange={(e) => handleVersionChange(e.target.value)}
                />
              )}
            </CardContent>
          </Card>
        )}

        {data.subflowId && (
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <GitBranch className="h-4 w-4 text-primary" />
            <span className="text-sm">已选择:</span>
            <Badge variant="secondary">{data.subflowTitle}</Badge>
            <Badge variant="outline">{data.version || 'latest'}</Badge>
          </div>
        )}
      </TabsContent>

      <TabsContent value="input" className="mt-4">
        <MappingEditor
          title="输入参数映射"
          description="将当前工作流的数据映射到子流程的输入参数"
          mappings={inputMappings}
          availableSourceFields={mockAvailableFields}
          availableTargetFields={['subflow.input1', 'subflow.input2', 'subflow.input3']}
          onChange={handleInputMappingsChange}
        />
      </TabsContent>

      <TabsContent value="output" className="mt-4">
        <MappingEditor
          title="输出参数映射"
          description="将子流程的输出映射回当前工作流"
          mappings={outputMappings}
          availableSourceFields={['subflow.output1', 'subflow.output2', 'subflow.output3']}
          availableTargetFields={mockAvailableFields}
          onChange={handleOutputMappingsChange}
        />
      </TabsContent>
    </Tabs>
  );
}
