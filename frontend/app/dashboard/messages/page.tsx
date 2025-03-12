"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { messageApi, Message, UserProfile } from '@/lib/api';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Inbox, Send, MessageSquare, Bell, ChevronRight, RefreshCw, ArrowLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import ComposeMessageDialog from '@/components/messages/compose-message-dialog';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { toast } from 'sonner';

export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadMessages, setUnreadMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showComposeDialog, setShowComposeDialog] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [composeOptions, setComposeOptions] = useState<{
    recipientId?: number;
    listingId?: number;
    subject?: string;
  }>({});

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const [allMessages, unread] = await Promise.all([
        messageApi.getMyMessages(),
        messageApi.getUnreadMessages()
      ]);
      
      console.log('Fetched messages:', allMessages);
      console.log('Unread messages:', unread);
      
      setMessages(allMessages);
      setUnreadMessages(unread);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Erreur lors du chargement des messages');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [refreshCount]);

  // Handle URL parameters for pre-filled message composition
  useEffect(() => {
    const recipient = searchParams.get('recipient');
    const listing = searchParams.get('listing');
    const subject = searchParams.get('subject');
    
    if (recipient) {
      setComposeOptions({
        recipientId: parseInt(recipient),
        listingId: listing ? parseInt(listing) : undefined,
        subject: subject || ''
      });
      
      // Show compose dialog when parameters are present
      setShowComposeDialog(true);
    }
  }, [searchParams]);

  const handleRefresh = () => {
    setRefreshing(true);
    setRefreshCount(prev => prev + 1);
  };

  const handleMessageClick = async (messageId: number) => {
    try {
      // Mark message as read if it's unread
      const message = messages.find(m => m.id === messageId);
      if (message && !message.read) {
        await messageApi.markAsRead(messageId);
        // Update messages list to reflect the change
        setMessages(messages.map(m => 
          m.id === messageId ? { ...m, read: true } : m
        ));
        // Update unread messages count
        setUnreadMessages(unreadMessages.filter(m => m.id !== messageId));
      }
      
      // Navigate to message detail
      router.push(`/dashboard/messages/${messageId}`);
    } catch (error) {
      console.error('Error marking message as read:', error);
      toast.error('Erreur lors du marquage du message comme lu');
    }
  };

  const getInitials = (user?: UserProfile | number | string) => {
    if (!user) return '??';
    if (typeof user === 'string') return user.substring(0, 2).toUpperCase();
    if (typeof user === 'number') return '??';
    return `${(user.first_name?.[0] || '').toUpperCase()}${(user.last_name?.[0] || '').toUpperCase()}`;
  };

  const getBadgeText = (message: Message) => {
    if (message.listing_details) {
      return `Annonce: ${message.listing_details.title.substring(0, 20)}${message.listing_details.title.length > 20 ? '...' : ''}`;
    }
    return null;
  };

  // Group messages by sender/receiver for threaded view
  const groupedMessages = messages.reduce<Record<string, Message[]>>((acc, message) => {
    // For inbox, group messages where we are the receiver
    const isInbox = message.receiver_username === 'bekay'; // Current user is 'bekay'
    if (!isInbox) {
      // Skip messages we sent for inbox view
      return acc;
    }
    
    // Use sender username as the group key for inbox messages
    const otherPartyId = message.sender_username;
    
    if (!acc[otherPartyId]) {
      acc[otherPartyId] = [];
    }
    
    acc[otherPartyId].push(message);
    return acc;
  }, {});

  // Sort groups by most recent message
  const sortedGroups = Object.entries(groupedMessages).sort((a, b) => {
    const latestA = new Date(a[1][0].created_at).getTime();
    const latestB = new Date(b[1][0].created_at).getTime();
    return latestB - latestA;
  });

  // Filter sent messages
  const sentMessages = messages.filter(m => m.sender_username === 'bekay'); // Current user is 'bekay'

  const getOtherPartyDetails = (messages: Message[]) => {
    if (messages.length === 0) return null;
    
    const message = messages[0];
    // Return a simplified user object based on username
    return {
      username: message.sender_username,
      first_name: message.sender_username,
      last_name: '',
      profile_image: ''
    };
  };

  const countUnreadInGroup = (messages: Message[]) => {
    return messages.filter(m => !m.read).length;
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
        ease: "easeOut"
      }
    }),
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
  };

  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 pt-16">
          <div className="container mx-auto p-4 max-w-6xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mb-2"
                  onClick={() => router.push('/dashboard')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour au tableau de bord
                </Button>
                <h1 className="text-2xl font-bold">Messagerie</h1>
                <p className="text-muted-foreground">
                  Gérez vos conversations avec les acheteurs et vendeurs
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Actualiser
                </Button>
              </div>
            </div>

            <Tabs defaultValue="inbox" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="inbox" className="flex items-center">
                  <Inbox className="h-4 w-4 mr-2" />
                  Boîte de réception
                  {unreadMessages.length > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {unreadMessages.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="sent" className="flex items-center">
                  <Send className="h-4 w-4 mr-2" />
                  Messages envoyés
                </TabsTrigger>
              </TabsList>

              <TabsContent value="inbox" className="mt-0">
                <Card className="border-t-0 rounded-t-none">
                  <CardContent className="p-0">
                    {isLoading ? (
                      <div className="space-y-4 p-4">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="flex gap-4 items-center">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="space-y-2 flex-1">
                              <Skeleton className="h-4 w-[250px]" />
                              <Skeleton className="h-4 w-full" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : sortedGroups.length === 0 ? (
                      <div className="p-8 text-center">
                        <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                          <Inbox className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium">Pas de messages</h3>
                        <p className="text-muted-foreground mt-2">
                          Vous n'avez pas encore de messages. Commencez une conversation en contactant un vendeur depuis une annonce.
                        </p>
                      </div>
                    ) : (
                      <AnimatePresence>
                        <div className="divide-y">
                          {sortedGroups.map(([otherPartyId, messages], index) => {
                            const otherParty = getOtherPartyDetails(messages);
                            const unreadCount = countUnreadInGroup(messages);
                            const latestMessage = messages[0];
                            
                            return (
                              <motion.div
                                key={otherPartyId}
                                custom={index}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                variants={messageVariants}
                                className={`flex items-center p-4 hover:bg-muted cursor-pointer transition-colors ${unreadCount > 0 ? 'bg-blue-50 dark:bg-blue-950/20' : ''}`}
                                onClick={() => handleMessageClick(latestMessage.id)}
                              >
                                <Avatar className="h-12 w-12 mr-4">
                                  <AvatarImage 
                                    src={otherParty?.profile_image || ''}
                                    alt={otherParty?.username || 'User'}
                                  />
                                  <AvatarFallback>{getInitials(otherParty)}</AvatarFallback>
                                </Avatar>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <span className="font-medium">
                                        {otherParty ? `${otherParty.first_name} ${otherParty.last_name}` : 'Utilisateur inconnu'}
                                      </span>
                                      {unreadCount > 0 && (
                                        <Badge variant="destructive" className="ml-2">
                                          {unreadCount} non lu{unreadCount > 1 ? 's' : ''}
                                        </Badge>
                                      )}
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                      {formatDistanceToNow(new Date(latestMessage.created_at), { 
                                        addSuffix: true,
                                        locale: fr 
                                      })}
                                    </span>
                                  </div>
                                  
                                  <h4 className="text-sm font-medium truncate">
                                    {latestMessage.subject}
                                  </h4>
                                  
                                  <p className="text-sm text-muted-foreground truncate">
                                    {latestMessage.content}
                                  </p>
                                  
                                  {latestMessage.listing_details && (
                                    <Badge variant="secondary" className="mt-1">
                                      {getBadgeText(latestMessage)}
                                    </Badge>
                                  )}
                                </div>
                                
                                <ChevronRight className="h-5 w-5 text-muted-foreground ml-4" />
                              </motion.div>
                            );
                          })}
                        </div>
                      </AnimatePresence>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sent" className="mt-0">
                <Card className="border-t-0 rounded-t-none">
                  <CardContent className="p-0">
                    {isLoading ? (
                      <div className="space-y-4 p-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex gap-4 items-center">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="space-y-2 flex-1">
                              <Skeleton className="h-4 w-[250px]" />
                              <Skeleton className="h-4 w-full" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : sentMessages.length === 0 ? (
                      <div className="p-8 text-center">
                        <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                          <Send className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium">Pas de messages envoyés</h3>
                        <p className="text-muted-foreground mt-2">
                          Vous n'avez pas encore envoyé de messages.
                        </p>
                      </div>
                    ) : (
                      <AnimatePresence>
                        <div className="divide-y">
                          {sentMessages
                            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                            .map((message, index) => (
                              <motion.div
                                key={message.id}
                                custom={index}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                variants={messageVariants}
                                className="flex items-center p-4 hover:bg-muted cursor-pointer transition-colors"
                                onClick={() => handleMessageClick(message.id)}
                              >
                                <Avatar className="h-12 w-12 mr-4">
                                  <AvatarImage 
                                    src={typeof message.receiver === 'object' ? message.receiver.profile_image : ''}
                                    alt={typeof message.receiver === 'object' ? message.receiver.username : 'User'}
                                  />
                                  <AvatarFallback>
                                    {getInitials(typeof message.receiver === 'object' ? message.receiver : undefined)}
                                  </AvatarFallback>
                                </Avatar>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium">
                                      {typeof message.receiver === 'object' 
                                        ? `${message.receiver.first_name} ${message.receiver.last_name}`
                                        : 'Utilisateur inconnu'
                                      }
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                      {formatDistanceToNow(new Date(message.created_at), { 
                                        addSuffix: true,
                                        locale: fr 
                                      })}
                                    </span>
                                  </div>
                                  
                                  <h4 className="text-sm font-medium truncate">
                                    {message.subject}
                                  </h4>
                                  
                                  <p className="text-sm text-muted-foreground truncate">
                                    {message.content}
                                  </p>
                                  
                                  {message.listing_details && (
                                    <Badge variant="secondary" className="mt-1">
                                      {getBadgeText(message)}
                                    </Badge>
                                  )}
                                </div>
                                
                                <ChevronRight className="h-5 w-5 text-muted-foreground ml-4" />
                              </motion.div>
                            ))}
                        </div>
                      </AnimatePresence>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        <Footer />

        <ComposeMessageDialog
          open={showComposeDialog}
          onOpenChange={setShowComposeDialog}
          onSent={handleRefresh}
          initialRecipientId={composeOptions.recipientId}
          initialListingId={composeOptions.listingId}
          initialSubject={composeOptions.subject}
        />
      </div>
    </AuthGuard>
  );
} 