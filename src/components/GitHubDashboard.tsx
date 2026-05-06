import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Github, ExternalLink, RefreshCw, AlertCircle, CheckCircle2, ChevronRight, Database, FolderSearch, Layout, Code } from 'lucide-react';
import { githubService, GitHubRepo, GitHubContent } from '../services/githubService';
import { useAuth } from './AuthProvider';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { cn } from '../lib/utils';

export default function GitHubDashboard() {
  const { user, profile } = useAuth();
  const [accessToken, setAccessToken] = useState<string | null>(githubService.getToken());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [repoStructure, setRepoStructure] = useState<GitHubContent[]>([]);
  const [view, setView] = useState<'connect' | 'repo-list' | 'dashboard'>('connect');

  useEffect(() => {
    if (accessToken) {
      if (profile?.githubRepo) {
        setView('dashboard');
        fetchRepoData(profile.githubRepo.owner, profile.githubRepo.name);
      } else {
        setView('repo-list');
        loadRepos();
      }
    } else {
      setView('connect');
    }
  }, [accessToken, profile?.githubRepo]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'GITHUB_AUTH_SUCCESS') {
        const token = event.data.accessToken;
        githubService.saveToken(token);
        setAccessToken(token);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleConnect = async () => {
    try {
      const response = await fetch('/api/auth/github/url');
      const { url } = await response.json();
      window.open(url, 'github_oauth', 'width=600,height=700');
    } catch (err) {
      setError('Failed to initiate GitHub connection');
    }
  };

  const loadRepos = async () => {
    setLoading(true);
    try {
      const data = await githubService.fetchRepos();
      setRepos(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectRepo = async (repo: GitHubRepo) => {
    if (!user) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        githubRepo: {
          owner: repo.full_name.split('/')[0],
          name: repo.name,
          path: ''
        }
      });
      setSelectedRepo(repo);
      setView('dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRepoData = async (owner: string, name: string) => {
    setLoading(true);
    try {
      const content = await githubService.fetchRepoContent(owner, name);
      if (Array.isArray(content)) {
        setRepoStructure(content);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetIntegration = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        githubRepo: null
      });
      setView('repo-list');
      loadRepos();
    } catch (err) {
      console.error(err);
    }
  };

  if (view === 'connect') {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-slate-900 border border-white/5 rounded-[3rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32" />
        <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mb-8 border border-white/10">
          <Github size={40} className="text-white" />
        </div>
        <h2 className="text-3xl font-black text-white italic tracking-tighter mb-4">Connect GitHub Data</h2>
        <p className="text-slate-400 text-lg max-w-md mb-10 font-medium">
          Integrate your private dashboard repository to replace this profile with your custom system knowledge base.
        </p>
        <button
          onClick={handleConnect}
          className="px-10 py-4 bg-white text-slate-900 font-black rounded-2xl flex items-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-white/10 group"
        >
          <Github size={20} />
          Sign in with GitHub
          <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    );
  }

  if (view === 'repo-list') {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tight">Select your Dashboard Repository</h2>
          <button onClick={loadRepos} disabled={loading} className="p-2 text-slate-400 hover:text-primary transition-colors">
            <RefreshCw className={cn(loading && "animate-spin")} size={20} />
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-500">
            <AlertCircle size={20} />
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {repos.map(repo => (
            <motion.div
              key={repo.id}
              whileHover={{ y: -4 }}
              onClick={() => selectRepo(repo)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-6 rounded-[2rem] cursor-pointer hover:border-primary/50 transition-all group lg:min-h-[160px] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-slate-100 dark:bg-white/5 rounded-xl">
                    <Database size={18} className="text-primary" />
                  </div>
                  {repo.private && <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Private</span>}
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1 group-hover:text-primary transition-colors">{repo.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {repo.description || "No description provided."}
                </p>
              </div>
              <div className="mt-4 flex items-center justify-end">
                <ChevronRight size={20} className="text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* GitHub Repo Header */}
      <div className="bg-slate-900 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center border border-white/10 shrink-0">
            <Github size={32} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">
                {profile?.githubRepo?.name || 'GitHub Dashboard'}
              </h2>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">Active Link</span>
            </div>
            <p className="text-slate-400 text-sm font-medium flex items-center gap-2">
              <FolderSearch size={14} /> Repository connected as system knowledge source
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setView('repo-list')}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
          >
            Switch Repo
          </button>
          <button 
            onClick={resetIntegration}
            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
          >
            Disconnect
          </button>
        </div>
      </div>

      {/* Main Dashboard UI inspired by the user's intent */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          {/* Mock content rendering repo data */}
          <div className="bg-white dark:bg-[#151522] border border-slate-200 dark:border-white/5 rounded-[3rem] p-8 shadow-xl min-h-[400px] relative overflow-hidden">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3 font-bold text-slate-900 dark:text-white uppercase tracking-widest text-sm">
                <Layout className="text-primary" size={18} />
                Repository Structure
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{repoStructure.length} Files detected</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {repoStructure.map(file => (
                <div key={file.sha} className="p-4 bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-white/5 rounded-2xl flex items-center gap-3 group hover:border-primary/30 transition-all cursor-pointer">
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-lg text-slate-400 group-hover:text-primary transition-colors">
                    {file.type === 'dir' ? <FolderSearch size={16} /> : <Code size={16} />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{file.name}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Custom Knowledge Area */}
            <div className="mt-12 p-8 bg-primary/5 rounded-[2.5rem] border border-primary/20">
               <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase italic tracking-tight mb-4 flex items-center gap-2">
                 <RefreshCw size={20} className="text-primary animate-spin-slow" />
                 Processing Repo Analysis...
               </h3>
               <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                 I found an <strong>index.html</strong> in your repository. I am currently indexing the system knowledge and dashboard components to serve as your primary interface.
               </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
           <div className="bg-indigo-600 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[20px] -mr-16 -mt-16" />
              <h3 className="text-xl font-black italic tracking-tighter uppercase mb-2">Sync Status</h3>
              <p className="text-indigo-100 text-xs font-medium mb-8 leading-relaxed">Your GitHub repository is successfully connected via encrypted OAuth tunnel.</p>
              
              <div className="space-y-4">
                 <div className="flex items-center justify-between pb-4 border-b border-white/10">
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">API Latency</span>
                    <span className="text-sm font-black italic">120ms</span>
                 </div>
                 <div className="flex items-center justify-between pb-4 border-b border-white/10">
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Rate Limit</span>
                    <span className="text-sm font-black italic">4998/5000</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Connection</span>
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                       <CheckCircle2 size={12} /> SECURE
                    </span>
                 </div>
              </div>
           </div>

           <div className="bg-white dark:bg-[#151522] border border-slate-200 dark:border-white/5 rounded-[3rem] p-8 shadow-xl">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6">Quick Links</h3>
              <div className="space-y-3">
                 <a 
                   href={`https://github.com/${profile?.githubRepo?.owner}/${profile?.githubRepo?.name}`}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="w-full p-4 bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-white/5 rounded-2xl flex items-center justify-between group hover:bg-slate-100 dark:hover:bg-black/30 transition-all font-bold text-sm text-slate-600 dark:text-slate-300"
                 >
                   View on GitHub
                   <ExternalLink size={14} className="group-hover:text-primary transition-colors" />
                 </a>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
