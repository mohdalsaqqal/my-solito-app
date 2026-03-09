import React, { useState } from 'react';
import { PageContainer, PageHeader, Section, Panel } from '@/components/admin/PageContainer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PromotionEditor() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'percentage',
    value: '',
    startDate: '',
    endDate: '',
    priority: '1',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.code) newErrors.code = 'Code is required';
    if (!formData.value) newErrors.value = 'Value is required';
    if (formData.type === 'percentage') {
        const val = parseFloat(formData.value);
        if (isNaN(val) || val <= 0 || val > 100) newErrors.value = 'Percentage must be between 0 and 100';
    }
    if (formData.type === 'fixed') {
        const val = parseFloat(formData.value);
        if (isNaN(val) || val <= 0) newErrors.value = 'Amount must be greater than 0';
    }
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      // Save logic here
      console.log('Saving', formData);
      navigate('/admin/marketing/promotions');
    }
  };

  return (
    <PageContainer dense>
      <div className="mb-6 flex items-center gap-4">
        <Link to="/admin/marketing/promotions" className="text-gray-500 hover:text-gray-900">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              {formData.name || 'New Promotion'}
            </h1>
            <Badge variant="secondary">Draft</Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline">Discard</Button>
            <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Promotion
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Section className="mb-0">
            <Panel>
              <h3 className="mb-4 text-lg font-medium">Basics</h3>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Promotion Name</label>
                  <Input 
                    placeholder="e.g. Summer Sale 2024" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    error={!!errors.name}
                  />
                  {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Coupon Code</label>
                  <Input 
                    placeholder="e.g. SUMMER20" 
                    className="font-mono uppercase"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    error={!!errors.code}
                  />
                  {errors.code && <span className="text-xs text-red-500">{errors.code}</span>}
                </div>
              </div>
            </Panel>
          </Section>

          <Section className="mb-0">
            <Panel>
              <h3 className="mb-4 text-lg font-medium">Reward</h3>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Type</label>
                        <select 
                            className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff0000]"
                            value={formData.type}
                            onChange={(e) => setFormData({...formData, type: e.target.value})}
                        >
                            <option value="percentage">Percentage Off</option>
                            <option value="fixed">Fixed Amount Off</option>
                        </select>
                    </div>
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Value</label>
                        <div className="relative">
                            <Input 
                                type="number"
                                placeholder="0" 
                                value={formData.value}
                                onChange={(e) => setFormData({...formData, value: e.target.value})}
                                error={!!errors.value}
                            />
                            <div className="absolute right-3 top-2.5 text-sm text-gray-500">
                                {formData.type === 'percentage' ? '%' : '$'}
                            </div>
                        </div>
                        {errors.value && <span className="text-xs text-red-500">{errors.value}</span>}
                    </div>
                </div>
                <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-700">
                    <p>Note: Only one highest-priority promotion applies per order.</p>
                </div>
              </div>
            </Panel>
          </Section>

          <Section className="mb-0">
            <Panel>
              <h3 className="mb-4 text-lg font-medium">Window</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Start Date</label>
                  <Input 
                    type="date" 
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    error={!!errors.startDate}
                  />
                  {errors.startDate && <span className="text-xs text-red-500">{errors.startDate}</span>}
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">End Date</label>
                  <Input 
                    type="date" 
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    error={!!errors.endDate}
                  />
                  {errors.endDate && <span className="text-xs text-red-500">{errors.endDate}</span>}
                </div>
              </div>
            </Panel>
          </Section>
        </div>

        <div className="space-y-6">
            <Section className="mb-0">
                <Panel>
                    <h3 className="mb-4 text-lg font-medium">Validation Summary</h3>
                    <div className="space-y-3">
                        <div className="flex items-start gap-2">
                            {formData.name && formData.code ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                            ) : (
                                <AlertCircle className="h-5 w-5 text-gray-300 shrink-0" />
                            )}
                            <div className="text-sm">
                                <p className="font-medium text-gray-900">Basic Info</p>
                                <p className="text-gray-500">Name and code required</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            {formData.value && !errors.value ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                            ) : (
                                <AlertCircle className="h-5 w-5 text-gray-300 shrink-0" />
                            )}
                            <div className="text-sm">
                                <p className="font-medium text-gray-900">Reward</p>
                                <p className="text-gray-500">Valid value required</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            {formData.startDate && formData.endDate ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                            ) : (
                                <AlertCircle className="h-5 w-5 text-gray-300 shrink-0" />
                            )}
                            <div className="text-sm">
                                <p className="font-medium text-gray-900">Schedule</p>
                                <p className="text-gray-500">Start and end dates required</p>
                            </div>
                        </div>
                    </div>
                </Panel>
            </Section>
            
            <Section className="mb-0">
                <Panel>
                    <h3 className="mb-4 text-lg font-medium">Priority</h3>
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Priority Level</label>
                        <select 
                            className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff0000]"
                            value={formData.priority}
                            onChange={(e) => setFormData({...formData, priority: e.target.value})}
                        >
                            <option value="1">1 (Highest)</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5 (Lowest)</option>
                        </select>
                        <p className="text-xs text-gray-500">Higher priority promotions override lower ones.</p>
                    </div>
                </Panel>
            </Section>
        </div>
      </div>
    </PageContainer>
  );
}
