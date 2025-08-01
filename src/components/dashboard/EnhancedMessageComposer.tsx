import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCreateNotification } from '@/hooks/useNotifications';
import { useUserRole } from '@/hooks/useAuth';
import { useAuth } from '@/contexts/AuthContext';
import { MessageSquare, Users, Megaphone, ChevronDown, Check, Send } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface EnhancedMessageComposerProps {
  isOpen: boolean;
  onClose: () => void;
}

type MessageType = 'message' | 'announcement';
type TargetType = 'all_admins' | 'all_franchises' | 'specific_admin' | 'specific_franchise';

interface Profile {
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  tvanamm_id?: string;
}

const EnhancedMessageComposer: React.FC<EnhancedMessageComposerProps> = ({ isOpen, onClose }) => {
  const userRole = useUserRole();
  const { user } = useAuth();
  const createNotification = useCreateNotification();
  
  const [step, setStep] = useState<1 | 2>(1);
  const [messageType, setMessageType] = useState<MessageType>('message');
  const [targetType, setTargetType] = useState<TargetType>('all_admins');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [userSearchOpen, setUserSearchOpen] = useState(false);
  
  const [messageData, setMessageData] = useState({
    title: '',
    message: ''
  });

  // Fetch all users for specific targeting
  const { data: allUsers } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name, email, role, tvanamm_id')
        .eq('is_verified', true)
        .order('full_name');
      
      if (error) throw error;
      return data as Profile[];
    },
    enabled: isOpen && (targetType === 'specific_admin' || targetType === 'specific_franchise')
  });

  const filteredUsers = allUsers?.filter(user => {
    if (targetType === 'specific_admin') return user.role === 'admin';
    if (targetType === 'specific_franchise') return user.role === 'franchise';
    return false;
  }) || [];

  const handleReset = () => {
    setStep(1);
    setMessageType('message');
    setTargetType('all_admins');
    setSelectedUsers([]);
    setMessageData({ title: '', message: '' });
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleNext = () => {
    if (messageType === 'announcement') {
      setStep(2);
    } else {
      setStep(2);
    }
  };

  const handleSendMessage = async () => {
    if (!messageData.title || !messageData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      let targetUserIds: string[] = [];

      if (messageType === 'announcement') {
        // Send to everyone
        const { data: allProfiles } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('is_verified', true);
        
        targetUserIds = allProfiles?.map(p => p.user_id) || [];
      } else {
        // Handle message targeting
        if (targetType === 'all_admins') {
          const { data: admins } = await supabase
            .from('profiles')
            .select('user_id')
            .eq('role', 'admin')
            .eq('is_verified', true);
          targetUserIds = admins?.map(a => a.user_id) || [];
        } else if (targetType === 'all_franchises') {
          const { data: franchises } = await supabase
            .from('profiles')
            .select('user_id')
            .eq('role', 'franchise')
            .eq('is_verified', true);
          targetUserIds = franchises?.map(f => f.user_id) || [];
        } else {
          targetUserIds = selectedUsers;
        }
      }

      // Send notification to all target users
      const promises = targetUserIds.map(userId =>
        createNotification.mutateAsync({
          user_id: userId,
          title: messageType === 'announcement' ? `📢 Announcement: ${messageData.title}` : messageData.title,
          message: messageData.message,
          type: messageType === 'announcement' ? 'system' : 'franchise'
        })
      );

      await Promise.all(promises);
      
      toast.success(`${messageType === 'announcement' ? 'Announcement' : 'Message'} sent to ${targetUserIds.length} user(s) successfully!`);
      handleClose();
      
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === 1 ? (
              <>
                <MessageSquare className="w-5 h-5" />
                Choose Message Type
              </>
            ) : (
              <>
                {messageType === 'announcement' ? (
                  <Megaphone className="w-5 h-5" />
                ) : (
                  <MessageSquare className="w-5 h-5" />
                )}
                {messageType === 'announcement' ? 'Send Announcement' : 'Send Message'}
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        {step === 1 ? (
          // Step 1: Choose message type
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setMessageType('message')}
                className={cn(
                  "p-6 rounded-lg border-2 text-left transition-smooth hover:shadow-md",
                  messageType === 'message'
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                )}
              >
                <MessageSquare className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Message</h3>
                <p className="text-sm text-muted-foreground">
                  Send targeted messages to specific users or groups based on their roles.
                </p>
              </button>

              <button
                onClick={() => setMessageType('announcement')}
                className={cn(
                  "p-6 rounded-lg border-2 text-left transition-smooth hover:shadow-md",
                  messageType === 'announcement'
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                )}
              >
                <Megaphone className="w-8 h-8 text-orange-500 mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Announcement</h3>
                <p className="text-sm text-muted-foreground">
                  Send important announcements to all users in the system.
                </p>
              </button>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleNext}>
                Next
              </Button>
            </div>
          </div>
        ) : (
          // Step 2: Compose message
          <div className="space-y-6">
            {messageType === 'message' && (
              <div>
                <Label>Target Audience</Label>
                <Select value={targetType} onValueChange={(value: TargetType) => {
                  setTargetType(value);
                  setSelectedUsers([]);
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_admins">All Admins</SelectItem>
                    <SelectItem value="all_franchises">All Franchises</SelectItem>
                    <SelectItem value="specific_admin">Specific Admin</SelectItem>
                    <SelectItem value="specific_franchise">Specific Franchise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {messageType === 'announcement' && (
              <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                  <Megaphone className="w-5 h-5" />
                  <span className="font-medium">System-wide Announcement</span>
                </div>
                <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                  This announcement will be sent to all verified users in the system.
                </p>
              </div>
            )}

            {(targetType === 'specific_admin' || targetType === 'specific_franchise') && (
              <div>
                <Label>Select Users</Label>
                <Popover open={userSearchOpen} onOpenChange={setUserSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={userSearchOpen}
                      className="w-full justify-between"
                    >
                      {selectedUsers.length > 0 
                        ? `${selectedUsers.length} user(s) selected`
                        : "Select users..."
                      }
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder={`Search ${targetType === 'specific_admin' ? 'admins' : 'franchises'}...`} />
                      <CommandList>
                        <CommandEmpty>No users found.</CommandEmpty>
                        <CommandGroup>
                          {filteredUsers.map((user) => (
                            <CommandItem
                              key={user.user_id}
                              onSelect={() => {
                                setSelectedUsers(prev => 
                                  prev.includes(user.user_id)
                                    ? prev.filter(id => id !== user.user_id)
                                    : [...prev, user.user_id]
                                );
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedUsers.includes(user.user_id) ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex-1">
                                <div className="font-medium">{user.full_name || user.email}</div>
                                <div className="text-sm text-muted-foreground">{user.email}</div>
                                {user.tvanamm_id && (
                                  <Badge variant="secondary" className="text-xs mt-1">
                                    {user.tvanamm_id}
                                  </Badge>
                                )}
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                
                {selectedUsers.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedUsers.map(userId => {
                      const user = filteredUsers.find(u => u.user_id === userId);
                      return user ? (
                        <Badge key={userId} variant="secondary" className="text-xs">
                          {user.full_name || user.email}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            )}

            <div>
              <Label htmlFor="title">Subject</Label>
              <Input
                id="title"
                placeholder={messageType === 'announcement' ? "Announcement subject" : "Message subject"}
                value={messageData.title}
                onChange={(e) => setMessageData({...messageData, title: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder={messageType === 'announcement' ? "Your announcement message..." : "Your message..."}
                rows={6}
                value={messageData.message}
                onChange={(e) => setMessageData({...messageData, message: e.target.value})}
              />
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button 
                onClick={handleSendMessage}
                disabled={createNotification.isPending || !messageData.title || !messageData.message}
              >
                <Send className="w-4 h-4 mr-2" />
                {createNotification.isPending ? 'Sending...' : `Send ${messageType === 'announcement' ? 'Announcement' : 'Message'}`}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedMessageComposer;