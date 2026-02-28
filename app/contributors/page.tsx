'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Star,
    GitFork,
    CircleDot,
    GitPullRequest,
    Github,
    ExternalLink,
    Search,
    ChevronLeft,
    ChevronRight,
    TrendingUp,
    Award
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious
} from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';

const REPO_OWNER = 'Drago-03';
const REPO_NAME = 'GroqTales';
const ITEMS_PER_PAGE = 12;

interface RepoStats {
    stars: number;
    forks: number;
    openIssues: number;
    openPRs: number;
    totalContributors: number;
}

interface Contributor {
    id: number;
    login: string;
    avatar_url: string;
    html_url: string;
    contributions: number;
    type: string;
}

export default function ContributorsPage() {
    const [stats, setStats] = useState<RepoStats | null>(null);
    const [contributors, setContributors] = useState<Contributor[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);

                // Fetch Repo Stats
                const repoRes = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`);
                const repoData = await repoRes.json();

                // Fetch PRs (GitHub API counts issues and PRs together in open_issues_count, 
                // but we can fetch PRs separately to distinguish)
                const prsRes = await fetch(`https://api.github.com/search/issues?q=repo:${REPO_OWNER}/${REPO_NAME}+type:pr+state:open`);
                const prsData = await prsRes.json();

                // Fetch Contributors
                const contributorsRes = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contributors?per_page=100`);
                const contributorsData = await contributorsRes.json();

                setStats({
                    stars: repoData.stargazers_count || 0,
                    forks: repoData.forks_count || 0,
                    openIssues: (repoData.open_issues_count || 0) - (prsData.total_count || 0),
                    openPRs: prsData.total_count || 0,
                    totalContributors: contributorsData.length || 0
                });

                setContributors(contributorsData);
            } catch (error) {
                console.error('Error fetching contributor data:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    const filteredContributors = contributors.filter(c =>
        c.login.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredContributors.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedContributors = filteredContributors.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const StatCard = ({ icon: Icon, label, value, color }: { icon: any, label: string, value: number, color: string }) => (
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
            <CardContent className="p-6 flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-${color}-500/20 text-${color}-400`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-xs uppercase tracking-wider text-white/50 font-semibold">{label}</p>
                    <p className="text-2xl font-bold text-white">{value.toLocaleString()}</p>
                </div>
            </CardContent>
        </Card>
    );

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            {/* Background Decorative Elements */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-blue-500/10 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-emerald-500/10 blur-[120px]" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header Section */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Badge variant="outline" className="mb-4 border-blue-500/50 text-blue-400 px-4 py-1 rounded-full bg-blue-500/5">
                            Community Contributions
                        </Badge>
                        <h1 className="text-4xl md:text-6xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-200 to-white/70">
                            The Minds Behind GroqTales
                        </h1>
                        <p className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed">
                            Meet the incredible developers and dreamers who are building the future of Web3 storytelling.
                            Our project thrives because of this amazing community.
                        </p>
                    </motion.div>
                </div>

                {/* Repository Stats Panel */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-16">
                    {loading ? (
                        Array(5).fill(0).map((_, i) => (
                            <Skeleton key={i} className="h-28 rounded-xl bg-white/5" />
                        ))
                    ) : (
                        <>
                            <StatCard icon={Star} label="Stars" value={stats?.stars || 0} color="yellow" />
                            <StatCard icon={GitFork} label="Forks" value={stats?.forks || 0} color="blue" />
                            <StatCard icon={CircleDot} label="Issues" value={stats?.openIssues || 0} color="red" />
                            <StatCard icon={GitPullRequest} label="Open PRs" value={stats?.openPRs || 0} color="purple" />
                            <StatCard icon={Users} label="Contributors" value={stats?.totalContributors || 0} color="emerald" />
                        </>
                    )}
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <Input
                            placeholder="Search contributors..."
                            className="bg-white/5 border-white/10 pl-11 h-12 rounded-2xl focus:border-blue-500/50 focus:ring-blue-500/20 text-white placeholder:text-white/30"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            className="bg-white/5 border-white/10 hover:bg-white/10 text-white/70 rounded-xl px-6 h-12"
                            asChild
                        >
                            <Link href={`https://github.com/${REPO_OWNER}/${REPO_NAME}`} target="_blank">
                                <Github className="w-4 h-4 mr-2" />
                                View Repository
                            </Link>
                        </Button>
                        <Button
                            className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-6 h-12 shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                            asChild
                        >
                            <Link href={`https://github.com/${REPO_OWNER}/${REPO_NAME}/blob/main/CONTRIBUTING.md`} target="_blank">
                                Start Contributing
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Contributors Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12"
                >
                    {loading ? (
                        Array(ITEMS_PER_PAGE).fill(0).map((_, i) => (
                            <Card key={i} className="bg-white/5 border-white/10 h-64">
                                <CardContent className="p-6 flex flex-col items-center justify-center space-y-4">
                                    <Skeleton className="w-20 h-20 rounded-full bg-white/10" />
                                    <Skeleton className="w-32 h-6 bg-white/10" />
                                    <Skeleton className="w-24 h-4 bg-white/10" />
                                </CardContent>
                            </Card>
                        ))
                    ) : paginatedContributors.length > 0 ? (
                        paginatedContributors.map((contributor) => (
                            <motion.div key={contributor.id} variants={itemVariants}>
                                <Card className="group bg-white/5 border-white/10 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-500 h-full overflow-hidden relative">
                                    {/* Card Background Glow */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-[40px] group-hover:bg-blue-600/10 transition-all duration-500" />

                                    <CardHeader className="p-6 pb-2 text-center">
                                        <div className="relative mx-auto mb-4">
                                            <div className="absolute inset-0 rounded-full bg-blue-500 blur-lg opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
                                            <Avatar className="w-24 h-24 mx-auto border-2 border-white/10 group-hover:border-blue-500/50 transition-colors duration-500 ring-4 ring-black">
                                                <AvatarImage src={contributor.avatar_url} alt={contributor.login} />
                                                <AvatarFallback className="bg-zinc-900">{contributor.login.substring(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div className="absolute -bottom-2 -right-2 bg-blue-600 rounded-full p-2 border-2 border-black">
                                                <Award className="w-4 h-4 text-white" />
                                            </div>
                                        </div>
                                        <CardTitle className="text-xl font-bold group-hover:text-blue-400 transition-colors">
                                            {contributor.login}
                                        </CardTitle>
                                        <CardDescription className="text-blue-400/70 font-mono text-xs mt-1">
                                            @{contributor.login}
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent className="p-6 pt-2 text-center">
                                        <div className="flex items-center justify-center gap-2 mb-4">
                                            <TrendingUp className="w-4 h-4 text-emerald-400" />
                                            <span className="text-sm font-semibold text-emerald-400">
                                                {contributor.contributions} Contributions
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap items-center justify-center gap-2">
                                            <Badge variant="secondary" className="bg-white/5 hover:bg-white/10 text-white/70 border-white/10">
                                                {contributor.type}
                                            </Badge>
                                            {contributor.contributions > 50 && (
                                                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                                                    Top Contributor
                                                </Badge>
                                            )}
                                        </div>
                                    </CardContent>

                                    <CardFooter className="p-4 bg-white/5 border-t border-white/5 mt-auto">
                                        <Button
                                            variant="ghost"
                                            className="w-full text-white/50 hover:text-white hover:bg-white/10 transition-all"
                                            asChild
                                        >
                                            <Link href={contributor.html_url} target="_blank" className="flex items-center justify-center">
                                                <Github className="w-4 h-4 mr-2" />
                                                GitHub Profile
                                                <ExternalLink className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center">
                            <Users className="w-16 h-16 mx-auto text-white/20 mb-4" />
                            <h3 className="text-xl font-bold mb-2">No contributors found</h3>
                            <p className="text-white/40">Try searching for a different username.</p>
                        </div>
                    )}
                </motion.div>

                {/* Pagination Section */}
                {!loading && filteredContributors.length > ITEMS_PER_PAGE && (
                    <div className="flex justify-center mt-12">
                        <Pagination>
                            <PaginationContent className="bg-white/5 border border-white/10 p-1 rounded-2xl backdrop-blur-sm">
                                <PaginationItem>
                                    <PaginationPrevious
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (currentPage > 1) setCurrentPage(currentPage - 1);
                                        }}
                                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                                    />
                                </PaginationItem>

                                {Array.from({ length: totalPages }).map((_, i) => {
                                    const page = i + 1;
                                    // Show current, first, last, and pages around current
                                    if (
                                        page === 1 ||
                                        page === totalPages ||
                                        (page >= currentPage - 1 && page <= currentPage + 1)
                                    ) {
                                        return (
                                            <PaginationItem key={page}>
                                                <PaginationLink
                                                    href="#"
                                                    isActive={currentPage === page}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setCurrentPage(page);
                                                    }}
                                                    className={currentPage === page ? 'bg-blue-600 text-white border-blue-500' : 'hover:bg-white/10'}
                                                >
                                                    {page}
                                                </PaginationLink>
                                            </PaginationItem>
                                        );
                                    } else if (
                                        (page === currentPage - 2 && page > 1) ||
                                        (page === currentPage + 2 && page < totalPages)
                                    ) {
                                        return <PaginationEllipsis key={page} />;
                                    }
                                    return null;
                                })}

                                <PaginationItem>
                                    <PaginationNext
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                                        }}
                                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}

                {/* Getting Started Section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="mt-24 p-8 md:p-12 rounded-3xl bg-gradient-to-br from-blue-600/20 via-black to-emerald-600/10 border border-white/10 text-center relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />

                    <h2 className="text-3xl md:text-5xl font-black mb-6">Want to join this list?</h2>
                    <p className="text-white/60 text-lg max-w-2xl mx-auto mb-10">
                        GroqTales is an open-source project and we're always looking for talented developers, designers,
                        and writers to help us shape the future of Web3.
                    </p>

                    <div className="flex flex-wrap justify-center gap-4">
                        <Button size="lg" className="rounded-full px-8 bg-white text-black hover:bg-white/90 font-bold" asChild>
                            <Link href={`https://github.com/${REPO_OWNER}/${REPO_NAME}`} target="_blank">
                                <Github className="w-5 h-5 mr-2" />
                                Go to GitHub
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" className="rounded-full px-8 border-white/20 bg-white/5 hover:bg-white/10 font-bold" asChild>
                            <Link href="/contact">
                                Contact Team
                            </Link>
                        </Button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
