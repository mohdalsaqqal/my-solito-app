import React, { useState, useEffect } from 'react';
import { PageContainer, PageHeader, Section, Panel } from '@/components/admin/PageContainer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { Search, Plus, Calendar, Edit2, Trash2, Clock, CheckCircle, FileText } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/admin/DataTable';
import { api } from '@/services/api';
import { CmsRelease } from '@/types';

export default function Releases() {
  const [releases, setReleases] = useState<CmsRelease[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRelease, setEditingRelease] = useState<CmsRelease | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'Draft' as 'Draft' | 'Scheduled' | 'Published',
    scheduledDate: '',
  });

  useEffect(() => {
    loadReleases();
  }, []);

  const loadReleases = async () => {
    setIsLoading(true);
    try {
      const data = await api.releases.list();
      setReleases(data);
    } catch (error) {
      console.error('Failed to load releases:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (release?: CmsRelease) => {
    if (release) {
      setEditingRelease(release);
      setFormData({
        name: release.name,
        description: release.description || '',
        status: release.status,
        scheduledDate: release.scheduledDate || '',
      });
    } else {
      setEditingRelease(null);
      setFormData({
        name: '',
        description: '',
        status: 'Draft',
        scheduledDate: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingRelease) {
        await api.releases.update(editingRelease.id, formData);
      } else {
        await api.releases.create(formData);
      }
      setIsDialogOpen(false);
      loadReleases();
    } catch (error) {
      console.error('Failed to save release:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this release?')) {
      try {
        await api.releases.delete(id);
        loadReleases();
      } catch (error) {
        console.error('Failed to delete release:', error);
      }
    }
  };

  const filteredReleases = releases.filter((release) =>
    release.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Published':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Published</Badge>;
      case 'Scheduled':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Scheduled</Badge>;
      default:
        return <Badge variant="secondary">Draft</Badge>;
    }
  };

  return (
    <PageContainer>
      <PageHeader 
        title="CMS Releases" 
        description="Manage content releases and scheduled updates."
      >
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          New Release
        </Button>
      </PageHeader>
      
      <Section>
        <Panel className="p-0 overflow-hidden">
          <div className="border-b border-gray-200 p-4">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search releases..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Release Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Scheduled Date</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                    Loading releases...
                  </TableCell>
                </TableRow>
              ) : filteredReleases.length > 0 ? (
                filteredReleases.map((release) => (
                  <TableRow key={release.id} className="group hover:bg-gray-50">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{release.name}</span>
                        {release.description && (
                          <span className="text-xs text-gray-500 truncate max-w-xs">
                            {release.description}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(release.status)}</TableCell>
                    <TableCell className="text-gray-500">
                      {release.scheduledDate ? (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {release.scheduledDate}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">{release.updatedAt}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(release)}>
                          <Edit2 className="h-4 w-4 text-gray-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(release.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 text-gray-300 mb-3" />
                      <p>No releases found.</p>
                      <Button variant="link" className="mt-2 text-[#ff0000]" onClick={() => handleOpenDialog()}>
                        Create your first release
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
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={editingRelease ? 'Edit Release' : 'New Release'}
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>
              {editingRelease ? 'Save Changes' : 'Create Release'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Release Name</label>
            <Input
              placeholder="e.g. Summer Sale 2024"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff0000]"
              placeholder="Optional description..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <select
                className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              >
                <option value="Draft">Draft</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Published">Published</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Scheduled Date</label>
              <Input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                disabled={formData.status === 'Draft'}
              />
            </div>
          </div>
        </div>
      </Dialog>
    </PageContainer>
  );
}
