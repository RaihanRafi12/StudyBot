import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { motion } from 'motion/react';
import { useState } from 'react';
import {
  Search,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Star,
  Eye,
  User,
  Calendar,
  FileText,
  MessageSquare,
} from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  category: string;
  uploader: string;
  uploaderId: string;
  uploadDate?: string;
  isPublic: boolean;
  rating: number;
  reviewCount: number;
  description: string;
  hasAccess: boolean;
}

interface AdminResourcesProps {
  resources: Resource[];
  onEditResource: (resourceId: string) => void;
  onDeleteResource: (resourceId: string) => void;
  onApproveResource: (resourceId: string) => void;
  onRejectResource: (resourceId: string) => void;
  onRequestChanges: (resourceId: string) => void;
  onViewResource: (resourceId: string) => void;
}

export function AdminResources({
  resources,
  onEditResource,
  onDeleteResource,
  onApproveResource,
  onRejectResource,
  onRequestChanges,
  onViewResource,
}: AdminResourcesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.uploader.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || resource.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const stats = [
    {
      label: 'Total Resources',
      value: resources.length,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Courses',
      value: resources.filter((r) => r.category === 'Courses').length,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Documents',
      value: resources.filter((r) => r.category === 'Documents').length,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      label: 'Projects',
      value: resources.filter((r) => r.category === 'Projects').length,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      label: 'Research',
      value: resources.filter((r) => r.category === 'Research').length,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">All Resources</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Manage and monitor all platform resources</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className={`inline-flex p-2 rounded-lg ${stat.bgColor} mb-2`}>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search resources by title, description, or uploader..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resources List with Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-6">
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="inline-flex w-auto min-w-full sm:min-w-0">
            <TabsTrigger value="all" className="whitespace-nowrap">All</TabsTrigger>
            <TabsTrigger value="courses" className="whitespace-nowrap">Courses</TabsTrigger>
            <TabsTrigger value="documents" className="whitespace-nowrap">Documents</TabsTrigger>
            <TabsTrigger value="projects" className="whitespace-nowrap">Projects</TabsTrigger>
            <TabsTrigger value="research" className="whitespace-nowrap">Research</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={selectedCategory}>
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedCategory === 'all' ? 'All Resources' : selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} 
                ({filteredResources.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                {filteredResources.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No resources found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredResources.map((resource, index) => (
                      <motion.div
                        key={resource.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 rounded-lg border bg-muted/50 hover:bg-muted/70 transition-colors"
                      >
                        <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
                          <div className="flex-1 min-w-0 space-y-3 w-full">
                            {/* Title and Category */}
                            <div className="flex items-start gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <h3 className="font-semibold break-words">{resource.title}</h3>
                                  <Badge variant="outline" className="shrink-0">{resource.category}</Badge>
                                  <Badge
                                    variant={resource.isPublic ? 'default' : 'secondary'}
                                    className={`shrink-0 ${
                                      resource.isPublic
                                        ? 'bg-green-500/10 text-green-600 border-green-500/20'
                                        : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                    }`}
                                  >
                                    {resource.isPublic ? 'Public' : 'Request Only'}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2 break-words">
                                  {resource.description}
                                </p>
                              </div>
                            </div>

                            {/* Meta Information */}
                            <div className="flex flex-wrap items-center gap-3 text-sm">
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <User className="h-3 w-3 shrink-0" />
                                <span className="truncate">{resource.uploader}</span>
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Calendar className="h-3 w-3 shrink-0" />
                                <span className="truncate">{resource.uploadDate}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 shrink-0 fill-amber-500 text-amber-500" />
                                <span className="font-medium">
                                  {resource.rating.toFixed(1)}
                                </span>
                                <span className="text-muted-foreground">
                                  ({resource.reviewCount} reviews)
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-row lg:flex-col gap-2 w-full lg:w-auto">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onViewResource(resource.id)}
                                title="View Details"
                                className="shrink-0"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onEditResource(resource.id)}
                                title="Edit Resource"
                                className="shrink-0"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex gap-2 flex-1 lg:flex-initial">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onRequestChanges(resource.id)}
                                title="Request Changes"
                                className="flex-1 lg:w-full"
                              >
                                <MessageSquare className="h-4 w-4 mr-1" />
                                <span className="hidden sm:inline">Request</span>
                              </Button>
                            </div>
                            <div className="flex gap-2 flex-1 lg:flex-initial">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => onApproveResource(resource.id)}
                                className="bg-green-600 hover:bg-green-700 flex-1"
                                title="Approve"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => onDeleteResource(resource.id)}
                                title="Delete Permanently"
                                className="shrink-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}