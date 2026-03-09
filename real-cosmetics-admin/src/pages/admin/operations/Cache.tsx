import React, { useState } from 'react';
import { PageContainer, PageHeader, Section, Panel } from '@/components/admin/PageContainer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { RefreshCw, Trash2, Server, Globe, Database, CheckCircle2 } from 'lucide-react';

export default function Cache() {
  const [isFlushModalOpen, setIsFlushModalOpen] = useState(false);
  const [flushConfirmation, setFlushConfirmation] = useState('');
  const [isFlushing, setIsFlushing] = useState(false);
  const [lastFlushed, setLastFlushed] = useState<string | null>(null);

  const handleFlush = () => {
    if (flushConfirmation === 'FLUSH') {
      setIsFlushing(true);
      // Simulate API call
      setTimeout(() => {
        setIsFlushing(false);
        setIsFlushModalOpen(false);
        setLastFlushed(new Date().toLocaleTimeString());
        setFlushConfirmation('');
      }, 2000);
    }
  };

  return (
    <PageContainer>
      <PageHeader title="Cache Operations" />
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Section className="mb-0">
          <Panel>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Globe className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">CDN Cache</h3>
                <p className="text-sm text-gray-500">Manage edge caching and invalidation.</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-md bg-gray-50 p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Status</span>
                  <Badge variant="success" className="bg-green-100 text-green-800">Operational</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Hit Rate</span>
                  <span className="text-sm font-mono text-gray-900">98.4%</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Revalidate Specific Paths</label>
                <div className="flex gap-2">
                  <Input placeholder="/products/*, /categories/new-arrivals" />
                  <Button variant="secondary">Revalidate</Button>
                </div>
                <p className="mt-1 text-xs text-gray-500">Comma separated paths. Wildcards supported.</p>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <Button 
                  variant="destructive" 
                  className="w-full justify-between"
                  onClick={() => setIsFlushModalOpen(true)}
                >
                  <span>Flush Entire CDN Cache</span>
                  <Trash2 className="h-4 w-4" />
                </Button>
                {lastFlushed && (
                  <p className="mt-2 text-center text-xs text-gray-500 flex items-center justify-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    Last flushed at {lastFlushed}
                  </p>
                )}
              </div>
            </div>
          </Panel>
        </Section>

        <Section className="mb-0">
          <Panel>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Database className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Application Cache</h3>
                <p className="text-sm text-gray-500">Redis / In-memory data store.</p>
              </div>
            </div>

            <div className="space-y-6">
               <div className="grid grid-cols-2 gap-4">
                 <div className="rounded-md bg-gray-50 p-4 text-center">
                   <p className="text-xs text-gray-500 uppercase tracking-wider">Keys</p>
                   <p className="text-2xl font-bold text-gray-900">14,203</p>
                 </div>
                 <div className="rounded-md bg-gray-50 p-4 text-center">
                   <p className="text-xs text-gray-500 uppercase tracking-wider">Memory</p>
                   <p className="text-2xl font-bold text-gray-900">248 MB</p>
                 </div>
               </div>

               <div>
                 <label className="text-sm font-medium text-gray-700 mb-2 block">Clear by Tag</label>
                 <div className="flex gap-2">
                    <select className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff0000]">
                        <option>product-data</option>
                        <option>user-sessions</option>
                        <option>config</option>
                    </select>
                    <Button variant="secondary">Clear</Button>
                 </div>
               </div>
            </div>
          </Panel>
        </Section>
      </div>

      <Dialog
        isOpen={isFlushModalOpen}
        onClose={() => setIsFlushModalOpen(false)}
        title="Flush CDN Cache?"
        description="This action will remove all cached content from the CDN edge locations. This may result in increased load on the origin server for a few minutes."
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsFlushModalOpen(false)}>Cancel</Button>
            <Button 
              variant="destructive" 
              disabled={flushConfirmation !== 'FLUSH'}
              onClick={handleFlush}
              isLoading={isFlushing}
            >
              Flush Cache
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 flex gap-2">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>Warning: This is a destructive action and cannot be undone.</p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Type <span className="font-mono font-bold">FLUSH</span> to confirm
            </label>
            <Input 
              value={flushConfirmation}
              onChange={(e) => setFlushConfirmation(e.target.value)}
              placeholder="FLUSH"
              className="font-mono uppercase"
            />
          </div>
        </div>
      </Dialog>
    </PageContainer>
  );
}

// Helper icon for the modal
function AlertCircle({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  );
}
