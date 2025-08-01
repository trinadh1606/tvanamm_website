import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BlogPost } from '@/hooks/useBlogPosts';
import DOMPurify from 'dompurify';

interface BlogPostModalProps {
  post: BlogPost | null;
  isOpen: boolean;
  onClose: () => void;
}

const BlogPostModal: React.FC<BlogPostModalProps> = ({ post, isOpen, onClose }) => {
  if (!post) return null;

  const getCategoryColor = (category: string) => {
    const colors = {
      health: 'bg-green-100 text-green-800',
      recipes: 'bg-orange-100 text-orange-800',
      franchise: 'bg-blue-100 text-blue-800',
      industry: 'bg-purple-100 text-purple-800',
      general: 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-4">
              <DialogTitle className="text-2xl font-bold text-foreground mb-4 leading-tight">
                {post.title}
              </DialogTitle>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {post.author}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(post.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {Math.ceil(post.content.length / 1000)} min read
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-6">
                <Badge className={getCategoryColor(post.category)}>
                  {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
                </Badge>
                {post.featured && (
                  <Badge variant="secondary">Featured</Badge>
                )}
                {post.tags?.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {post.image_url && (
            <div className="aspect-video relative overflow-hidden rounded-lg">
              <img 
                src={post.image_url} 
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {post.excerpt && (
            <div className="bg-muted/50 p-4 rounded-lg border-l-4 border-primary">
              <p className="text-muted-foreground italic text-lg leading-relaxed">
                {post.excerpt}
              </p>
            </div>
          )}

          <div className="prose prose-gray dark:prose-invert max-w-none">
            <div 
              className="text-foreground leading-relaxed"
              dangerouslySetInnerHTML={{ 
                __html: DOMPurify.sanitize(post.content.replace(/\n/g, '<br />'))
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BlogPostModal;