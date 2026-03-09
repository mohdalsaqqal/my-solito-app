import React, { useState, useEffect } from 'react';
import { PageContainer, PageHeader, Panel } from '@/components/admin/PageContainer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Plus, GripVertical, Image as ImageIcon, Type, Layout, AlertCircle, CheckCircle2, Save, X, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog } from '@/components/ui/Dialog';
import { api } from '@/services/api';
import { Block } from '@/types';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const BLOCK_TYPES = {
  hero: { icon: Layout, label: 'Hero Section' },
  text: { icon: Type, label: 'Text Block' },
  image: { icon: ImageIcon, label: 'Image Gallery' },
};

interface SortableBlockItemProps extends React.HTMLAttributes<HTMLDivElement> {
  block: Block;
  isSelected: boolean;
  onClick: () => void;
}

const SortableBlockItem: React.FC<SortableBlockItemProps> = ({ block, isSelected, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    opacity: isDragging ? 0.5 : 1,
  };

  const Icon = BLOCK_TYPES[block.type as keyof typeof BLOCK_TYPES].icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 rounded-md border p-3 cursor-pointer transition-all hover:shadow-sm bg-white",
        isSelected
          ? "border-[#ff0000] bg-red-50/10 ring-1 ring-[#ff0000]"
          : "border-gray-200 hover:border-gray-300"
      )}
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 -ml-1 hover:bg-gray-100 rounded">
        <GripVertical className="h-4 w-4 text-gray-400" />
      </div>
      <div className="rounded bg-gray-100 p-2">
        <Icon className="h-4 w-4 text-gray-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{block.title}</p>
        <p className="text-xs text-gray-500">{BLOCK_TYPES[block.type as keyof typeof BLOCK_TYPES].label}</p>
      </div>
      {block.status === 'valid' ? (
        <CheckCircle2 className="h-4 w-4 text-green-500" />
      ) : (
        <AlertCircle className="h-4 w-4 text-red-500" />
      )}
    </div>
  );
}

const BlockPreview: React.FC<{ block: Block }> = ({ block }) => {
  switch (block.type) {
    case 'hero':
      return (
        <div className="relative h-64 w-full overflow-hidden bg-gray-900 text-white rounded-lg mb-8 shadow-md">
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent z-10" />
            <img 
                src={block.data?.bgImage || "https://picsum.photos/seed/placeholder/800/400"} 
                alt="Hero" 
                className="absolute inset-0 h-full w-full object-cover opacity-50"
            />
            <div className="relative z-20 flex h-full flex-col justify-center px-8">
                <h1 className="text-4xl font-bold mb-2">{block.data?.headline || "Headline"}</h1>
                <p className="text-xl opacity-90">{block.data?.subheadline || "Subheadline"}</p>
                <Button className="mt-4 w-fit" variant="secondary">{block.data?.ctaText || "Call to Action"}</Button>
            </div>
        </div>
      );
    case 'text':
      return (
        <div className="prose max-w-none py-8 px-4 mb-8 bg-white rounded-lg border border-gray-100 shadow-sm mx-auto w-full">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">{block.title}</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {block.data?.content || "No content entered."}
            </p>
        </div>
      );
    case 'image':
      return (
        <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 px-4">{block.title}</h3>
            <div className="grid grid-cols-3 gap-4 px-4">
                {block.data?.images?.map((img: string, i: number) => (
                    <div key={i} className="aspect-square rounded-lg bg-gray-100 overflow-hidden shadow-sm">
                        <img 
                            src={img} 
                            alt={`Gallery ${i}`} 
                            className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                    </div>
                )) || <div className="col-span-3 text-center text-gray-400">No images</div>}
            </div>
        </div>
      );
    default:
      return <div className="p-4 border border-dashed border-gray-300 rounded mb-4">Unknown Block Type</div>;
  }
};

export default function Blocks() {
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadBlocks();
  }, []);

  const loadBlocks = async () => {
    setIsLoading(true);
    try {
      const data = await api.blocks.list();
      setBlocks(data);
      if (data.length > 0 && !selectedBlockId) {
        setSelectedBlockId(data[0].id);
      }
    } catch (error) {
      console.error('Failed to load blocks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await api.blocks.updateAll(blocks);
      // Show success toast (mock)
      alert('Changes published successfully!');
    } catch (error) {
      console.error('Failed to save blocks:', error);
      alert('Failed to publish changes.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddBlock = async () => {
    const newBlock: Omit<Block, 'id'> = {
        type: 'text',
        title: 'New Text Block',
        status: 'valid',
        data: { content: '' }
    };
    try {
        const created = await api.blocks.create(newBlock);
        setBlocks([...blocks, created]);
        setSelectedBlockId(created.id);
    } catch (error) {
        console.error('Failed to create block:', error);
    }
  };

  const handleDeleteBlock = async (id: string) => {
    if (confirm('Are you sure you want to delete this block?')) {
        try {
            await api.blocks.delete(id);
            const newBlocks = blocks.filter(b => b.id !== id);
            setBlocks(newBlocks);
            if (selectedBlockId === id) {
                setSelectedBlockId(newBlocks[0]?.id || null);
            }
        } catch (error) {
            console.error('Failed to delete block:', error);
        }
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const updateBlockData = (id: string, field: string, value: any) => {
    setBlocks(prev => prev.map(block => {
      if (block.id === id) {
        if (field === 'title') {
            return { ...block, title: value };
        }
        return {
          ...block,
          data: {
            ...block.data,
            [field]: value
          }
        };
      }
      return block;
    }));
  };

  const selectedBlock = blocks.find(b => b.id === selectedBlockId);

  return (
    <PageContainer dense>
      <PageHeader title="CMS Blocks">
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsPreviewOpen(true)}>Preview</Button>
            <Button 
                disabled={blocks.some(b => b.status === 'invalid') || isSaving}
                onClick={handleSaveAll}
            >
                {isSaving ? 'Publishing...' : 'Publish Changes'}
            </Button>
        </div>
      </PageHeader>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 h-[calc(100vh-200px)] min-h-[600px]">
        {/* Left Panel: Block List */}
        <div className="flex flex-col gap-4">
            <Panel className="flex-1 flex flex-col p-0 overflow-hidden">
                <div className="border-b border-gray-200 p-4 bg-gray-50 flex justify-between items-center">
                    <h3 className="font-medium text-sm text-gray-700">Content Blocks</h3>
                    <Button size="sm" variant="ghost" onClick={handleAddBlock}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {isLoading ? (
                    <div className="p-4 text-center text-sm text-gray-500">Loading blocks...</div>
                  ) : (
                    <DndContext 
                        sensors={sensors} 
                        collisionDetection={closestCenter} 
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext 
                        items={blocks.map(b => b.id)} 
                        strategy={verticalListSortingStrategy}
                        >
                        {blocks.map((block) => (
                            <SortableBlockItem
                            key={block.id}
                            block={block}
                            isSelected={selectedBlockId === block.id}
                            onClick={() => setSelectedBlockId(block.id)}
                            />
                        ))}
                        </SortableContext>
                    </DndContext>
                  )}
                </div>
            </Panel>
        </div>

        {/* Right Panel: Editor */}
        <div className="lg:col-span-2 flex flex-col">
            <Panel className="flex-1 flex flex-col p-0 overflow-hidden h-full">
                {selectedBlock ? (
                    <>
                        <div className="border-b border-gray-200 p-4 bg-gray-50 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-500">Editing:</span>
                                <span className="text-sm font-bold text-gray-900">{selectedBlock.title}</span>
                                {selectedBlock.status === 'invalid' && (
                                    <Badge variant="destructive" className="ml-2">Invalid</Badge>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="destructive" onClick={() => handleDeleteBlock(selectedBlock.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                <Button size="sm">
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Block
                                </Button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="max-w-2xl space-y-6">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Block Title</label>
                                    <Input 
                                        value={selectedBlock.title} 
                                        onChange={(e) => updateBlockData(selectedBlock.id, 'title', e.target.value)}
                                    />
                                </div>
                                
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Internal ID</label>
                                    <Input defaultValue={selectedBlock.id} disabled className="bg-gray-50 font-mono text-xs" />
                                </div>

                                <div className="border-t border-gray-100 pt-6">
                                    <h4 className="mb-4 text-sm font-medium text-gray-900">Content Configuration</h4>
                                    
                                    {selectedBlock.type === 'hero' && (
                                        <div className="space-y-4">
                                            <div className="grid gap-2">
                                                <label className="text-sm font-medium">Headline</label>
                                                <Input 
                                                    value={selectedBlock.data?.headline || ''} 
                                                    onChange={(e) => updateBlockData(selectedBlock.id, 'headline', e.target.value)}
                                                    placeholder="Enter headline..." 
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <label className="text-sm font-medium">Subheadline</label>
                                                <Input 
                                                    value={selectedBlock.data?.subheadline || ''} 
                                                    onChange={(e) => updateBlockData(selectedBlock.id, 'subheadline', e.target.value)}
                                                    placeholder="Enter subheadline..." 
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <label className="text-sm font-medium">Background Image URL</label>
                                                <Input 
                                                    value={selectedBlock.data?.bgImage || ''} 
                                                    onChange={(e) => updateBlockData(selectedBlock.id, 'bgImage', e.target.value)}
                                                    placeholder="https://..." 
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <label className="text-sm font-medium">CTA Text</label>
                                                <Input 
                                                    value={selectedBlock.data?.ctaText || ''} 
                                                    onChange={(e) => updateBlockData(selectedBlock.id, 'ctaText', e.target.value)}
                                                    placeholder="Shop Now" 
                                                />
                                            </div>
                                        </div>
                                    )}
                                    {selectedBlock.type === 'text' && (
                                        <div className="space-y-4">
                                            <div className="grid gap-2">
                                                <label className="text-sm font-medium">Content</label>
                                                <textarea 
                                                    className="flex min-h-[120px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff0000]" 
                                                    placeholder="Enter text content..." 
                                                    value={selectedBlock.data?.content || ''}
                                                    onChange={(e) => updateBlockData(selectedBlock.id, 'content', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    )}
                                    {selectedBlock.type === 'image' && (
                                        <div className="space-y-4">
                                            <div className="rounded-md border border-dashed border-gray-300 p-8 text-center">
                                                <ImageIcon className="mx-auto h-8 w-8 text-gray-400" />
                                                <p className="mt-2 text-sm text-gray-500">Drag and drop images here</p>
                                            </div>
                                            {selectedBlock.status === 'invalid' && (
                                                <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 flex items-center gap-2">
                                                    <AlertCircle className="h-4 w-4" />
                                                    {selectedBlock.error}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-1 items-center justify-center text-gray-500">
                        Select a block to edit
                    </div>
                )}
            </Panel>
        </div>
      </div>

      <Dialog
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Page Preview"
        className="max-w-4xl"
        footer={
            <Button onClick={() => setIsPreviewOpen(false)}>Close Preview</Button>
        }
      >
        <div className="bg-gray-50 rounded-lg border border-gray-200 min-h-[400px] overflow-hidden">
            <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-2">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 text-center text-xs text-gray-400 font-mono">
                    localhost:3000/preview
                </div>
            </div>
            <div className="p-0 h-[60vh] overflow-y-auto bg-white">
                {blocks.map(block => (
                    <BlockPreview key={block.id} block={block} />
                ))}
            </div>
        </div>
      </Dialog>
    </PageContainer>
  );
}
