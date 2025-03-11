"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { marketplaceApi, Message, UserProfile } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, ArrowLeft, Send, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function MessageDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const messageId = parseInt(params.id);
  const [message, setMessage] = useState<Message | null>(null);
  const [thread, setThread] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replyContent, setReplyContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const threadEndRef = useRef<HTMLDivElement>(null);
  
  const fetchMessageAndThread = async () => {
    try {
      setIsLoading(true);
      
      // First get all messages from user's inbox
      const messages = await marketplaceApi.getMyMessages();
      
      // Find the current message
      const currentMessage = messages.find(m => m.id === messageId);
      
      if (!currentMessage) {
        toast.error("Message introuvable");
        router.push("/dashboard/messages");
        return;
      }
      
      setMessage(currentMessage);
      
      // Mark as read if not already
      if (!currentMessage.is_read) {
        await marketplaceApi.markAsRead(messageId);
      }
      
      // Get all related messages (thread)
      // For simplicity, we'll find messages with same sender/recipient and listing
      const threadMessages = messages.filter(m => {
        const senderMatches = 
          (typeof m.sender === 'object' && 
           typeof currentMessage.sender === 'object' && 
           m.sender.id === currentMessage.sender.id) || 
          (typeof m.sender === 'number' && 
           typeof currentMessage.sender === 'number' && 
           m.sender === currentMessage.sender);
        
        const recipientMatches = 
          (typeof m.recipient === 'object' && 
           typeof currentMessage.recipient === 'object' && 
           m.recipient.id === currentMessage.recipient.id) || 
          (typeof m.recipient === 'number' && 
           typeof currentMessage.recipient === 'number' && 
           m.recipient === currentMessage.recipient);
        
        const listingMatches = 
          (m.listing === currentMessage.listing) || 
          (m.listing === undefined && currentMessage.listing === undefined);
        
        return (senderMatches && recipientMatches && listingMatches);
      });
      
      // Sort by date
      const sortedThread = threadMessages.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      
      setThread(sortedThread);
    } catch (error) {
      console.error("Error fetching message:", error);
      toast.error("Erreur lors du chargement du message");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchMessageAndThread();
  }, [messageId]);
  
  useEffect(() => {
    // Scroll to bottom when thread updates
    if (threadEndRef.current) {
      threadEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [thread]);
  
  const handleSendReply = async () => {
    if (!message || !replyContent.trim()) return;
    
    try {
      setIsSending(true);
      
      const recipientId = typeof message.sender === 'object' 
        ? message.sender.id 
        : message.sender;
      
      const messageData = {
        recipient: recipientId,
        subject: `Re: ${message.subject}`,
        content: replyContent.trim(),
        ...(message.listing ? { listing: typeof message.listing === 'object' ? message.listing.id : message.listing } : {}),
        parent_message: message.id
      };
      
      await marketplaceApi.createMessage(messageData);
      
      toast.success("Réponse envoyée");
      setReplyContent("");
      
      // Refresh thread
      await fetchMessageAndThread();
    } catch (error) {
      console.error("Error sending reply:", error);
      toast.error("Erreur lors de l'envoi de la réponse");
    } finally {
      setIsSending(false);
    }
  };
  
  const getOtherParty = (message: Message): UserProfile | null => {
    // First try to get from sender/recipient objects
    if (typeof message.sender === 'object' && message.sender) {
      return message.sender;
    } else if (message.sender_details) {
      return message.sender_details;
    } else if (typeof message.recipient === 'object' && message.recipient) {
      return message.recipient;
    } else if (message.recipient_details) {
      return message.recipient_details;
    }
    
    return null;
  };
  
  const getInitials = (user?: UserProfile | null) => {
    if (!user) return '??';
    return `${(user.first_name?.[0] || '').toUpperCase()}${(user.last_name?.[0] || '').toUpperCase()}`;
  };
  
  const isMyMessage = (message: Message): boolean => {
    // If sender_details exists and has username, we can check if it's the current user
    // In a real app, you would compare with the current user ID
    return typeof message.sender === 'object' || 
           (message.sender_details !== undefined && !!message.sender_details);
  };
  
  // Framer Motion variants
  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.3
      }
    },
    exit: { 
      opacity: 0,
      y: -20,
      transition: { 
        duration: 0.2
      }
    }
  };
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };
  
  const renderLoading = () => (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
  
  const renderNotFound = () => (
    <div className="text-center p-8">
      <h2 className="text-xl font-semibold mb-2">Message introuvable</h2>
      <p className="text-muted-foreground mb-4">
        Ce message n'existe pas ou vous n'êtes pas autorisé à y accéder.
      </p>
      <Button onClick={() => router.push('/dashboard/messages')}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour aux messages
      </Button>
    </div>
  );
  
  const renderContent = () => {
    if (!message) return renderNotFound();
    
    const otherParty = getOtherParty(message);
    const hasListing = message.listing_details || message.listing;
    const listingId = typeof message.listing === 'object' 
      ? message.listing.id 
      : (message.listing || 0);

    return (
      <>
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
          onClick={() => router.push('/dashboard/messages')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux messages
        </Button>
        
        <Card>
          <CardHeader className="flex flex-row items-start gap-4 pb-2 pt-6">
            <Avatar className="h-12 w-12">
              <AvatarImage 
                src={otherParty?.profile_image || ''} 
                alt={otherParty?.username || 'User'} 
              />
              <AvatarFallback>{getInitials(otherParty)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
                <h2 className="text-xl font-semibold">
                  {otherParty?.first_name} {otherParty?.last_name}
                </h2>
                <div className="flex items-center gap-2">
                  {otherParty?.user_type && (
                    <Badge variant="outline">
                      {otherParty.user_type === 'farmer' ? 'Agriculteur' : 
                       otherParty.user_type === 'researcher' ? 'Chercheur' : 
                       otherParty.user_type === 'startup' ? 'Startup' : 
                       otherParty.user_type === 'industry' ? 'Industrie' : 
                       otherParty.user_type}
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-lg font-medium mt-1">{message.subject}</p>
              
              {hasListing && (
                <div className="flex items-center mt-2">
                  <Badge variant="secondary" className="text-xs">
                    {message.listing_details ? message.listing_details.title : `Annonce #${listingId}`}
                  </Badge>
                  {hasListing && (
                    <Link 
                      href={`/marketplace/${listingId}`}
                      className="ml-2 text-xs text-blue-500 hover:text-blue-700 flex items-center"
                    >
                      Voir l'annonce <ExternalLink className="h-3 w-3 ml-1" />
                    </Link>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          
          <Separator />
          
          <CardContent className="pt-6">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col gap-4"
            >
              {thread.map((msg, index) => {
                const isOwn = isMyMessage(msg);
                return (
                  <motion.div 
                    key={msg.id}
                    variants={messageVariants}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`
                        max-w-[80%] p-4 rounded-lg 
                        ${isOwn 
                          ? 'bg-primary text-primary-foreground ml-auto' 
                          : 'bg-muted text-foreground mr-auto'
                        }
                      `}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs opacity-70">
                          {format(new Date(msg.created_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                        </span>
                      </div>
                      <p className="whitespace-pre-line">{msg.content}</p>
                    </div>
                  </motion.div>
                );
              })}
              <div ref={threadEndRef} />
            </motion.div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4 pt-4">
            <div className="w-full">
              <Textarea
                placeholder="Écrivez votre réponse ici..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="min-h-32 resize-none"
                disabled={isSending}
              />
            </div>
            <div className="flex justify-end w-full">
              <Button 
                disabled={!replyContent.trim() || isSending}
                onClick={handleSendReply}
              >
                {isSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Envoyer
                  </>
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </>
    );
  };

  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 pt-16">
          <div className="container mx-auto p-4 max-w-4xl">
            {isLoading ? renderLoading() : renderContent()}
          </div>
        </div>
        <Footer />
      </div>
    </AuthGuard>
  );
} 