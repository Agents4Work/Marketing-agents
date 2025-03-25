import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Pencil, 
  Trash2, 
  Copy, 
  ExternalLink,
  Clock,
  Tag
} from "lucide-react";
import { ContentItem } from '@shared/schema';
import { formatDistanceToNow } from 'date-fns';

interface ContentItemCardProps {
  item: ContentItem;
  onEdit: (item: ContentItem) => void;
  onDelete: (id: number) => void;
  onView: (item: ContentItem) => void;
  onCopy?: (item: ContentItem) => void;
}

export default function ContentItemCard({ item, onEdit, onDelete, onView, onCopy }: ContentItemCardProps) {
  // Format the date as a relative time (e.g., "3 days ago")
  const formattedDate = item.updatedAt 
    ? formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true })
    : "Unknown date";

  // Generate a color for the status badge
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case 'archived':
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
      case 'draft':
      default:
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
    }
  };

  // Generate a color for the content type badge
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'blog':
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case 'email':
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      case 'social':
        return "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400";
      case 'ad':
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  // Truncate long content for preview
  const truncateContent = (content: string, maxLength = 120) => {
    return content.length > maxLength
      ? content.substring(0, maxLength) + '...'
      : content;
  };

  return (
    <Card className="h-full flex flex-col transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold line-clamp-1">{item.title}</CardTitle>
          <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
        </div>
        <CardDescription className="flex items-center text-xs text-gray-500 mt-1">
          <Clock className="h-3 w-3 mr-1" /> {formattedDate}
        </CardDescription>
      </CardHeader>

      <CardContent className="pb-2 flex-grow">
        <div className="mb-2">
          <Badge className={getTypeColor(item.contentType)}>{item.contentType}</Badge>
          {item.category && (
            <Badge variant="outline" className="ml-2">{item.category}</Badge>
          )}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
          {truncateContent(item.content)}
        </p>
      </CardContent>

      <CardFooter className="flex justify-between pt-2 gap-2">
        <div className="flex-grow flex gap-1 flex-wrap">
          {item.tags && item.tags.map((tag, index) => (
            <div key={index} className="flex items-center text-xs text-gray-500">
              <Tag className="h-3 w-3 mr-1" /> {tag}
            </div>
          ))}
        </div>

        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onView(item)}
            className="h-8 w-8"
            title="View"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
          {onCopy && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onCopy(item)}
              className="h-8 w-8"
              title="Copy"
            >
              <Copy className="h-4 w-4" />
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onEdit(item)}
            className="h-8 w-8"
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onDelete(item.id)}
            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}