import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Mail, Phone, User, Building, Calendar, CheckCircle, Clock, AlertCircle, Upload, Camera, Globe, Award, MapPin, Languages } from "lucide-react";
import AdminSidebar from "@/components/admin/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";

// Create schema dynamically based on whether we're editing or creating
const createAgentFormSchema = (isEditing: boolean) => z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: isEditing 
    ? z.string().optional().refine((val) => !val || val.length >= 6, {
        message: "Password must be at least 6 characters if provided"
      })
    : z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
  bio: z.string().optional(),
  specialties: z.string().optional(),
  // Enhanced professional details
  title: z.string().optional(),
  licenseNumber: z.string().optional(),
  yearsExperience: z.string().optional(),
  languages: z.string().optional(),
  education: z.string().optional(),
  certifications: z.string().optional(),
  officeLocation: z.string().optional(),
  workingHours: z.string().optional(),
  linkedinUrl: z.string().optional(),
  personalWebsite: z.string().optional(),
});

const agentFormSchema = createAgentFormSchema(false);

type AgentFormData = z.infer<typeof agentFormSchema>;

interface Agent {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  specialties?: string[];
  // Enhanced professional details
  title?: string;
  licenseNumber?: string;
  yearsExperience?: number;
  languages?: string[];
  education?: string;
  certifications?: string[];
  officeLocation?: string;
  workingHours?: string;
  linkedinUrl?: string;
  personalWebsite?: string;
  // Performance metrics
  rating?: string;
  totalSales?: number;
  totalListings?: number;
  averageResponseTime?: number;
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<AgentFormData>({
    resolver: zodResolver(createAgentFormSchema(!!agent)),
    defaultValues: {
      name: agent?.name || "",
      email: agent?.email || "",
      password: "",
      phone: agent?.phone || "",
      bio: agent?.bio || "",
      specialties: agent?.specialties?.join(", ") || "",
      title: agent?.title || "",
      licenseNumber: agent?.licenseNumber || "",
      yearsExperience: agent?.yearsExperience?.toString() || "",
      languages: agent?.languages?.join(", ") || "",
      education: agent?.education || "",
      certifications: agent?.certifications?.join(", ") || "",
      officeLocation: agent?.officeLocation || "",
      workingHours: agent?.workingHours || "",
      linkedinUrl: agent?.linkedinUrl || "",
      personalWebsite: agent?.personalWebsite || "",
    },
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      console.log('Upload response:', data);
      const imageUrl = data.urls?.[0] || data.url;
      console.log('Setting uploaded image to:', imageUrl);
      setUploadedImage(imageUrl);
      toast({ title: "Photo uploaded successfully" });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data: AgentFormData) => {
      const formattedData = {
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone || undefined,
        bio: data.bio || undefined,
        specialties: data.specialties ? data.specialties.split(",").map(s => s.trim()).filter(Boolean) : [],
        title: data.title || undefined,
        licenseNumber: data.licenseNumber || undefined,
        yearsExperience: data.yearsExperience ? parseInt(data.yearsExperience) || 0 : 0,
        languages: data.languages ? data.languages.split(",").map(s => s.trim()).filter(Boolean) : [],
        education: data.education || undefined,
        certifications: data.certifications ? data.certifications.split(",").map(s => s.trim()).filter(Boolean) : [],
        officeLocation: data.officeLocation || undefined,
        workingHours: data.workingHours || undefined,
        linkedinUrl: data.linkedinUrl || undefined,
        personalWebsite: data.personalWebsite || undefined,
        avatar: uploadedImage || undefined,
      };
      return apiRequest("POST", `/api/admin/agents`, formattedData);
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
      const formattedData: any = {
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        bio: data.bio || undefined,
        specialties: data.specialties ? data.specialties.split(",").map(s => s.trim()).filter(Boolean) : [],
        title: data.title || undefined,
        licenseNumber: data.licenseNumber || undefined,
        yearsExperience: data.yearsExperience ? parseInt(data.yearsExperience) || 0 : 0,
        languages: data.languages ? data.languages.split(",").map(s => s.trim()).filter(Boolean) : [],
        education: data.education || undefined,
        certifications: data.certifications ? data.certifications.split(",").map(s => s.trim()).filter(Boolean) : [],
        officeLocation: data.officeLocation || undefined,
        workingHours: data.workingHours || undefined,
        linkedinUrl: data.linkedinUrl || "",
        personalWebsite: data.personalWebsite || "",
        avatar: uploadedImage || agent?.avatar || undefined,
      };
      if (data.password && data.password.trim()) {
        formattedData.password = data.password;
      }
      console.log('Current uploadedImage state:', uploadedImage);
      console.log('Current agent avatar:', agent?.avatar);
      console.log('Final avatar value:', formattedData.avatar);
      console.log('Formatted data being sent:', formattedData);
      return apiRequest("PUT", `/api/admin/agents/${agent!.id}`, formattedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/agents"] });
      toast({ title: "Agent updated successfully" });
      onSuccess();
    },
    onError: (error: any) => {
      console.error('Update agent error:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast({
        title: "Error updating agent",
        description: error.response?.data?.message || error.message || "Failed to update agent",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AgentFormData) => {
    console.log('Form submitted with data:', data);
    console.log('Form errors:', form.formState.errors);
    console.log('Is form valid:', form.formState.isValid);
    
    if (agent) {
      console.log('Updating agent with ID:', agent.id);
      updateMutation.mutate(data);
    } else {
      console.log('Creating new agent');
      createMutation.mutate(data);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="professional">Professional</TabsTrigger>
            <TabsTrigger value="contact">Contact & Social</TabsTrigger>
            <TabsTrigger value="photo">Photo</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Full Name *
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Agent full name" {...field} />
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
                    <FormLabel className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address *
                    </FormLabel>
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
                    <FormLabel>{agent ? "New Password (leave blank to keep current)" : "Password *"}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Secure password" {...field} />
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
                    <FormLabel className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="+27 12 345 6789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Professional Bio</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell us about the agent's experience and approach to real estate..." 
                      className="min-h-[100px]"
                      {...field} 
                    />
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
                  <FormLabel>Property Specialties (comma-separated)</FormLabel>
                  <FormControl>
                    <Input placeholder="Residential, Commercial, Luxury Homes, Industrial" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="professional" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Job Title
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Senior Property Consultant" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="licenseNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Real Estate License Number</FormLabel>
                    <FormControl>
                      <Input placeholder="FFC123456789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="yearsExperience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Years of Experience</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="officeLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Office Location
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Sandton, Johannesburg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="languages"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Languages className="h-4 w-4" />
                    Languages (comma-separated)
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="English, Afrikaans, Zulu, Xhosa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="education"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Education Background</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Degree in Business Administration from University of Witwatersrand..."
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="certifications"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Professional Certifications (comma-separated)</FormLabel>
                  <FormControl>
                    <Input placeholder="Estate Agency Affairs Board Certified, Property Valuations Certificate" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="workingHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Working Hours
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Monday - Friday: 8AM - 6PM, Saturday: 9AM - 4PM" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="contact" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="linkedinUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      LinkedIn Profile URL
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="https://linkedin.com/in/agent-name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="personalWebsite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Personal Website
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="https://agent-website.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          <TabsContent value="photo" className="space-y-4 mt-6">
            <div className="space-y-4">
              <div className="text-center">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8">
                  {(uploadedImage || agent?.avatar) ? (
                    <div className="space-y-4">
                      <img 
                        src={uploadedImage || agent?.avatar} 
                        alt="Agent photo" 
                        className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-purple-200"
                      />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Agent photo uploaded successfully
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Camera className="mx-auto h-12 w-12 text-gray-400" />
                      <div>
                        <p className="text-lg font-medium">Upload Agent Photo</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Professional headshot recommended (JPG, PNG)
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="mt-4"
                  >
                    {isUploading ? (
                      <>
                        <Clock className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        {uploadedImage || agent?.avatar ? 'Change Photo' : 'Upload Photo'}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-6 border-t">
          <Button 
            type="submit" 
            disabled={createMutation.isPending || updateMutation.isPending}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {createMutation.isPending || updateMutation.isPending ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              agent ? "Update Agent" : "Create Agent"
            )}
          </Button>
        </div>
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
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showEnquiries, setShowEnquiries] = useState<number | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Simple authentication check using direct API call
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/profile', {
          credentials: 'include'
        });
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          window.location.href = '/admin/login';
        }
      } catch (error) {
        setIsAuthenticated(false);
        window.location.href = '/admin/login';
      }
    };
    
    checkAuth();
  }, []);

  const { data: agents = [], isLoading } = useQuery<Agent[]>({
    queryKey: ["/api/admin/agents"],
    enabled: isAuthenticated === true,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/admin/agents/${id}`, "DELETE");
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

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <AdminSidebar />
      
      <div className="lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8">
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