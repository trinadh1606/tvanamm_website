import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useNotifications, useCreateNotification } from '@/hooks/useNotifications';
import { MessageSquare, Send, Bell, Plus, User, Clock } from 'lucide-react';
import { toast } from 'sonner';

const Messages = () => {
  const { data: notifications, isLoading } = useNotifications();
  const createNotification = useCreateNotification();
  
  const [newMessage, setNewMessage] = useState({
    userId: '',
    title: '',
    message: '',
    type: 'system' as 'system' | 'order' | 'loyalty' | 'franchise'
  });

  const handleSendMessage = async () => {
    if (!newMessage.userId || !newMessage.title || !newMessage.message) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await createNotification.mutateAsync({
        user_id: newMessage.userId,
        title: newMessage.title,
        message: newMessage.message,
        type: newMessage.type
      });
      
      setNewMessage({
        userId: '',
        title: '',
        message: '',
        type: 'system'
      });
      
      toast.success('Message sent successfully!');
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'system': return 'bg-blue-100 text-blue-800';
      case 'order': return 'bg-green-100 text-green-800';
      case 'loyalty': return 'bg-purple-100 text-purple-800';
      case 'franchise': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'system': return <Bell className="w-4 h-4" />;
      case 'order': return <MessageSquare className="w-4 h-4" />;
      case 'loyalty': return <MessageSquare className="w-4 h-4" />;
      case 'franchise': return <MessageSquare className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading messages...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Messages & Notifications</h1>
          <p className="text-muted-foreground">Send messages and manage notifications</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Send Message
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Send New Message</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="userId">User ID</Label>
                <Input
                  id="userId"
                  placeholder="Enter user ID"
                  value={newMessage.userId}
                  onChange={(e) => setNewMessage({...newMessage, userId: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter message title"
                  value={newMessage.title}
                  onChange={(e) => setNewMessage({...newMessage, title: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="type">Message Type</Label>
                <Select 
                  value={newMessage.type} 
                  onValueChange={(value: 'system' | 'order' | 'loyalty' | 'franchise') => 
                    setNewMessage({...newMessage, type: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="order">Order</SelectItem>
                    <SelectItem value="loyalty">Loyalty</SelectItem>
                    <SelectItem value="franchise">Franchise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Enter your message"
                  rows={4}
                  value={newMessage.message}
                  onChange={(e) => setNewMessage({...newMessage, message: e.target.value})}
                />
              </div>
              <Button 
                onClick={handleSendMessage}
                disabled={createNotification.isPending}
                className="w-full"
              >
                <Send className="w-4 h-4 mr-2" />
                {createNotification.isPending ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Messages</p>
                <p className="text-2xl font-bold text-foreground">{notifications?.length || 0}</p>
                <p className="text-sm text-green-600">All time</p>
              </div>
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unread Messages</p>
                <p className="text-2xl font-bold text-foreground">
                  {notifications?.filter(n => !n.is_read).length || 0}
                </p>
                <p className="text-sm text-blue-600">Pending attention</p>
              </div>
              <Bell className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">System Messages</p>
                <p className="text-2xl font-bold text-foreground">
                  {notifications?.filter(n => n.type === 'system').length || 0}
                </p>
                <p className="text-sm text-purple-600">Automated</p>
              </div>
              <User className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recent Activity</p>
                <p className="text-2xl font-bold text-foreground">
                  {notifications?.filter(n => 
                    new Date(n.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
                  ).length || 0}
                </p>
                <p className="text-sm text-green-600">Last 24h</p>
              </div>
              <Clock className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Messages List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications && notifications.length > 0 ? (
              notifications.slice(0, 10).map((notification) => (
                <div key={notification.id} className="flex items-start justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-full ${getTypeColor(notification.type).replace('text-', 'bg-').replace('800', '200')}`}>
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-foreground">{notification.title}</h4>
                        <Badge className={getTypeColor(notification.type)}>
                          {notification.type}
                        </Badge>
                        {!notification.is_read && (
                          <Badge variant="secondary" className="text-xs">
                            Unread
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      Reply
                    </Button>
                    <Button size="sm" variant="outline">
                      View
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No messages yet</h3>
                <p className="text-muted-foreground">Send your first message to get started.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Messages;