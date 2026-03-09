import React, { useState, useEffect } from 'react';
import { PageContainer, PageHeader, Section, Panel } from '@/components/admin/PageContainer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Search, Download, Filter, Activity, AlertCircle, CheckCircle } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/admin/DataTable';
import { api } from '@/services/api';
import { AuditLog } from '@/types';

export default function Audit() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [entityFilter, setEntityFilter] = useState('');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const data = await api.audit.list();
      setLogs(data);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEntity = !entityFilter || log.entity === entityFilter;
    return matchesSearch && matchesEntity;
  });

  const getStatusIcon = (status: string) => {
    return status === 'Success' ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <AlertCircle className="h-4 w-4 text-red-500" />
    );
  };

  const uniqueEntities = Array.from(new Set(logs.map(log => log.entity)));

  return (
    <PageContainer>
      <PageHeader 
        title="Audit Logs" 
        description="Track system activities and user actions."
      >
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Logs
        </Button>
      </PageHeader>
      
      <Section>
        <Panel className="p-0 overflow-hidden">
          <div className="border-b border-gray-200 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search logs..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <select 
                    className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950"
                    value={entityFilter}
                    onChange={(e) => setEntityFilter(e.target.value)}
                >
                    <option value="">All Entities</option>
                    {uniqueEntities.map(entity => (
                        <option key={entity} value={entity}>{entity}</option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                    Loading logs...
                  </TableCell>
                </TableRow>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-gray-50">
                    <TableCell className="text-gray-500 font-mono text-xs">
                        {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">{log.user}</TableCell>
                    <TableCell>
                        <Badge variant="outline">{log.action}</Badge>
                    </TableCell>
                    <TableCell>
                        <div className="flex flex-col">
                            <span className="text-sm text-gray-900">{log.entity}</span>
                            <span className="text-xs text-gray-500 font-mono">{log.entityId}</span>
                        </div>
                    </TableCell>
                    <TableCell className="text-gray-600 max-w-md truncate" title={log.details}>
                        {log.details}
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2">
                            {getStatusIcon(log.status)}
                            <span className={`text-sm ${log.status === 'Success' ? 'text-green-600' : 'text-red-600'}`}>
                                {log.status}
                            </span>
                        </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                      <Activity className="h-12 w-12 text-gray-300 mb-3" />
                      <p>No logs found matching your criteria.</p>
                      <Button variant="link" className="mt-2 text-[#ff0000]" onClick={() => {setSearchTerm(''); setEntityFilter('');}}>
                        Clear filters
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Panel>
      </Section>
    </PageContainer>
  );
}
