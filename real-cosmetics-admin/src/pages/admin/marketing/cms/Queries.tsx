import React, { useState, useEffect } from 'react';
import { PageContainer, PageHeader, Section, Panel } from '@/components/admin/PageContainer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Search, Filter, Download, Mail, Eye, Trash2, CheckCircle, X } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/admin/DataTable';
import { Dialog } from '@/components/ui/Dialog';
import { api } from '@/services/api';
import { CmsQuery } from '@/types';

export default function CmsQueries() {
  const [queries, setQueries] = useState<CmsQuery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedQuery, setSelectedQuery] = useState<CmsQuery | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    loadQueries();
  }, []);

  const loadQueries = async () => {
    setIsLoading(true);
    try {
      const data = await api.cmsQueries.list();
      setQueries(data);
    } catch (error) {
      console.error('Failed to load queries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: 'New' | 'Read' | 'Replied') => {
    try {
      await api.cmsQueries.update(id, { status: newStatus });
      loadQueries();
      if (selectedQuery && selectedQuery.id === id) {
        setSelectedQuery({ ...selectedQuery, status: newStatus });
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this query?')) {
      try {
        await api.cmsQueries.delete(id);
        loadQueries();
        if (selectedQuery?.id === id) {
          setIsDetailsOpen(false);
        }
      } catch (error) {
        console.error('Failed to delete query:', error);
      }
    }
  };

  const filteredQueries = queries.filter((query) => {
    const matchesSearch = 
      query.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      query.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      query.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || query.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openDetails = (query: CmsQuery) => {
    setSelectedQuery(query);
    setIsDetailsOpen(true);
    if (query.status === 'New') {
      handleStatusUpdate(query.id, 'Read');
    }
  };

  return (
    <PageContainer>
      <PageHeader title="CMS Queries">
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </PageHeader>
      
      <Section>
        <Panel className="p-0 overflow-hidden">
          <div className="border-b border-gray-200 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search subject, email..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <select 
                    className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">All Statuses</option>
                    <option value="New">New</option>
                    <option value="Read">Read</option>
                    <option value="Replied">Replied</option>
                </select>
              </div>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Form</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                    Loading queries...
                  </TableCell>
                </TableRow>
              ) : filteredQueries.length > 0 ? (
                filteredQueries.map((query) => (
                  <TableRow key={query.id} className="group cursor-pointer hover:bg-gray-50" onClick={() => openDetails(query)}>
                    <TableCell className="font-medium text-gray-900">{query.subject}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-900">{query.customerName}</span>
                        <span className="text-xs text-gray-500">{query.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono text-xs">{query.formId}</Badge>
                    </TableCell>
                    <TableCell className="text-gray-500">{query.date}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          query.status === 'New' ? 'destructive' : 
                          query.status === 'Replied' ? 'success' : 'secondary'
                        }
                        className={
                          query.status === 'New' ? 'bg-blue-100 text-blue-800' : 
                          query.status === 'Replied' ? 'bg-green-100 text-green-800' : 
                          'bg-gray-100 text-gray-800'
                        }
                      >
                        {query.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openDetails(query); }}>
                            <Eye className="h-4 w-4 text-gray-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDelete(query.id); }}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                      <p>No queries found.</p>
                      <Button variant="link" className="mt-2 text-[#ff0000]" onClick={() => {setSearchTerm(''); setStatusFilter('');}}>
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

      <Dialog
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title="Query Details"
        footer={
            <div className="flex justify-between w-full">
                <Button variant="destructive" onClick={() => handleDelete(selectedQuery!.id)}>Delete</Button>
                <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => setIsDetailsOpen(false)}>Close</Button>
                    {selectedQuery?.status !== 'Replied' && (
                        <Button onClick={() => handleStatusUpdate(selectedQuery!.id, 'Replied')}>
                            Mark as Replied
                        </Button>
                    )}
                </div>
            </div>
        }
      >
        {selectedQuery && (
            <div className="space-y-6">
                <div className="flex items-start justify-between border-b border-gray-100 pb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{selectedQuery.subject}</h3>
                        <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                            <Mail className="h-4 w-4" />
                            <span>{selectedQuery.email}</span>
                            <span className="text-gray-300">•</span>
                            <span>{selectedQuery.date}</span>
                        </div>
                    </div>
                    <Badge>{selectedQuery.formId}</Badge>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {selectedQuery.message}
                    </p>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">Internal Notes</label>
                    <textarea 
                        className="flex min-h-[100px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff0000]"
                        placeholder="Add internal notes here..."
                    />
                </div>
            </div>
        )}
      </Dialog>
    </PageContainer>
  );
}
