"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNowStrict } from "date-fns";
import {
  BarChart3,
  Bookmark,
  ExternalLink,
  FileText,
  Heart,
  Link2,
  Loader2,
  Search,
  Sparkles,
  Trophy,
  Wallet,
  Eye,
  Plus,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { useWallet } from "@/hooks/use-wallet";
import {
  clearDraftRecord,
  listDraftRecords,
  setActiveDraftKey,
  StoryDraftRecord,
  upsertDraftRecord,
} from "@/lib/story-draft-manager";
import { BLOCKCHAIN_CONFIG } from "@/lib/constants";

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { address, connect } = useWallet();

  const [tab, setTab] = useState<"drafts" | "nfts" | "analytics">("drafts");
  const [draftQuery, setDraftQuery] = useState("");
  const [draftPipelineFilter, setDraftPipelineFilter] = useState<
    "all" | "idle" | "ready" | "processing"
  >("all");
  const [cloudDraftsLoading, setCloudDraftsLoading] = useState(false);
  const [cloudDraftsError, setCloudDraftsError] = useState<string | null>(null);
  const [cloudDrafts, setCloudDrafts] = useState<
    Array<{
      draftKey: string;
      storyType: string;
      storyFormat: string;
      current: { title: string; genre: string; updatedAt: number | null; version: number };
      aiMetadata: { pipelineState: "idle" | "ready" | "processing"; lastEditedByAIAt: number | null };
      updatedAt: number | null;
    }>
  >([]);

  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<{
    totals: { views: number; likes: number; bookmarks: number; mints: number };
    stories: Array<{
      storyId: string;
      title: string;
      status: string;
      updatedAt: number;
      views: number;
      likes: number;
      bookmarks: number;
      mints: number;
    }>;
  } | null>(null);

  const [nftsLoading, setNftsLoading] = useState(false);
  const [nftsError, setNftsError] = useState<string | null>(null);
  const [nfts, setNfts] = useState<
    Array<{
      storyId: string;
      title: string;
      status: string;
      ipfsHash?: string;
      nftTxHash?: string;
      nftTokenId?: string;
      syncStatus: "missing" | "pending" | "confirmed" | "failed";
      explorer: { tx?: string; token?: string; contract?: string };
      updatedAt: number;
    }>
  >([]);

  const localDrafts = useMemo(() => {
    const normalizedQuery = draftQuery.trim().toLowerCase();
    return listDraftRecords((record) => {
      if (draftPipelineFilter !== "all" && record.aiMetadata?.pipelineState !== draftPipelineFilter) {
        return false;
      }
      if (!normalizedQuery) {
        return true;
      }
      const haystack = [
        record.current?.title,
        record.current?.genre,
        record.storyType,
        record.storyFormat,
        record.draftKey,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [draftPipelineFilter, draftQuery]);

  const draftCards = useMemo(() => {
    const normalizedQuery = draftQuery.trim().toLowerCase();
    const matchesQuery = (fields: Array<string | undefined | null>) => {
      if (!normalizedQuery) {
        return true;
      }
      return fields
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    };

    const byKey = new Map<
      string,
      {
        draftKey: string;
        storyType: string;
        storyFormat: string;
        title: string;
        genre: string;
        updatedAt: number;
        pipelineState: "idle" | "ready" | "processing";
        source: "local" | "cloud" | "both";
        local?: StoryDraftRecord;
      }
    >();

    for (const remote of cloudDrafts) {
      if (
        draftPipelineFilter !== "all" &&
        remote.aiMetadata?.pipelineState !== draftPipelineFilter
      ) {
        continue;
      }
      if (
        !matchesQuery([
          remote.current?.title,
          remote.current?.genre,
          remote.storyType,
          remote.storyFormat,
          remote.draftKey,
        ])
      ) {
        continue;
      }
      const updatedAt = remote.updatedAt ?? remote.current?.updatedAt ?? Date.now();
      byKey.set(remote.draftKey, {
        draftKey: remote.draftKey,
        storyType: remote.storyType || "text",
        storyFormat: remote.storyFormat || "free",
        title: remote.current?.title?.trim() || "Untitled Draft",
        genre: remote.current?.genre?.trim() || "Uncategorized",
        updatedAt,
        pipelineState: remote.aiMetadata?.pipelineState || "idle",
        source: "cloud",
      });
    }

    for (const local of localDrafts) {
      if (
        !matchesQuery([
          local.current?.title,
          local.current?.genre,
          local.storyType,
          local.storyFormat,
          local.draftKey,
        ])
      ) {
        continue;
      }
      const updatedAt = local.updatedAt || local.current?.updatedAt || Date.now();
      const existing = byKey.get(local.draftKey);
      byKey.set(local.draftKey, {
        draftKey: local.draftKey,
        storyType: local.storyType || "text",
        storyFormat: local.storyFormat || "free",
        title: local.current?.title?.trim() || "Untitled Draft",
        genre: local.current?.genre?.trim() || "Uncategorized",
        updatedAt: Math.max(updatedAt, existing?.updatedAt ?? 0),
        pipelineState: local.aiMetadata?.pipelineState || existing?.pipelineState || "idle",
        source: existing ? "both" : "local",
        local,
      });
    }

    return [...byKey.values()].sort((a, b) => b.updatedAt - a.updatedAt);
  }, [cloudDrafts, draftPipelineFilter, draftQuery, localDrafts]);

  useEffect(() => {
    if (!address) {
      setAnalytics(null);
      setNfts([]);
      setCloudDrafts([]);
      return;
    }

    const controller = new AbortController();
    const fetchAnalytics = async () => {
      setAnalyticsLoading(true);
      setAnalyticsError(null);
      try {
        const response = await fetch(
          `/api/creator/analytics?wallet=${encodeURIComponent(address)}`,
          { signal: controller.signal }
        );
        if (!response.ok) {
          throw new Error("Failed to load analytics");
        }
        const payload = (await response.json()) as typeof analytics;
        setAnalytics(payload);
      } catch (error) {
        if ((error as any)?.name !== "AbortError") {
          setAnalyticsError("Analytics is currently unavailable.");
          setAnalytics(null);
        }
      } finally {
        setAnalyticsLoading(false);
      }
    };

    const fetchNfts = async () => {
      setNftsLoading(true);
      setNftsError(null);
      try {
        const response = await fetch(
          `/api/creator/nfts?wallet=${encodeURIComponent(address)}`,
          { signal: controller.signal }
        );
        if (!response.ok) {
          throw new Error("Failed to load NFTs");
        }
        const payload = (await response.json()) as typeof nfts;
        setNfts(payload);
      } catch (error) {
        if ((error as any)?.name !== "AbortError") {
          setNftsError("NFT data is currently unavailable.");
          setNfts([]);
        }
      } finally {
        setNftsLoading(false);
      }
    };

    const fetchCloudDrafts = async () => {
      setCloudDraftsLoading(true);
      setCloudDraftsError(null);
      try {
        const response = await fetch(
          `/api/creator/drafts?wallet=${encodeURIComponent(address)}&limit=50`,
          { signal: controller.signal }
        );
        if (!response.ok) {
          throw new Error("Failed to load drafts");
        }
        const payload = (await response.json()) as { items: typeof cloudDrafts };
        setCloudDrafts(payload.items || []);
      } catch (error) {
        if ((error as any)?.name !== "AbortError") {
          setCloudDraftsError("Cloud drafts are currently unavailable.");
          setCloudDrafts([]);
        }
      } finally {
        setCloudDraftsLoading(false);
      }
    };

    fetchAnalytics();
    fetchNfts();
    fetchCloudDrafts();

    return () => controller.abort();
  }, [address]);

  const openDraft = (draft: StoryDraftRecord) => {
    try {
      setActiveDraftKey(draft.draftKey);
      localStorage.setItem(
        "storyCreationData",
        JSON.stringify({
          type: draft.storyType || "text",
          format: draft.storyFormat || "free",
          draftKey: draft.draftKey,
          timestamp: Date.now(),
        })
      );
      router.push("/create");
    } catch {
      toast({
        title: "Unable to open draft",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteDraft = (draft: StoryDraftRecord) => {
    clearDraftRecord(draft.draftKey);
    toast({
      title: "Draft deleted",
      description: draft.current?.title?.trim() ? draft.current.title : "Untitled draft",
    });
  };

  const importCloudDraft = async (draftKey: string) => {
    if (!address) {
      return;
    }
    try {
      const response = await fetch(
        `/api/creator/drafts/${encodeURIComponent(draftKey)}?wallet=${encodeURIComponent(
          address
        )}`
      );
      if (!response.ok) {
        throw new Error("Failed to import");
      }
      const payload = (await response.json()) as StoryDraftRecord;
      const imported = upsertDraftRecord(payload);
      openDraft(imported);
    } catch {
      toast({
        title: "Import failed",
        description: "Unable to import this draft to your device.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Creator Dashboard</h1>
            <p className="text-muted-foreground">
              Drafts, NFTs, and engagement analytics in one place.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={async () => {
                try {
                  await connect();
                } catch {
                  toast({
                    title: "Wallet connection failed",
                    description: "Please check your wallet and try again.",
                    variant: "destructive",
                  });
                }
              }}
            >
              <Wallet className="h-4 w-4" />
              {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Connect Wallet"}
            </Button>

            <Button className="gap-2" onClick={() => router.push("/create")}>
              <Plus className="h-4 w-4" />
              Create
            </Button>

            <Button variant="secondary" className="gap-2" asChild>
              <Link href="/dashboard/royalties">
                <Sparkles className="h-4 w-4" />
                Royalties
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">{analytics?.totals.views ?? 0}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Likes</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">{analytics?.totals.likes ?? 0}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bookmarks</CardTitle>
              <Bookmark className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">{analytics?.totals.bookmarks ?? 0}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mints</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">{analytics?.totals.mints ?? 0}</div>
              )}
            </CardContent>
          </Card>
        </div>

        {(analyticsError || nftsError || cloudDraftsError) && (
          <div className="flex flex-col gap-2">
            {analyticsError && (
              <div className="text-sm text-muted-foreground">{analyticsError}</div>
            )}
            {nftsError && <div className="text-sm text-muted-foreground">{nftsError}</div>}
            {cloudDraftsError && <div className="text-sm text-muted-foreground">{cloudDraftsError}</div>}
          </div>
        )}

        <Tabs value={tab} onValueChange={(value) => setTab(value as any)}>
          <TabsList>
            <TabsTrigger value="drafts" className="gap-2">
              <FileText className="h-4 w-4" />
              My Drafts
            </TabsTrigger>
            <TabsTrigger value="nfts" className="gap-2">
              <Trophy className="h-4 w-4" />
              My NFTs
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="drafts">
            <Card>
              <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle>Draft Library</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Search, filter, and jump back into your work.
                  </p>
                </div>

                <div className="flex flex-col gap-2 md:flex-row md:items-center">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={draftQuery}
                      onChange={(e) => setDraftQuery(e.target.value)}
                      placeholder="Search drafts..."
                      className="pl-9 md:w-[260px]"
                    />
                  </div>
                  <Select
                    value={draftPipelineFilter}
                    onValueChange={(value) =>
                      setDraftPipelineFilter(value as typeof draftPipelineFilter)
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="ready">Ready</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="idle">Idle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {cloudDraftsLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading cloud drafts…
                  </div>
                ) : draftCards.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    No drafts found. Start a new story to create your first draft.
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {draftCards.map((draft) => {
                      return (
                        <Card key={draft.draftKey}>
                          <CardHeader className="space-y-2">
                            <div className="flex items-start justify-between gap-3">
                              <CardTitle className="text-base leading-tight">{draft.title}</CardTitle>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{draft.pipelineState}</Badge>
                                <Badge variant="secondary">{draft.source}</Badge>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              <span>{draft.genre}</span>
                              <span>•</span>
                              <span>
                                Edited{" "}
                                {formatDistanceToNowStrict(new Date(draft.updatedAt), {
                                  addSuffix: true,
                                })}
                              </span>
                            </div>
                          </CardHeader>
                          <CardContent className="flex items-center justify-between gap-2">
                            <div className="text-xs text-muted-foreground">
                              {draft.storyType}/{draft.storyFormat}
                            </div>
                            <div className="flex items-center gap-2">
                              {draft.local ? (
                                <>
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => openDraft(draft.local!)}
                                  >
                                    Open
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => deleteDraft(draft.local!)}
                                    aria-label="Delete draft"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => importCloudDraft(draft.draftKey)}
                                  disabled={!address}
                                >
                                  Import
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="nfts">
            <Card>
              <CardHeader>
                <CardTitle>My NFTs</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Off-chain metadata from Mongo + on-chain sync status and explorer links.
                </p>
              </CardHeader>
              <CardContent>
                {!address ? (
                  <div className="text-sm text-muted-foreground">
                    Connect your wallet to view NFTs tied to your author address.
                  </div>
                ) : nftsLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading NFTs…
                  </div>
                ) : nfts.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    No NFTs found for this wallet yet.
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {nfts.map((item) => (
                      <Card key={item.storyId}>
                        <CardHeader className="space-y-2">
                          <div className="flex items-start justify-between gap-3">
                            <CardTitle className="text-base leading-tight">{item.title}</CardTitle>
                            <Badge variant="outline">{item.syncStatus}</Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {item.status} • Updated{" "}
                            {formatDistanceToNowStrict(new Date(item.updatedAt), {
                              addSuffix: true,
                            })}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid gap-2 text-sm">
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-muted-foreground">Token</span>
                              <span className="font-medium">{item.nftTokenId || "—"}</span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-muted-foreground">Tx</span>
                              <span className="font-medium">
                                {item.nftTxHash ? `${item.nftTxHash.slice(0, 10)}…` : "—"}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {item.explorer.tx && (
                              <Button variant="secondary" size="sm" asChild className="gap-2">
                                <a href={item.explorer.tx} target="_blank" rel="noreferrer">
                                  <ExternalLink className="h-4 w-4" />
                                  Tx
                                </a>
                              </Button>
                            )}
                            {item.explorer.token && (
                              <Button variant="secondary" size="sm" asChild className="gap-2">
                                <a href={item.explorer.token} target="_blank" rel="noreferrer">
                                  <Link2 className="h-4 w-4" />
                                  Token
                                </a>
                              </Button>
                            )}
                            {item.explorer.contract && (
                              <Button variant="outline" size="sm" asChild className="gap-2">
                                <a href={item.explorer.contract} target="_blank" rel="noreferrer">
                                  <ExternalLink className="h-4 w-4" />
                                  Contract
                                </a>
                              </Button>
                            )}
                          </div>

                          {item.ipfsHash && (
                            <div className="text-xs text-muted-foreground">
                              Metadata: {item.ipfsHash}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Analytics</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Views, likes, bookmarks, and mints across your stories.
                </p>
              </CardHeader>
              <CardContent>
                {!address ? (
                  <div className="text-sm text-muted-foreground">
                    Connect your wallet to view creator analytics.
                  </div>
                ) : analyticsLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading analytics…
                  </div>
                ) : !analytics ? (
                  <div className="text-sm text-muted-foreground">
                    No analytics available yet.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Story</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Views</TableHead>
                        <TableHead>Likes</TableHead>
                        <TableHead>Bookmarks</TableHead>
                        <TableHead>Mints</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analytics.stories.map((row) => (
                        <TableRow key={row.storyId}>
                          <TableCell className="font-medium">{row.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{row.status}</Badge>
                          </TableCell>
                          <TableCell>{row.views}</TableCell>
                          <TableCell>{row.likes}</TableCell>
                          <TableCell>{row.bookmarks}</TableCell>
                          <TableCell>{row.mints}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <div className="mt-4 text-xs text-muted-foreground">
              Explorer: {BLOCKCHAIN_CONFIG.networks.monad.explorerUrl}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
