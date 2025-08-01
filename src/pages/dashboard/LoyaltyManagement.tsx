import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Plus, Star, Gift, Users, TrendingUp, Search, Edit, ToggleLeft, ToggleRight, Clock, Award, Filter, ChevronDown, Check } from 'lucide-react';
import { 
  useLoyaltyRedemptionOptions, 
  useManualLoyaltyAdjustment,
  useUpdateLoyaltyGift
} from '@/hooks/useLoyalty';
import { 
  useFranchiseLoyaltyStats, 
  useFranchiseMembers, 
  useManualLoyaltyAdjustmentByTvanamm,
  useFranchiseLoyaltyTransactions 
} from '@/hooks/useFranchiseLoyalty';
import { useUserRole } from '@/hooks/useAuth';

export const LoyaltyManagement = () => {
  const userRole = useUserRole();
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [memberSearchOpen, setMemberSearchOpen] = useState(false);
  const [points, setPoints] = useState('');
  const [adjustmentType, setAdjustmentType] = useState<'earned' | 'spent'>('earned');
  const [description, setDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Restrict access for franchise users
  const isAdmin = userRole === 'owner' || userRole === 'admin';
  
  // Fetch franchise members and statistics
  const { data: allMembers = [], isLoading: membersLoading } = useFranchiseMembers();
  const { data: searchedMembers = [], isLoading: searchMembersLoading } = useFranchiseMembers(memberSearchTerm);
  const { data: members = [], isLoading: memberSearchLoading } = useFranchiseMembers(searchTerm);
  
  // Use searched members if there's a search term, otherwise use all members
  const franchiseMembers = memberSearchTerm ? searchedMembers : allMembers;
  
  const { data: gifts, isLoading: giftsLoading } = useLoyaltyRedemptionOptions();
  const { data: stats, isLoading: statsLoading } = useFranchiseLoyaltyStats();
  const { data: transactions, isLoading: transactionsLoading } = useFranchiseLoyaltyTransactions(20);
  const manualAdjustment = useManualLoyaltyAdjustmentByTvanamm();
  const updateGift = useUpdateLoyaltyGift();

  const handleManualAdjustment = async () => {
    if (!selectedMember || !points || !description) {
      alert('Please fill in all fields');
      return;
    }

    const pointsValue = adjustmentType === 'spent' ? -parseInt(points) : parseInt(points);
    
    await manualAdjustment.mutateAsync({
      tvanammId: selectedMember.tvanamm_id,
      points: pointsValue,
      description: description
    });

    // Reset form
    setSelectedMember(null);
    setPoints('');
    setDescription('');
    setIsDialogOpen(false);
  };

  const handleToggleGift = async (giftId: string, isActive: boolean) => {
    await updateGift.mutateAsync({
      id: giftId,
      is_active: !isActive
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            {isAdmin ? 'Franchise Loyalty Management' : 'My Loyalty Points'}
          </h1>
          <p className="text-muted-foreground">
            {isAdmin ? 'Manage loyalty points for franchise members' : 'View your loyalty points and transactions'}
          </p>
        </div>
        {isAdmin && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Manual Adjustment
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manual Loyalty Points Adjustment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="member">Franchise Member</Label>
                <Popover open={memberSearchOpen} onOpenChange={setMemberSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={memberSearchOpen}
                      className="w-full justify-between bg-background"
                    >
                      {selectedMember ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {selectedMember.tvanamm_id}
                          </Badge>
                          <span>{selectedMember.full_name}</span>
                        </div>
                      ) : (
                        "Select franchise member..."
                      )}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 bg-background border border-border shadow-lg z-50" side="bottom" align="start">
                    <Command className="bg-background">
                      <CommandInput 
                        placeholder="Search franchise members..." 
                        value={memberSearchTerm}
                        onValueChange={setMemberSearchTerm}
                        className="border-0 focus:ring-0"
                      />
                      <CommandList className="max-h-60 overflow-y-auto">
                        <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                          {membersLoading || searchMembersLoading ? 'Loading...' : 'No franchise members found.'}
                        </CommandEmpty>
                        <CommandGroup>
                          {franchiseMembers?.map((member) => (
                            <CommandItem
                              key={member.id}
                              value={`${member.tvanamm_id} ${member.full_name} ${member.email}`}
                              onSelect={() => {
                                setSelectedMember(member);
                                setMemberSearchOpen(false);
                                setMemberSearchTerm('');
                              }}
                              className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-accent data-[selected=true]:bg-accent"
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  selectedMember?.id === member.id ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {member.tvanamm_id}
                                  </Badge>
                                  <span className="font-medium">{member.full_name}</span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {member.email} • {member.store_location}
                                </div>
                                <div className="text-xs text-primary">
                                  Current Balance: {member.loyalty_points?.current_balance || 0} pts
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="points">Points</Label>
                  <Input
                    id="points"
                    type="number"
                    value={points}
                    onChange={(e) => setPoints(e.target.value)}
                    placeholder="Enter points amount"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={adjustmentType} onValueChange={(value: 'earned' | 'spent') => setAdjustmentType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="earned">Points Earned</SelectItem>
                      <SelectItem value="spent">Points Spent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Reason for adjustment"
                />
              </div>
              <Button 
                onClick={handleManualAdjustment}
                disabled={manualAdjustment.isPending || !selectedMember || !points || !description}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {manualAdjustment.isPending ? 'Applying...' : 'Apply Adjustment'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        )}
      </div>

      {/* Real-time Statistics Cards - Only for Admin */}
      {isAdmin && (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points Issued</CardTitle>
            <Star className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded w-24 mb-2"></div>
                <div className="h-4 bg-muted rounded w-32"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.totalPointsIssued?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Lifetime franchise points
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Points Redeemed</CardTitle>
            <Gift className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded w-24 mb-2"></div>
                <div className="h-4 bg-muted rounded w-32"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.totalPointsRedeemed?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Total redeemed points
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Franchise Members</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded w-24 mb-2"></div>
                <div className="h-4 bg-muted rounded w-32"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.activeMembers || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Approved franchises
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Redemption Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded w-24 mb-2"></div>
                <div className="h-4 bg-muted rounded w-32"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.redemptionRate || 0}%</div>
                <p className="text-xs text-muted-foreground">
                  Points utilization rate
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      )}

      {/* Franchise Members Management - Only for Admin */}
      {isAdmin && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Franchise Members
            </CardTitle>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by TVANAMM ID, name, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              {membersLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex justify-between items-start p-3 rounded-lg border">
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                        <div className="h-5 bg-muted rounded w-16"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : members?.length ? (
                <div className="space-y-3">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex justify-between items-start p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-xs">
                            {member.tvanamm_id}
                          </Badge>
                          <p className="font-medium text-sm">{member.full_name}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Store: {member.store_location || 'Not specified'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {member.email}
                        </p>
                      </div>
                       <div className="text-right">
                         <p className="text-sm font-semibold">
                           {member.loyalty_points?.current_balance || 0} pts
                         </p>
                         <p className="text-xs text-muted-foreground">
                           {member.loyalty_points?.total_lifetime_points || 0} total
                         </p>
                       </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No franchise members found</p>
                  {searchTerm && (
                    <p className="text-xs">Try adjusting your search terms</p>
                  )}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              {transactionsLoading ? (
                <div className="space-y-3">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex justify-between items-start p-3 rounded-lg border">
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                        <div className="h-5 bg-muted rounded w-16"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : transactions?.length ? (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex justify-between items-start p-3 rounded-lg border bg-card"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {transaction.tvanamm_id}
                          </Badge>
                           <p className="text-xs text-muted-foreground">
                             Franchise Member
                           </p>
                        </div>
                        <p className="font-medium text-sm mb-1">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(transaction.created_at)}
                        </p>
                      </div>
                      <Badge
                        variant={transaction.type === 'earned' ? 'default' : 'secondary'}
                        className={
                          transaction.type === 'earned'
                            ? 'bg-primary text-primary-foreground'
                            : ''
                        }
                      >
                        {transaction.type === 'earned' ? '+' : ''}
                        {transaction.points}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Award className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No transactions yet</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
      )}

      {/* Loyalty Rewards Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Franchise Loyalty Rewards
          </CardTitle>
        </CardHeader>
        <CardContent>
          {giftsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="border rounded-lg p-4">
                    <div className="h-32 bg-muted rounded mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-full"></div>
                      <div className="flex justify-between">
                        <div className="h-5 bg-muted rounded w-20"></div>
                        <div className="h-5 bg-muted rounded w-16"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : gifts && gifts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gifts.map((gift) => (
                <Card key={gift.id} className="hover:shadow-card transition-all">
                  <CardContent className="p-4">
                    {gift.image_url && (
                      <div className="mb-4">
                        <img 
                          src={gift.image_url} 
                          alt={gift.name}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <h3 className="font-semibold">{gift.name}</h3>
                      <p className="text-sm text-muted-foreground">{gift.description}</p>
                      <div className="flex justify-between items-center">
                        <Badge variant="outline" className="border-primary text-primary">
                          {gift.points_required} points
                        </Badge>
                        <Badge variant={gift.stock_quantity > 0 ? 'default' : 'destructive'}>
                          {gift.stock_quantity > 0 ? `${gift.stock_quantity} left` : 'Out of stock'}
                        </Badge>
                      </div>
                      <Badge variant={gift.is_active ? 'default' : 'secondary'} className="w-full justify-center">
                        {gift.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                       <Button 
                         size="sm" 
                         variant="outline" 
                         className="flex-1"
                         onClick={() => handleToggleGift(gift.id, gift.is_active)}
                         disabled={updateGift.isPending}
                       >
                         {gift.is_active ? (
                           <>
                             <ToggleLeft className="h-3 w-3 mr-1" />
                             Disable
                           </>
                         ) : (
                           <>
                             <ToggleRight className="h-3 w-3 mr-1" />
                             Enable
                           </>
                         )}
                       </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Gift className="mx-auto h-16 w-16 mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No rewards available</h3>
              <p>Create loyalty rewards for franchise members to redeem.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LoyaltyManagement;