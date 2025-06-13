import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Mail, Phone, User, Building, Calendar, CheckCircle, Clock, AlertCircle } from "lucide-react";
import AdminSidebar from "@/components/admin/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";

const agentFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
  bio: z.string().optional(),
  specialties: z.string().optional(),
});

type AgentFormData = z.infer<typeof agentFormSchema>;

interface Agent {
  id: number;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  specialties?: string[];
  rating?: string;
  totalSales?: number;
  isActive: boolean;
  lastLogin?: Date;
  createdAt?: Date;
}

interface Lead {
  id: number;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: string;
  agentResponse?: string;
  createdAt: Date;
  property?: {
    id: number;
    title: string;
    price: string;
  };
}

function AgentForm({ agent, onSuccess }: { agent?: Agent; onSuccess: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AgentFormData>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: {
      name: agent?.name || "",
      email: agent?.email || "",
      password: "",
      phone: agent?.phone || "",
      bio: agent?.bio || "",
      specialties: agent?.specialties?.join(", ") || "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: AgentFormData) => {
      const formattedData = {
        ...data,
        specialties: data.specialties ? data.specialties.split(",").map(s => s.trim()).filter(Boolean) : [],
      };
      return apiRequest(`/api/admin/agents`, {
        method: "POST",
        body: JSON.stringify(formattedData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/agents"] });
      toast({ title: "Agent created successfully" });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Error creating agent",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: AgentFormData) => {
      const formattedData = {
        ...data,
        specialties: data.specialties ? data.specialties.split(",").map(s => s.trim()).filter(Boolean) : [],
      };
      if (!data.password) {
        delete formattedData.password;
      }
      return apiRequest(`/api/admin/agents/${agent!.id}`, {
        method: "PUT",
        body: JSON.stringify(formattedData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/agents"] });
      toast({ title: "Agent updated successfully" });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Error updating agent",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AgentFormData) => {
    if (agent) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Agent name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="agent@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{agent ? "New Password (leave blank to keep current)" : "Password"}</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input placeholder="Phone number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specialties"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Specialties (comma-separated)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Residential, Commercial, Luxury" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea placeholder="Agent biography" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={createMutation.isPending || updateMutation.isPending}
          className="w-full"
        >
          {createMutation.isPending || updateMutation.isPending
            ? "Saving..."
            : agent
            ? "Update Agent"
            : "Create Agent"}
        </Button>
      </form>
    </Form>
  );
}

function AgentEnquiries({ agentId }: { agentId: number }) {
  const { data: enquiries = [] } = useQuery<Lead[]>({
    queryKey: [`/api/agent/enquiries`, agentId],
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "new":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "contacted":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "responded":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "closed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "new":
        return <AlertCircle className="w-4 h-4" />;
      case "contacted":
        return <Clock className="w-4 h-4" />;
      case "responded":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Recent Enquiries</h3>
      {enquiries.length === 0 ? (
        <p className="text-slate-600 dark:text-slate-400">No enquiries assigned to this agent.</p>
      ) : (
        <div className="space-y-3">
          {enquiries.slice(0, 5).map((enquiry) => (
            <Card key={enquiry.id} className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium">{enquiry.name}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{enquiry.email}</p>
                </div>
                <Badge className={`${getStatusColor(enquiry.status)} flex items-center gap-1`}>
                  {getStatusIcon(enquiry.status)}
                  {enquiry.status}
                </Badge>
              </div>
              {enquiry.property && (
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  Property: {enquiry.property.title} - {enquiry.property.price}
                </div>
              )}
              <p className="text-sm">{enquiry.message}</p>
              {enquiry.agentResponse && (
                <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded">
                  <p className="text-sm font-medium text-green-800 dark:text-green-400">Agent Response:</p>
                  <p className="text-sm text-green-700 dark:text-green-300">{enquiry.agentResponse}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminAgents() {
  const { isLoading: authLoading, isAuthenticated } = useAdminAuth();
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showEnquiries, setShowEnquiries] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: agents = [], isLoading } = useQuery<Agent[]>({
    queryKey: ["/api/admin/agents"],
    enabled: isAuthenticated,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/admin/agents/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/agents"] });
      toast({ title: "Agent deleted successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting agent",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedAgent(null);
  };

  const handleEdit = (agent: Agent) => {
    setSelectedAgent(agent);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this agent?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      <AdminSidebar />
      
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Agent Management</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Manage real estate agents and their enquiry assignments
              </p>
            </div>
            
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setSelectedAgent(null)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Agent
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {selectedAgent ? "Edit Agent" : "Add New Agent"}
                  </DialogTitle>
                </DialogHeader>
                <AgentForm agent={selectedAgent || undefined} onSuccess={handleFormSuccess} />
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {agents.map((agent) => (
                <Card key={agent.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{agent.name}</CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant={agent.isActive ? "default" : "secondary"}>
                              {agent.isActive ? "Active" : "Inactive"}
                            </Badge>
                            {agent.rating && (
                              <Badge variant="outline">★ {agent.rating}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(agent)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(agent.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                      <Mail className="w-4 h-4 mr-2" />
                      {agent.email}
                    </div>
                    
                    {agent.phone && (
                      <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                        <Phone className="w-4 h-4 mr-2" />
                        {agent.phone}
                      </div>
                    )}
                    
                    {agent.specialties && agent.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {agent.specialties.map((specialty, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {agent.bio && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                        {agent.bio}
                      </p>
                    )}
                    
                    <div className="flex justify-between items-center pt-2 border-t">
                      <div className="text-xs text-slate-500">
                        {agent.totalSales && (
                          <span>R{agent.totalSales.toLocaleString()} total sales</span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowEnquiries(showEnquiries === agent.id ? null : agent.id)}
                      >
                        <Building className="w-4 h-4 mr-1" />
                        Enquiries
                      </Button>
                    </div>
                    
                    {showEnquiries === agent.id && (
                      <div className="mt-4 pt-4 border-t">
                        <AgentEnquiries agentId={agent.id} />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && agents.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <User className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  No agents yet
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Get started by adding your first agent to manage property enquiries.
                </p>
                <Button onClick={() => setIsFormOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Agent
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}