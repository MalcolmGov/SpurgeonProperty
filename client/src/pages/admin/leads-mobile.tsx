import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminSidebar from '@/components/admin/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, Edit, Mail, Phone, Calendar, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Property {
  id: number;
  title: string;
  city: string;
  province: string;
}

interface Agent {
  id: number;
  name: string;
  avatar?: string;
}

interface Lead {
  id: number;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  status?: string;
  priority?: string;
  agentId?: number;
  propertyId?: number;
  createdAt?: string;
  property?: Property;
  agent?: Agent;
}

export default function AdminLeads() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    status: '',
    priority: '',
    agentId: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch leads
  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['/api/leads'],
    select: (data) => data || []
  });

  // Fetch agents
  const { data: agents = [] } = useQuery({
    queryKey: ['/api/agents'],
    select: (data) => data || []
  });

  // Filter leads
  const filteredLeads = leads.filter((lead: Lead) => {
    const matchesSearch = !searchQuery || 
      lead.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.property?.title?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !statusFilter || lead.status === statusFilter;
    const matchesPriority = !priorityFilter || lead.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Mutations
  const updateLeadMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update lead');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
      toast({ title: 'Lead updated successfully' });
    }
  });

  const handleStatusChange = (leadId: number, status: string) => {
    updateLeadMutation.mutate({ id: leadId, data: { status } });
  };

  const handlePriorityChange = (leadId: number, priority: string) => {
    updateLeadMutation.mutate({ id: leadId, data: { priority } });
  };

  const handleAssignAgent = (leadId: number, agentId: string) => {
    const finalAgentId = agentId === 'unassigned' ? null : parseInt(agentId);
    updateLeadMutation.mutate({ id: leadId, data: { agentId: finalAgentId } });
  };

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setEditForm({
      name: lead.name || '',
      email: lead.email || '',
      phone: lead.phone || '',
      message: lead.message || '',
      status: lead.status || 'new',
      priority: lead.priority || 'medium',
      agentId: lead.agentId?.toString() || 'unassigned'
    });
  };

  const handleSaveEdit = () => {
    if (!editingLead) return;
    
    const updateData = {
      name: editForm.name,
      email: editForm.email,
      phone: editForm.phone || null,
      message: editForm.message || null,
      status: editForm.status,
      priority: editForm.priority,
      agentId: editForm.agentId === 'unassigned' ? null : parseInt(editForm.agentId)
    };

    updateLeadMutation.mutate({ 
      id: editingLead.id, 
      data: updateData 
    });
    setEditingLead(null);
  };

  const handleCloseEdit = () => {
    setEditingLead(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'contacted': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'qualified': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
        <div className="flex">
          <AdminSidebar />
          <div className="flex-1 lg:ml-64 p-4">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-lg p-4 animate-pulse">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      <div className="flex">
        <AdminSidebar />
        
        <div className="flex-1 lg:ml-64 p-4">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white">
              Lead Management
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm lg:text-base">
              Manage and track customer inquiries and leads
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow mb-6 p-4">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                  All Leads ({filteredLeads.length})
                </h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search by name, email, property..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Status</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="qualified">Qualified</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Priority</Label>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="All Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Priority</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Table - Hidden on mobile */}
          <div className="hidden lg:block bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Property</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Agent</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredLeads.map((lead: Lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-slate-900 dark:text-white">{lead.name}</div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">{lead.email}</div>
                          {lead.phone && <div className="text-sm text-slate-500 dark:text-slate-400">{lead.phone}</div>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {lead.property ? (
                          <div className="text-sm text-slate-900 dark:text-white">{lead.property.title}</div>
                        ) : (
                          <span className="text-sm text-slate-500 dark:text-slate-400">General Inquiry</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Select value={lead.status || 'new'} onValueChange={(value) => handleStatusChange(lead.id, value)}>
                          <SelectTrigger className="w-32">
                            <Badge className={getStatusColor(lead.status || 'new')}>
                              {lead.status || 'new'}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="contacted">Contacted</SelectItem>
                            <SelectItem value="qualified">Qualified</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Select value={lead.priority || 'medium'} onValueChange={(value) => handlePriorityChange(lead.id, value)}>
                          <SelectTrigger className="w-28">
                            <Badge className={getPriorityColor(lead.priority || 'medium')}>
                              {lead.priority || 'medium'}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Select value={lead.agentId?.toString() || 'unassigned'} onValueChange={(value) => handleAssignAgent(lead.id, value)}>
                          <SelectTrigger className="w-36">
                            <SelectValue placeholder="Assign Agent" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unassigned">Unassigned</SelectItem>
                            {agents.map((agent: Agent) => (
                              <SelectItem key={agent.id} value={agent.id.toString()}>
                                {agent.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                        {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Button variant="ghost" size="sm" onClick={() => handleEditLead(lead)}>
                          <Edit className="w-4 h-4 text-purple-600" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View - Hidden on desktop */}
          <div className="lg:hidden space-y-4">
            {filteredLeads.length > 0 ? (
              filteredLeads.map((lead: Lead) => (
                <Card key={lead.id} className="bg-white dark:bg-slate-800">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white text-lg">
                          {lead.name}
                        </h3>
                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400 mt-1">
                          <Mail className="w-3 h-3 mr-1" />
                          {lead.email}
                        </div>
                        {lead.phone && (
                          <div className="flex items-center text-sm text-slate-600 dark:text-slate-400 mt-1">
                            <Phone className="w-3 h-3 mr-1" />
                            {lead.phone}
                          </div>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleEditLead(lead)}>
                        <Edit className="w-4 h-4 text-purple-600" />
                      </Button>
                    </div>

                    {lead.property && (
                      <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                        <div className="font-medium text-slate-900 dark:text-white text-sm">
                          {lead.property.title}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {lead.property.city}, {lead.property.province}
                        </div>
                      </div>
                    )}

                    {lead.message && (
                      <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                        <div className="text-sm text-slate-700 dark:text-slate-300">
                          "{lead.message}"
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3 items-center">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-slate-500 dark:text-slate-400">Status:</span>
                        <Select value={lead.status || 'new'} onValueChange={(value) => handleStatusChange(lead.id, value)}>
                          <SelectTrigger className="w-24 h-8">
                            <Badge className={`capitalize text-xs ${getStatusColor(lead.status || 'new')}`}>
                              {lead.status || 'new'}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="contacted">Contacted</SelectItem>
                            <SelectItem value="qualified">Qualified</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-slate-500 dark:text-slate-400">Priority:</span>
                        <Select value={lead.priority || 'medium'} onValueChange={(value) => handlePriorityChange(lead.id, value)}>
                          <SelectTrigger className="w-20 h-8">
                            <Badge className={`capitalize text-xs ${getPriorityColor(lead.priority || 'medium')}`}>
                              {lead.priority || 'medium'}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-600">
                      <div className="flex items-center">
                        {lead.agent ? (
                          <div className="flex items-center">
                            <img
                              src={lead.agent.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40"}
                              alt={lead.agent.name}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            <span className="ml-2 text-sm text-slate-900 dark:text-white">
                              {lead.agent.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-500 dark:text-slate-400">
                            Unassigned
                          </span>
                        )}
                      </div>
                      <Select value={lead.agentId?.toString() || 'unassigned'} onValueChange={(value) => handleAssignAgent(lead.id, value)}>
                        <SelectTrigger className="w-28 h-8">
                          <SelectValue placeholder="Assign" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          {agents.map((agent: Agent) => (
                            <SelectItem key={agent.id} value={agent.id.toString()}>
                              {agent.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg">
                <Search className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                <h3 className="text-xl font-semibold mb-2 text-slate-700 dark:text-slate-300">No leads found</h3>
                <p className="text-slate-500 dark:text-slate-400">Leads will appear here as customers inquire about properties</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Lead Dialog */}
      {editingLead && (
        <Dialog open={true} onOpenChange={handleCloseEdit}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>Edit Lead</DialogTitle>
                <Button variant="ghost" size="sm" onClick={handleCloseEdit}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Full Name</Label>
                  <Input
                    id="edit-name"
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={editForm.phone}
                  onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <Label htmlFor="edit-message">Message</Label>
                <Textarea
                  id="edit-message"
                  value={editForm.message}
                  onChange={(e) => setEditForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Enter message"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-status">Status</Label>
                  <Select value={editForm.status} onValueChange={(value) => setEditForm(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="qualified">Qualified</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-priority">Priority</Label>
                  <Select value={editForm.priority} onValueChange={(value) => setEditForm(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="edit-agent">Assigned Agent</Label>
                <Select value={editForm.agentId} onValueChange={(value) => setEditForm(prev => ({ ...prev, agentId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select agent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {agents.map((agent: Agent) => (
                      <SelectItem key={agent.id} value={agent.id.toString()}>
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={handleCloseEdit}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveEdit}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  disabled={updateLeadMutation.isPending}
                >
                  {updateLeadMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}