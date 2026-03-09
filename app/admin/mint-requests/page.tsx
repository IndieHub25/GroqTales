'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, CheckCircle2, XCircle, Clock, Eye, ChevronDown,
  Loader2, AlertCircle, ImageIcon, User, DollarSign, Hash, Tag,
} from 'lucide-react';
import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface MintRequest {
  id: string;
  story_id: string;
  author_id: string;
  nft_name: string;
  nft_description: string;
  cover_image_url: string | null;
  fee_amount: number;
  fee_currency: string;
  supply: number;
  royalty_percentage: number;
  metadata: Record<string, unknown>;
  status: string;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  stories?: {
    id: string;
    title: string;
    cover_image: string | null;
    genre: string;
    description: string;
  };
  profiles?: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
}

const STATUS_CONFIG: Record<string, { className: string; icon: React.ReactNode; label: string }> = {
  pending_review: {
    className: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    icon: <Clock className="w-3.5 h-3.5" />,
    label: 'Pending Review',
  },
  approved: {
    className: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    label: 'Approved',
  },
  rejected: {
    className: 'bg-red-500/10 border-red-500/20 text-red-400',
    icon: <XCircle className="w-3.5 h-3.5" />,
    label: 'Rejected',
  },
};

export default function AdminMintRequestsPage() {
  const { toast } = useToast();

  const [requests, setRequests] = useState<MintRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://groqtales-backend-api.onrender.com';

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    try {
      const url = new URL(`${baseUrl}/api/v1/admin/mint-requests`);
      if (statusFilter) url.searchParams.set('status', statusFilter);
      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setRequests(json.data || []);
      } else {
        const err = await res.json().catch(() => ({}));
        toast({ title: 'Error', description: err.error || 'Failed to load mint requests', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Network error', description: 'Could not reach the server.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [baseUrl, statusFilter, toast]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    try {
      const res = await fetch(`${baseUrl}/api/v1/admin/mint-requests/${id}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        toast({ title: '✅ Approved', description: 'Mint request has been approved.' });
        fetchRequests();
      } else {
        const err = await res.json().catch(() => ({}));
        toast({ title: 'Error', description: err.error || 'Failed to approve', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Network error', variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) {
      toast({ title: 'Reason required', description: 'Please provide a rejection reason.', variant: 'destructive' });
      return;
    }
    setActionLoading(id);
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    try {
      const res = await fetch(`${baseUrl}/api/v1/admin/mint-requests/${id}/reject`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason.trim() }),
      });
      if (res.ok) {
        toast({ title: '❌ Rejected', description: 'Mint request has been rejected.' });
        setRejectReason('');
        setExpandedId(null);
        fetchRequests();
      } else {
        const err = await res.json().catch(() => ({}));
        toast({ title: 'Error', description: err.error || 'Failed to reject', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Network error', variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const fallback = { className: 'bg-amber-500/10 border-amber-500/20 text-amber-400', icon: <Clock className="w-3.5 h-3.5" />, label: 'Pending Review' };
    const cfg = STATUS_CONFIG[status] || fallback;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.className}`}>
        {cfg.icon} {cfg.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(139,92,246,0.06),_transparent_50%)]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">NFT Mint Requests</h1>
              <p className="text-sm text-white/40">Review and manage minting requests from creators</p>
            </div>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-white/5 border border-white/10 rounded-lg px-4 py-2 pr-8 text-sm text-white focus:outline-none focus:border-purple-500/40 transition-all"
            >
              <option value="">All Statuses</option>
              <option value="pending_review">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
          </div>
        )}

        {/* Empty */}
        {!loading && requests.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-white/20" />
            </div>
            <p className="text-white/40 text-sm">No mint requests found.</p>
          </div>
        )}

        {/* Request Cards */}
        <div className="space-y-4">
          {requests.map((req) => {
            const authorName = req.profiles
              ? [req.profiles.first_name, req.profiles.last_name].filter(Boolean).join(' ') || req.profiles.username
              : 'Unknown';
            const isExpanded = expandedId === req.id;
            const isPending = req.status === 'pending_review';

            return (
              <motion.div
                key={req.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-white/[0.03] border border-white/[0.08] overflow-hidden"
              >
                {/* Card Header */}
                <div
                  className="px-5 py-4 flex items-center gap-4 cursor-pointer hover:bg-white/[0.02] transition-all"
                  onClick={() => setExpandedId(isExpanded ? null : req.id)}
                >
                  {/* Cover thumbnail */}
                  <div className="w-14 h-14 rounded-lg bg-white/5 overflow-hidden flex-shrink-0 border border-white/10">
                    {(req.cover_image_url || req.stories?.cover_image) ? (
                      <img src={req.cover_image_url || req.stories?.cover_image || ''} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-white/15" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-bold text-white truncate">{req.nft_name}</h3>
                      {getStatusBadge(req.status)}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-white/40">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" /> {authorName}</span>
                      <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> {req.fee_amount} {req.fee_currency}</span>
                      <span className="flex items-center gap-1"><Hash className="w-3 h-3" /> Supply: {req.supply}</span>
                      <span>{new Date(req.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <ChevronDown className={`w-4 h-4 text-white/30 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-1 border-t border-white/[0.06] space-y-4">
                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-white/40">Story Title</span>
                            <p className="text-white/80 font-medium">{req.stories?.title || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-white/40">Genre</span>
                            <p className="text-white/80 font-medium">{req.stories?.genre || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-white/40">Royalty</span>
                            <p className="text-white/80 font-medium">{req.royalty_percentage}%</p>
                          </div>
                          <div>
                            <span className="text-white/40">Request ID</span>
                            <p className="text-white/60 font-mono text-xs">{req.id.slice(0, 12)}…</p>
                          </div>
                        </div>

                        {req.nft_description && (
                          <div>
                            <span className="text-xs text-white/40">NFT Description</span>
                            <p className="text-sm text-white/60 mt-1">{req.nft_description}</p>
                          </div>
                        )}

                        {/* Tags */}
                        {req.metadata && (req.metadata as { tags?: string[] }).tags && (
                          <div className="flex flex-wrap gap-1.5">
                            {((req.metadata as { tags?: string[] }).tags || []).map((t: string) => (
                              <span key={t} className="px-2 py-0.5 rounded-full text-xs bg-white/5 border border-white/10 text-white/50">
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Rejection reason (if rejected) */}
                        {req.status === 'rejected' && req.rejection_reason && (
                          <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                            <p className="text-xs text-red-300"><strong>Rejection Reason:</strong> {req.rejection_reason}</p>
                          </div>
                        )}

                        {/* Admin Actions */}
                        {isPending && (
                          <div className="space-y-3 pt-2">
                            <div className="flex gap-3">
                              <button
                                onClick={() => handleApprove(req.id)}
                                disabled={actionLoading === req.id}
                                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                              >
                                {actionLoading === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                Approve
                              </button>
                            </div>
                            <div className="space-y-2">
                              <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Enter rejection reason (required to reject)…"
                                rows={2}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-red-500/40 resize-none transition-all"
                              />
                              <button
                                onClick={() => handleReject(req.id)}
                                disabled={actionLoading === req.id || !rejectReason.trim()}
                                className="w-full py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                              >
                                {actionLoading === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                Reject
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
