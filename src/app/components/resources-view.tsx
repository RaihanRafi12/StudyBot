import { useState } from 'react';
import { ResourceCard, Resource } from './resource-card';
import { Button } from './ui/button';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { TrendingUp, Star, Clock, ArrowUpDown } from 'lucide-react';

interface ResourcesViewProps {
  resources: Resource[];
  onRequestAccess: (resourceId: string) => void;
  onView: (resourceId: string) => void;
  onRate: (resourceId: string) => void;
  viewType?: 'courses' | 'documents' | 'projects' | 'research';
}

export function ResourcesView({
  resources,
  onRequestAccess,
  onView,
  onRate,
  viewType,
}: ResourcesViewProps) {
  const [sortBy, setSortBy] = useState('latest');

  // Get dynamic title and description based on view type
  const getViewInfo = () => {
    switch (viewType) {
      case 'courses':
        return {
          title: 'Courses',
          description: 'Browse and access course materials',
        };
      case 'documents':
        return {
          title: 'Documents',
          description: 'Browse and access study documents',
        };
      case 'projects':
        return {
          title: 'Projects',
          description: 'Browse and access project resources',
        };
      case 'research':
        return {
          title: 'Research Papers',
          description: 'Browse and access research publications',
        };
      default:
        return {
          title: 'Resources',
          description: 'Browse and access academic materials',
        };
    }
  };

  const viewInfo = getViewInfo();

  const sortedResources = [...resources].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.reviewCount - a.reviewCount;
      case 'rating':
        return b.rating - a.rating;
      case 'latest':
        return (
          new Date(b.uploadDate ?? 0).getTime() - new Date(a.uploadDate ?? 0).getTime()
        );
      case 'oldest':
        return (
          new Date(a.uploadDate ?? 0).getTime() - new Date(b.uploadDate ?? 0).getTime()
        );
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{viewInfo.title}</h1>
          <p className="text-muted-foreground">{viewInfo.description}</p>
        </div>
      </div>

      {/* Tab-based Sorting System */}
      <Tabs value={sortBy} onValueChange={setSortBy} className="w-full">
        <TabsList className="bg-background border rounded-lg p-1">
          <TabsTrigger value="latest" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Latest
          </TabsTrigger>
          <TabsTrigger value="popular" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Most Popular
          </TabsTrigger>
          <TabsTrigger value="rating" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Top Rated
          </TabsTrigger>
          <TabsTrigger value="oldest" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Oldest
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Resource Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedResources.map((resource) => (
          <ResourceCard
            key={resource.id}
            resource={resource}
            onRequestAccess={onRequestAccess}
            onView={onView}
            onRate={onRate}
          />
        ))}
      </div>

      {sortedResources.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No resources found</p>
        </div>
      )}
    </div>
  );
}