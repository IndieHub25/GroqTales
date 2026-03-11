'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronUp, ChevronDown, MessageCircle, Bookmark, BookmarkCheck, Send, Loader2, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles?: { username: string; avatar_url: string; display_name: string } | null;
}

interface StoryEngagementProps {
  storyId: string;
}

export default function StoryEngagement({ storyId }: StoryEngagementProps) {
  const supabase = createClient();

  // Auth
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Votes
  const [voteScore, setVoteScore] = useState(0);
  const [userVote, setUserVote] = useState<1 | -1 | null>(null);
  const [voteLoading, setVoteLoading] = useState(false);

  // Comments
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(0);

  // Save
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // ---------- Auth ----------
  
  // Bootstraps Supabase auth state by checking for a persisted access token in
  // localStorage.  This mirrors the pattern used in other components (header,
  // user-nav, etc.) so that when a user logs in/out anywhere in the app the
  // session is restored immediately and `onAuthStateChange` will fire.  We
  // also listen for storage events so that changes originating in other tabs
  // are handled.
  useEffect(() => {
    let subscription: any;
    let storageListener: (e: StorageEvent) => void;

    const init = async () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        const refresh = localStorage.getItem('refreshToken');
        if (token) {
          try {
            await supabase.auth.setSession({ access_token: token, refresh_token: refresh || undefined });
          } catch (err) {
            console.error('Failed to restore supabase session from localStorage', err);
          }
        }
      }

      // grab whatever session Supabase currently has (may be empty)
      const { data } = await supabase.auth.getSession();
      setUserId(data.session?.user?.id ?? null);

      // subscribe to later changes
      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        setUserId(session?.user?.id ?? null);
      });
      subscription = sub.subscription;
    };

    init();

    storageListener = (e: StorageEvent) => {
      if (e.key === 'accessToken') {
        // token changed (login/logout elsewhere) – re-bootstrap session
        init();
      }
    };
    window.addEventListener('storage', storageListener);

    return () => {
      if (subscription) subscription.unsubscribe();
      window.removeEventListener('storage', storageListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Load engagement data ----------
  useEffect(() => {
    if (!storyId) return;

    async function loadData() {
      setLoading(true);

      // Load vote score
      const { data: votes } = await supabase
        .from('story_votes')
        .select('vote')
        .eq('story_id', storyId);
      
      if (votes) {
        const score = votes.reduce((acc: number, v: any) => acc + v.vote, 0);
        setVoteScore(score);
      }

      // Load user's vote
      if (userId) {
        const { data: myVote } = await supabase
          .from('story_votes')
          .select('vote')
          .eq('story_id', storyId)
          .eq('user_id', userId)
          .maybeSingle();
        
        setUserVote(myVote?.vote ?? null);
      }

      // Load comment count
      const { count } = await supabase
        .from('story_comments')
        .select('*', { count: 'exact', head: true })
        .eq('story_id', storyId);
      
      setCommentCount(count ?? 0);

      // Check if saved
      if (userId) {
        const { data: saved } = await supabase
          .from('saved_stories')
          .select('story_id')
          .eq('story_id', storyId)
          .eq('user_id', userId)
          .maybeSingle();
        
        setIsSaved(!!saved);
      }

      setLoading(false);
    }

    loadData();
  }, [storyId, userId]);

  // ---------- Load comments ----------
  const loadComments = useCallback(async () => {
    const { data } = await supabase
      .from('story_comments')
      .select('id, content, created_at, user_id, profiles(username, avatar_url, display_name)')
      .eq('story_id', storyId)
      .order('created_at', { ascending: false })
      .limit(50);
    
    setComments((data as any) || []);
    // Note: Intentionally NOT updating setCommentCount here because the paginated 
    // result length would overwrite the true total count fetched on initial load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storyId]);

  useEffect(() => {
    if (showComments) loadComments();
  }, [showComments, loadComments]);

  // ---------- Vote ----------
  const handleVote = async (direction: 1 | -1) => {
    if (!userId) return;
    setVoteLoading(true);

    const prevVoteScore = voteScore;
    const prevUserVote = userVote;

    // Optimistic UI Update
    if (userVote === direction) {
      setVoteScore(prev => prev - direction);
      setUserVote(null);
    } else {
      setVoteScore(prev => prev - (userVote ?? 0) + direction);
      setUserVote(direction);
    }

    try {
      if (prevUserVote === direction) {
        // Remove vote
        await supabase.from('story_votes').delete().eq('story_id', storyId).eq('user_id', userId).throwOnError();
      } else {
        // Upsert vote
        await supabase.from('story_votes').upsert(
          { story_id: storyId, user_id: userId, vote: direction },
          { onConflict: 'story_id,user_id' }
        ).throwOnError();
      }
    } catch (err) {
      console.error('Vote error:', err);
      // Revert optimistic update on failure
      setVoteScore(prevVoteScore);
      setUserVote(prevUserVote);
    }
    setVoteLoading(false);
  };

  // ---------- Comment ----------
  const handleComment = async () => {
    if (!userId || !commentText.trim()) return;
    setCommentLoading(true);

    try {
      await supabase.from('story_comments').insert({
        story_id: storyId,
        user_id: userId,
        content: commentText.trim(),
      }).throwOnError();
      setCommentText('');
      // increment the count immediately so the toggle button reflects the
      // new comment without waiting for `loadComments` to refresh the list
      setCommentCount(c => c + 1); // TODO: keep this in sync with loadComments
      await loadComments();
    } catch (err) {
      console.error('Comment error:', err);
    }
    setCommentLoading(false);
  };

  // ---------- Save ----------
  const handleSave = async () => {
    if (!userId) return;
    setSaveLoading(true);

    try {
      if (isSaved) {
        await supabase.from('saved_stories').delete().eq('story_id', storyId).eq('user_id', userId).throwOnError();
        setIsSaved(false);
      } else {
        await supabase.from('saved_stories').insert({ story_id: storyId, user_id: userId }).throwOnError();
        setIsSaved(true);
      }
    } catch (err) {
      console.error('Save error:', err);
    }
    setSaveLoading(false);
  };

  // ---------- Time ago ----------
  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-white/30" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 mt-8">
      {/* ── ACTION BAR ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Votes */}
        <div className="flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/10">
          <button
            onClick={() => handleVote(1)}
            disabled={voteLoading || !userId}
            className={`p-2 rounded-full transition-all ${
              userVote === 1
                ? 'text-emerald-400 bg-emerald-400/10'
                : 'text-white/50 hover:bg-white/10 hover:text-emerald-400'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
            title={userId ? 'Upvote' : 'Sign in to vote'}
          >
            <ChevronUp className="w-5 h-5" />
          </button>
          <span className={`text-sm font-bold min-w-[3ch] text-center tabular-nums ${
            userVote === 1 ? 'text-emerald-400' : userVote === -1 ? 'text-rose-400' : 'text-white/70'
          }`}>
            {voteScore}
          </span>
          <button
            onClick={() => handleVote(-1)}
            disabled={voteLoading || !userId}
            className={`p-2 rounded-full transition-all ${
              userVote === -1
                ? 'text-rose-400 bg-rose-400/10'
                : 'text-white/50 hover:bg-white/10 hover:text-rose-400'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
            title={userId ? 'Downvote' : 'Sign in to vote'}
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>

        {/* Comments toggle */}
        <button
          onClick={() => setShowComments(v => !v)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
            showComments
              ? 'bg-white/10 border-white/20 text-white'
              : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          {commentCount} Comment{commentCount !== 1 ? 's' : ''}
        </button>

        {/* Save/Bookmark */}
        <button
          onClick={handleSave}
          disabled={saveLoading || !userId}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
            isSaved
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10'
          } disabled:opacity-40 disabled:cursor-not-allowed`}
          title={userId ? (isSaved ? 'Remove from saved' : 'Save to collection') : 'Sign in to save'}
        >
          {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          {isSaved ? 'Saved' : 'Save'}
        </button>

        {!userId && (
          <span className="text-xs text-white/30 ml-auto">Sign in to interact</span>
        )}
      </div>

      {/* ── COMMENTS SECTION ───────────────────────────────────────── */}
      {showComments && (
        <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden">
          {/* Comment input */}
          {userId ? (
            <div className="flex items-center gap-3 p-4 border-b border-white/5">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-white/50" />
              </div>
              <input
                type="text"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleComment()}
                placeholder="Add a comment..."
                className="flex-1 bg-transparent text-white text-sm placeholder:text-white/30 outline-none"
                maxLength={1000}
              />
              <button
                onClick={handleComment}
                disabled={commentLoading || !commentText.trim()}
                className="p-2 rounded-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {commentLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                ) : (
                  <Send className="w-4 h-4 text-black" />
                )}
              </button>
            </div>
          ) : (
            <div className="p-4 border-b border-white/5 text-center text-white/30 text-sm">
              Sign in to leave a comment
            </div>
          )}

          {/* Comments list */}
          <div className="max-h-96 overflow-y-auto divide-y divide-white/5">
            {comments.length === 0 ? (
              <div className="p-8 text-center text-white/20 text-sm">
                No comments yet. Be the first to share your thoughts!
              </div>
            ) : (
              comments.map(c => (
                <div key={c.id} className="flex gap-3 p-4 hover:bg-white/[0.02] transition-colors">
                  <Avatar className="w-8 h-8 shrink-0 border border-white/10">
                    <AvatarImage src={c.profiles?.avatar_url || ''} />
                    <AvatarFallback className="bg-white/5 text-white/50 text-xs">
                      {(c.profiles?.display_name || c.profiles?.username || 'U')[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-white/80 truncate">
                        {c.profiles?.display_name || c.profiles?.username || 'Anonymous'}
                      </span>
                      <span className="text-xs text-white/30 shrink-0">{timeAgo(c.created_at)}</span>
                    </div>
                    <p className="text-sm text-white/60 leading-relaxed break-words">{c.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
