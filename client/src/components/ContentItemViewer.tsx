import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ContentItem } from '@shared/schema';
import { Copy, Download, Share2, Edit } from 'lucide-react';
import { format } from 'date-fns';

interface ContentItemViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ContentItem | null;
  onEdit?: (item: ContentItem) => void;
}

export default function ContentItemViewer({ 
  open, 
  onOpenChange, 
  item,
  onEdit
}: ContentItemViewerProps) {
  if (!item) return null;

  // Format dates for display
  const formattedCreatedDate = item.createdAt 
    ? format(new Date(item.createdAt), 'PPP') 
    : 'Unknown';
  
  const formattedUpdatedDate = item.updatedAt 
    ? format(new Date(item.updatedAt), 'PPP') 
    : 'Unknown';

  // Generate content type badge color
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

  // Copy content to clipboard
  const copyContent = () => {
    navigator.clipboard.writeText(item.content);
  };

  // Download content as text file
  const downloadContent = () => {
    const element = document.createElement("a");
    const file = new Blob([item.content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${item.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">{item.title}</DialogTitle>
            <Badge className={getTypeColor(item.contentType)}>{item.contentType}</Badge>
          </div>
          <DialogDescription>
            {item.description || `${item.contentType} content created on ${formattedCreatedDate}`}
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 border-t pt-4">
          <div className="text-sm text-gray-500 flex flex-wrap gap-x-6 gap-y-2 mb-4">
            <div>Created: {formattedCreatedDate}</div>
            <div>Updated: {formattedUpdatedDate}</div>
            <div>Status: <span className="capitalize">{item.status}</span></div>
          </div>
          
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {item.tags.map((tag, index) => (
                <Badge key={index} variant="outline">{tag}</Badge>
              ))}
            </div>
          )}
          
          <div className="whitespace-pre-wrap bg-gray-50 dark:bg-gray-800 p-4 rounded-md border text-sm">
            {item.content}
          </div>
        </div>
        
        <DialogFooter className="flex sm:justify-between mt-6 gap-2">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copyContent}>
              <Copy className="h-4 w-4 mr-2" /> Copy
            </Button>
            <Button variant="outline" size="sm" onClick={downloadContent}>
              <Download className="h-4 w-4 mr-2" /> Download
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" /> Share
            </Button>
          </div>
          
          {onEdit && (
            <Button 
              onClick={() => {
                onOpenChange(false);
                onEdit(item);
              }}
            >
              <Edit className="h-4 w-4 mr-2" /> Edit
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}