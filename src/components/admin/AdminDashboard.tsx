"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BarChart3,
  Check,
  Database,
  ImagePlus,
  LogOut,
  Mail,
  Plus,
  RefreshCw,
  Save,
  Trash2,
} from "lucide-react";
import { ChatInsightsTab } from "@/components/admin/ChatInsightsTab";
import { Badge } from "@/components/ui/Badge";
import { BrutalButton } from "@/components/ui/BrutalButton";
import { BrutalCard } from "@/components/ui/BrutalCard";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type {
  AnalyticsSummary,
  ChatInsightsSummary,
  ContactMessage,
  Experience,
  GitHubRepo,
  Profile,
  Project,
  ProjectGalleryImage,
  TechCapability,
} from "@/types/portfolio";

type TabKey =
  | "profile"
  | "projects"
  | "capabilities"
  | "experience"
  | "messages"
  | "analytics"
  | "chat";

interface AdminDashboardProps {
  initialProfile: Profile;
  initialProjects: Project[];
  initialCapabilities: TechCapability[];
  initialExperiences: Experience[];
  initialMessages: ContactMessage[];
  initialAnalytics: AnalyticsSummary;
  initialChatInsights: ChatInsightsSummary;
  schemaReady: boolean;
  userEmail: string;
}

const inputCls =
  "w-full border-2 border-borderline bg-canvas px-3 py-2 text-base text-ink focus:outline-none focus:ring-2 focus:ring-ink sm:text-sm";
const labelCls =
  "mb-1 block font-mono text-[11px] font-bold uppercase tracking-wider text-muted";

function createBlankProject(): Omit<Project, "id"> {
  return {
    slug: "",
    title_en: "",
    title_id: "",
    summary_en: "",
    summary_id: "",
    category: "Fullstack Web",
    year: "2026",
    role_en: "Fullstack Web Developer",
    role_id: "Fullstack Web Developer",
    tech_stack: ["PHP", "Laravel", "MySQL"],
    problem_en: "",
    problem_id: "",
    architecture_en: "",
    architecture_id: "",
    challenges_en: "",
    challenges_id: "",
    impact_en: "",
    impact_id: "",
    live_url: null,
    repo_url: null,
    cover_image_url: null,
    gallery_images: [],
    featured: true,
    published: true,
    sort_order: 10,
  };
}

function createBlankCapability(): Omit<TechCapability, "id"> {
  return {
    category_key: "",
    title_en: "",
    title_id: "",
    description_en: "",
    description_id: "",
    items: [],
    sort_order: 5,
  };
}

function createBlankExperience(): Omit<Experience, "id"> {
  return {
    organization: "",
    role_en: "",
    role_id: "",
    period: "",
    location: "Indonesia",
    summary_en: "",
    summary_id: "",
    highlights_en: [],
    highlights_id: [],
    published: true,
    sort_order: 5,
  };
}

export function AdminDashboard({
  initialProfile,
  initialProjects,
  initialCapabilities,
  initialExperiences,
  initialMessages,
  initialAnalytics,
  initialChatInsights,
  schemaReady,
  userEmail,
}: AdminDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("projects");
  const [notice, setNotice] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploadingTarget, setUploadingTarget] = useState<
    "avatar" | "project" | "gallery" | null
  >(null);
  const [galleryUrlDraft, setGalleryUrlDraft] = useState("");

  // State slices
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [capabilities, setCapabilities] =
    useState<TechCapability[]>(initialCapabilities);
  const [experiences, setExperiences] =
    useState<Experience[]>(initialExperiences);
  const [messages, setMessages] = useState<ContactMessage[]>(initialMessages);
  const [analytics, setAnalytics] =
    useState<AnalyticsSummary>(initialAnalytics);
  const [chatInsights, setChatInsights] =
    useState<ChatInsightsSummary>(initialChatInsights);
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([]);
  const [loadingGithubRepos, setLoadingGithubRepos] = useState(false);
  const [githubReposLoaded, setGithubReposLoaded] = useState(false);

  // Project editor state
  const [editingProjectId, setEditingProjectId] = useState<string | "new" | null>(
    null
  );
  const [projectForm, setProjectForm] = useState<Omit<Project, "id">>(
    createBlankProject()
  );
  const [projectStackInput, setProjectStackInput] = useState("PHP, Laravel, MySQL");

  // Capability editor state
  const [editingCapId, setEditingCapId] = useState<string | "new" | null>(null);
  const [capForm, setCapForm] = useState<Omit<TechCapability, "id">>(
    createBlankCapability()
  );
  const [capItemsInput, setCapItemsInput] = useState("");

  // Experience editor state
  const [editingExpId, setEditingExpId] = useState<string | "new" | null>(null);
  const [expForm, setExpForm] = useState<Omit<Experience, "id">>(
    createBlankExperience()
  );
  const [expHighlightsEn, setExpHighlightsEn] = useState("");
  const [expHighlightsId, setExpHighlightsId] = useState("");

  const unreadCount = messages.filter((m) => !m.is_read).length;

  function notify(type: "ok" | "err", text: string) {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 5000);
  }

  async function handleSignOut() {
    const supabase = createBrowserSupabaseClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push("/admin/login");
    router.refresh();
  }

  async function handleImageUpload(
    file: File | undefined,
    folder: "profile" | "projects",
    onUploaded: (url: string) => void
  ) {
    if (!file) return;
    setUploadingTarget(folder === "profile" ? "avatar" : "project");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) {
        notify("err", json.error || "Image upload failed.");
      } else {
        onUploaded(json.url);
        notify("ok", "Image uploaded! Click Save to publish changes.");
      }
    } catch {
      notify("err", "Network error during image upload.");
    } finally {
      setUploadingTarget(null);
    }
  }

  async function deleteStorageImage(url: string | null | undefined) {
    if (!url) return;
    try {
      await fetch("/api/admin/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
    } catch {
      // Non-blocking storage cleanup
    }
  }

  async function handleRemoveProfilePhoto() {
    const previousUrl = profile.avatar_url;
    setBusy(true);
    try {
      const updatedPayload: Profile = { ...profile, avatar_url: null };
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPayload),
      });
      const json = (await res.json()) as { profile?: Profile; error?: string };
      if (!res.ok || !json.profile) {
        notify("err", json.error || "Failed to remove profile photo.");
      } else {
        await deleteStorageImage(previousUrl);
        setProfile(json.profile);
        router.refresh();
        notify("ok", "Profile photo removed and saved.");
      }
    } catch {
      notify("err", "Network error while removing profile photo.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRemoveProjectThumbnail() {
    const previousUrl = projectForm.cover_image_url;
    setBusy(true);
    try {
      if (editingProjectId && editingProjectId !== "new") {
        const res = await fetch(`/api/admin/projects/${editingProjectId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cover_image_url: null }),
        });
        const json = (await res.json()) as { project?: Project; error?: string };
        if (!res.ok || !json.project) {
          notify("err", json.error || "Failed to remove project thumbnail.");
          return;
        }
        setProjects((prev) =>
          prev.map((item) =>
            item.id === json.project!.id ? json.project! : item
          )
        );
      }

      await deleteStorageImage(previousUrl);
      setProjectForm((prev) => ({ ...prev, cover_image_url: null }));
      router.refresh();
      notify("ok", "Project thumbnail removed and saved.");
    } catch {
      notify("err", "Network error while removing thumbnail.");
    } finally {
      setBusy(false);
    }
  }

  async function handleGalleryFilesUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadingTarget("gallery");
    const uploaded: ProjectGalleryImage[] = [];
    let failedCount = 0;

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "projects");

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });
        const json = (await res.json()) as { url?: string; error?: string };
        if (res.ok && json.url) {
          uploaded.push({
            url: json.url,
            caption_en: "",
            caption_id: "",
          });
        } else {
          failedCount += 1;
        }
      }

      if (uploaded.length > 0) {
        setProjectForm((prev) => ({
          ...prev,
          gallery_images: [...(prev.gallery_images ?? []), ...uploaded],
        }));
        notify(
          "ok",
          failedCount > 0
            ? `${uploaded.length} photo(s) uploaded (${failedCount} failed). Click Save Project to publish.`
            : `${uploaded.length} documentation photo(s) uploaded! Click Save Project to publish.`
        );
      } else {
        notify("err", "Failed to upload documentation photos.");
      }
    } catch {
      notify("err", "Network error uploading documentation photos.");
    } finally {
      setUploadingTarget(null);
    }
  }

  function handleAddGalleryUrl() {
    const trimmed = galleryUrlDraft.trim();
    if (!trimmed) return;
    setProjectForm((prev) => ({
      ...prev,
      gallery_images: [
        ...(prev.gallery_images ?? []),
        { url: trimmed, caption_en: "", caption_id: "" },
      ],
    }));
    setGalleryUrlDraft("");
  }

  function handleUpdateGalleryCaption(
    index: number,
    field: "caption_en" | "caption_id",
    value: string
  ) {
    setProjectForm((prev) => {
      const next = [...(prev.gallery_images ?? [])];
      if (!next[index]) return prev;
      next[index] = { ...next[index], [field]: value };
      return { ...prev, gallery_images: next };
    });
  }

  function handleMoveGalleryItem(index: number, direction: -1 | 1) {
    setProjectForm((prev) => {
      const next = [...(prev.gallery_images ?? [])];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return { ...prev, gallery_images: next };
    });
  }

  async function handleRemoveGalleryItem(index: number) {
    const current = [...(projectForm.gallery_images ?? [])];
    const removed = current[index];
    if (!removed) return;

    const nextGallery = current.filter((_, i) => i !== index);
    setBusy(true);
    try {
      if (editingProjectId && editingProjectId !== "new") {
        const res = await fetch(`/api/admin/projects/${editingProjectId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gallery_images: nextGallery }),
        });
        const json = (await res.json()) as { project?: Project; error?: string };
        if (!res.ok || !json.project) {
          notify("err", json.error || "Failed to remove documentation photo.");
          return;
        }
        setProjects((prev) =>
          prev.map((item) =>
            item.id === json.project!.id ? json.project! : item
          )
        );
      }

      await deleteStorageImage(removed.url);
      setProjectForm((prev) => ({ ...prev, gallery_images: nextGallery }));
      router.refresh();
      notify("ok", "Documentation photo removed.");
    } catch {
      notify("err", "Network error while removing photo.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSeedInitialData() {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/seed", { method: "POST" });
      const json = (await res.json()) as {
        ok?: boolean;
        projects?: Project[];
        capabilities?: TechCapability[];
        experiences?: Experience[];
        error?: string;
      };
      if (!res.ok || !json.ok) {
        notify("err", json.error || "Failed to import initial seed data.");
      } else {
        if (json.projects) setProjects(json.projects);
        if (json.capabilities) setCapabilities(json.capabilities);
        if (json.experiences) setExperiences(json.experiences);
        router.refresh();
        notify(
          "ok",
          "Initial Projects, Tech Matrix & Experience imported into Supabase!"
        );
      }
    } catch {
      notify("err", "Network error while importing initial seed data.");
    } finally {
      setBusy(false);
    }
  }

  // ---------------- PROFILE ----------------
  async function handleLoadGitHubRepos() {
    setLoadingGithubRepos(true);
    try {
      const res = await fetch(
        `/api/admin/github-repos?github_url=${encodeURIComponent(profile.github_url)}`
      );
      const json = (await res.json()) as { repos?: GitHubRepo[]; error?: string };
      if (!res.ok) {
        notify("err", json.error || "Failed to fetch GitHub repositories.");
      } else {
        setGithubRepos(json.repos ?? []);
        setGithubReposLoaded(true);
        if ((json.repos ?? []).length === 0) {
          notify("err", "No public non-fork repositories found for that GitHub URL.");
        }
      }
    } catch {
      notify("err", "Network error loading GitHub repositories.");
    } finally {
      setLoadingGithubRepos(false);
    }
  }

  function handleToggleFeaturedRepo(repoName: string) {
    setProfile((prev) => {
      const current = Array.isArray(prev.featured_github_repos)
        ? prev.featured_github_repos
        : [];
      const exists = current.some(
        (name) => name.toLowerCase() === repoName.toLowerCase()
      );

      if (exists) {
        return {
          ...prev,
          featured_github_repos: current.filter(
            (name) => name.toLowerCase() !== repoName.toLowerCase()
          ),
        };
      }

      if (current.length >= 3) {
        notify("err", "Maximum 3 repositories can be pinned. Unselect one first.");
        return prev;
      }

      return {
        ...prev,
        featured_github_repos: [...current, repoName],
      };
    });
  }

  async function handleSaveProfile(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const json = (await res.json()) as { profile?: Profile; error?: string };
      if (!res.ok || !json.profile) {
        notify("err", json.error || "Failed to save profile.");
      } else {
        setProfile(json.profile);
        router.refresh();
        notify("ok", "Profile updated and live pages revalidated.");
      }
    } catch {
      notify("err", "Network error while saving profile.");
    } finally {
      setBusy(false);
    }
  }

  // ---------------- PROJECTS ----------------
  function startNewProject() {
    const blank = createBlankProject();
    setEditingProjectId("new");
    setProjectForm(blank);
    setProjectStackInput(blank.tech_stack.join(", "));
  }

  function startEditProject(p: Project) {
    setEditingProjectId(p.id);
    setProjectForm({
      ...p,
      gallery_images: Array.isArray(p.gallery_images) ? p.gallery_images : [],
    });
    setProjectStackInput(p.tech_stack.join(", "));
  }

  async function handleSaveProject(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const payload = {
      ...projectForm,
      tech_stack: projectStackInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    try {
      const isNew = editingProjectId === "new";
      const res = await fetch(
        isNew ? "/api/admin/projects" : `/api/admin/projects/${editingProjectId}`,
        {
          method: isNew ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const json = (await res.json()) as { project?: Project; error?: string };
      if (!res.ok || !json.project) {
        notify("err", json.error || "Failed to save project.");
      } else {
        const saved = json.project;
        setProjects((prev) =>
          isNew
            ? [...prev, saved]
            : prev.map((item) => (item.id === saved.id ? saved : item))
        );
        setEditingProjectId(null);
        notify("ok", `Project "${saved.title_en}" saved.`);
      }
    } catch {
      notify("err", "Network error saving project.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteProject(id: string) {
    if (!confirm("Delete this project permanently?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/projects/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const json = (await res.json()) as { error?: string };
        notify("err", json.error || "Failed to delete project.");
      } else {
        setProjects((prev) => prev.filter((p) => p.id !== id));
        if (editingProjectId === id) setEditingProjectId(null);
        notify("ok", "Project deleted.");
      }
    } finally {
      setBusy(false);
    }
  }

  // ---------------- CAPABILITIES ----------------
  function startNewCap() {
    const blank = createBlankCapability();
    setEditingCapId("new");
    setCapForm(blank);
    setCapItemsInput("");
  }

  function startEditCap(c: TechCapability) {
    setEditingCapId(c.id);
    setCapForm({ ...c });
    setCapItemsInput(c.items.join(", "));
  }

  async function handleSaveCap(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const payload = {
      ...capForm,
      items: capItemsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    try {
      const isNew = editingCapId === "new";
      const res = await fetch(
        isNew
          ? "/api/admin/capabilities"
          : `/api/admin/capabilities/${editingCapId}`,
        {
          method: isNew ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const json = (await res.json()) as {
        capability?: TechCapability;
        error?: string;
      };
      if (!res.ok || !json.capability) {
        notify("err", json.error || "Failed to save capability.");
      } else {
        const saved = json.capability;
        setCapabilities((prev) =>
          isNew
            ? [...prev, saved]
            : prev.map((item) => (item.id === saved.id ? saved : item))
        );
        setEditingCapId(null);
        notify("ok", `Capability "${saved.title_en}" saved.`);
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteCap(id: string) {
    if (!confirm("Delete this capability quadrant?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/capabilities/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCapabilities((prev) => prev.filter((c) => c.id !== id));
        notify("ok", "Capability deleted.");
      }
    } finally {
      setBusy(false);
    }
  }

  // ---------------- EXPERIENCES ----------------
  function startNewExp() {
    const blank = createBlankExperience();
    setEditingExpId("new");
    setExpForm(blank);
    setExpHighlightsEn("");
    setExpHighlightsId("");
  }

  function startEditExp(exp: Experience) {
    setEditingExpId(exp.id);
    setExpForm({ ...exp });
    setExpHighlightsEn(exp.highlights_en.join("\n"));
    setExpHighlightsId(exp.highlights_id.join("\n"));
  }

  async function handleSaveExp(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const payload = {
      ...expForm,
      highlights_en: expHighlightsEn
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      highlights_id: expHighlightsId
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    try {
      const isNew = editingExpId === "new";
      const res = await fetch(
        isNew ? "/api/admin/experiences" : `/api/admin/experiences/${editingExpId}`,
        {
          method: isNew ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const json = (await res.json()) as {
        experience?: Experience;
        error?: string;
      };
      if (!res.ok || !json.experience) {
        notify("err", json.error || "Failed to save experience.");
      } else {
        const saved = json.experience;
        setExperiences((prev) =>
          isNew
            ? [...prev, saved]
            : prev.map((item) => (item.id === saved.id ? saved : item))
        );
        setEditingExpId(null);
        notify("ok", `Experience "${saved.organization}" saved.`);
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteExp(id: string) {
    if (!confirm("Delete this experience entry?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/experiences/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setExperiences((prev) => prev.filter((item) => item.id !== id));
        notify("ok", "Experience deleted.");
      }
    } finally {
      setBusy(false);
    }
  }

  // ---------------- MESSAGES ----------------
  async function handleToggleRead(msg: ContactMessage) {
    const res = await fetch("/api/admin/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: msg.id, is_read: !msg.is_read }),
    });
    if (res.ok) {
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, is_read: !m.is_read } : m))
      );
    }
  }

  async function handleDeleteMessage(id: string) {
    if (!confirm("Delete this message?")) return;
    const res = await fetch(`/api/admin/messages?id=${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setMessages((prev) => prev.filter((m) => m.id !== id));
      notify("ok", "Message deleted.");
    }
  }

  // ---------------- ANALYTICS ----------------
  async function handleRefreshAnalytics() {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/analytics");
      const json = (await res.json()) as {
        analytics?: AnalyticsSummary;
        error?: string;
      };
      if (!res.ok || !json.analytics) {
        notify("err", json.error || "Failed to refresh analytics.");
      } else {
        setAnalytics(json.analytics);
        notify("ok", "Analytics refreshed.");
      }
    } catch {
      notify("err", "Network error refreshing analytics.");
    } finally {
      setBusy(false);
    }
  }

  async function handleResetAnalytics() {
    if (!confirm("Reset all recorded analytics events? This cannot be undone.")) {
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/analytics", { method: "DELETE" });
      const json = (await res.json()) as {
        analytics?: AnalyticsSummary;
        error?: string;
      };
      if (!res.ok || !json.analytics) {
        notify("err", json.error || "Failed to reset analytics.");
      } else {
        setAnalytics(json.analytics);
        notify("ok", "Analytics data cleared.");
      }
    } catch {
      notify("err", "Network error resetting analytics.");
    } finally {
      setBusy(false);
    }
  }

  // ---------------- CHAT INSIGHTS ----------------
  async function handleRefreshChatInsights() {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/chat-insights");
      const json = (await res.json()) as {
        chatInsights?: ChatInsightsSummary;
        error?: string;
      };
      if (!res.ok || !json.chatInsights) {
        notify("err", json.error || "Failed to refresh chat insights.");
      } else {
        setChatInsights(json.chatInsights);
        notify("ok", "Chat insights refreshed.");
      }
    } catch {
      notify("err", "Network error refreshing chat insights.");
    } finally {
      setBusy(false);
    }
  }

  async function handleResetChatInsights() {
    if (
      !confirm(
        "Delete all recorded chatbot questions? This cannot be undone."
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/chat-insights", { method: "DELETE" });
      const json = (await res.json()) as {
        chatInsights?: ChatInsightsSummary;
        error?: string;
      };
      if (!res.ok || !json.chatInsights) {
        notify("err", json.error || "Failed to reset chat insights.");
      } else {
        setChatInsights(json.chatInsights);
        notify("ok", "Chat insights cleared.");
      }
    } catch {
      notify("err", "Network error resetting chat insights.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteChatLog(id: string) {
    if (!confirm("Delete this logged chatbot question?")) return;
    setBusy(true);
    try {
      const res = await fetch(
        `/api/admin/chat-insights?id=${encodeURIComponent(id)}`,
        { method: "DELETE" }
      );
      const json = (await res.json()) as {
        chatInsights?: ChatInsightsSummary;
        error?: string;
      };
      if (!res.ok || !json.chatInsights) {
        notify("err", json.error || "Failed to delete chat log.");
      } else {
        setChatInsights(json.chatInsights);
        notify("ok", "Chat log deleted.");
      }
    } catch {
      notify("err", "Network error deleting chat log.");
    } finally {
      setBusy(false);
    }
  }

  const tabs: { key: TabKey; label: string }[] = [
    { key: "projects", label: `Projects (${projects.length})` },
    { key: "profile", label: "Profile & CV" },
    { key: "capabilities", label: `Tech Matrix (${capabilities.length})` },
    { key: "experience", label: `Experience (${experiences.length})` },
    {
      key: "messages",
      label: unreadCount > 0 ? `Inbox (${unreadCount} new)` : `Inbox (${messages.length})`,
    },
    {
      key: "analytics",
      label: `Analytics (${analytics.totalPageViews + analytics.totalProjectViews})`,
    },
    {
      key: "chat",
      label: `Chat Insights (${chatInsights.totalChats})`,
    },
  ];

  return (
    <div className="min-h-screen bg-canvas py-5 sm:py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Top Bar */}
        <div className="mb-6 flex flex-col items-start justify-between gap-4 border-b-2 border-borderline pb-5 sm:mb-8 sm:flex-row sm:items-center sm:pb-6">
          <div className="min-w-0 w-full sm:w-auto">
            <Link
              href="/"
              className="mb-2 inline-flex min-h-[36px] items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-muted hover:text-ink"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>View Live Portfolio</span>
            </Link>
            <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">
              Portfolio Admin CMS
            </h1>
            <p className="mt-0.5 break-all font-mono text-xs text-muted">
              Signed in as {userEmail}
            </p>
          </div>

          <BrutalButton
            variant="secondary"
            size="sm"
            onClick={handleSignOut}
            className="w-full sm:w-auto shrink-0"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </BrutalButton>
        </div>

        {!schemaReady && (
          <BrutalCard className="mb-6 w-full min-w-0 border-2 p-4 font-mono text-xs">
            <div className="flex items-center gap-2 font-bold uppercase">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>Supabase Schema / Seed Pending</span>
            </div>
            <p className="mt-1 break-words text-muted">
              Some database tables were not found yet. Run{" "}
              <code>supabase/schema.sql</code> and <code>supabase/seed.sql</code>{" "}
              in your Supabase SQL Editor before editing live records.
            </p>
          </BrutalCard>
        )}

        {schemaReady &&
          (projects.length === 0 ||
            capabilities.length === 0 ||
            experiences.length === 0) && (
            <BrutalCard className="mb-6 flex w-full min-w-0 flex-col items-stretch justify-between gap-4 p-4 sm:flex-row sm:items-center">
              <div className="min-w-0 font-mono text-xs">
                <p className="font-bold uppercase text-ink">
                  Database Tables Are Partially Empty
                </p>
                <p className="mt-1 text-muted">
                  Import your initial Projects (Perpustakaan &amp; REPLASTE),
                  Tech Matrix (4 quadrants), and Experience (Bangkit &amp; UBS)
                  into Supabase without overwriting your Profile.
                </p>
              </div>
              <BrutalButton
                type="button"
                size="sm"
                disabled={busy}
                onClick={handleSeedInitialData}
                className="w-full shrink-0 sm:w-auto"
              >
                <Database className="h-4 w-4" />
                <span>{busy ? "Importing..." : "Import Initial Data"}</span>
              </BrutalButton>
            </BrutalCard>
          )}

        {notice && (
          <div
            role="status"
            className={`mb-6 break-words border-2 border-borderline p-3 font-mono text-xs font-bold ${
              notice.type === "ok"
                ? "bg-ink text-canvas"
                : "bg-surface text-ink"
            }`}
          >
            {notice.text}
          </div>
        )}

        {/* Tab Navigation (Scrollable Rail on Mobile) */}
        <div className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:mb-8 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`min-h-[40px] shrink-0 border-2 border-borderline px-3.5 py-2 font-mono text-xs font-bold uppercase tracking-wider transition-all sm:min-h-0 sm:px-4 ${
                activeTab === tab.key
                  ? "bg-ink text-canvas shadow-brutal-sm"
                  : "bg-surface text-ink hover:bg-ink/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB: PROFILE */}
        {activeTab === "profile" && (
          <BrutalCard className="w-full min-w-0 p-4 sm:p-6">
            <h2 className="mb-5 border-b-2 border-borderline pb-3 font-display text-lg font-bold sm:mb-6 sm:text-xl">
              Profile, Availability &amp; CV Settings
            </h2>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className={labelCls}>Full Name</label>
                  <input
                    className={inputCls}
                    required
                    value={profile.full_name}
                    onChange={(e) =>
                      setProfile({ ...profile, full_name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>Navbar Brand</label>
                  <input
                    className={inputCls}
                    required
                    value={profile.brand_name}
                    onChange={(e) =>
                      setProfile({ ...profile, brand_name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>CV Link (/cv or /cv.pdf or URL)</label>
                  <input
                    className={inputCls}
                    required
                    value={profile.cv_url}
                    onChange={(e) =>
                      setProfile({ ...profile, cv_url: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Profile Photo Upload & URL */}
              <div className="border-2 border-borderline bg-canvas p-4">
                <label className={labelCls}>
                  Profile Photo (Upload or paste URL / /images/avatar.jpg)
                </label>
                <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center">
                  {profile.avatar_url && (
                    <div className="h-20 w-20 shrink-0 overflow-hidden border-2 border-borderline bg-surface">
                      <img
                        src={profile.avatar_url}
                        alt="Profile preview"
                        className="h-full w-full object-cover object-top"
                      />
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <input
                      className={inputCls}
                      placeholder="https://... or /images/avatar.jpg"
                      value={profile.avatar_url ?? ""}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          avatar_url: e.target.value || null,
                        })
                      }
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="inline-flex cursor-pointer items-center gap-2 border-2 border-borderline bg-surface px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider text-ink hover:bg-ink hover:text-canvas">
                        <ImagePlus className="h-3.5 w-3.5" />
                        <span>
                          {uploadingTarget === "avatar"
                            ? "Uploading..."
                            : "Upload Photo"}
                        </span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/avif"
                          className="hidden"
                          disabled={uploadingTarget !== null}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            e.target.value = "";
                            handleImageUpload(file, "profile", (url) =>
                              setProfile((prev) => ({
                                ...prev,
                                avatar_url: url,
                              }))
                            );
                          }}
                        />
                      </label>
                      {profile.avatar_url && (
                        <button
                          type="button"
                          disabled={busy || uploadingTarget !== null}
                          onClick={handleRemoveProfilePhoto}
                          className="font-mono text-xs uppercase text-muted hover:text-ink disabled:opacity-50"
                        >
                          {busy ? "Removing..." : "Remove Photo"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Role (EN)</label>
                  <input
                    className={inputCls}
                    required
                    value={profile.role_en}
                    onChange={(e) =>
                      setProfile({ ...profile, role_en: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>Role (ID)</label>
                  <input
                    className={inputCls}
                    required
                    value={profile.role_id}
                    onChange={(e) =>
                      setProfile({ ...profile, role_id: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Availability Badge (EN)</label>
                  <input
                    className={inputCls}
                    required
                    value={profile.availability_status_en}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        availability_status_en: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>Availability Badge (ID)</label>
                  <input
                    className={inputCls}
                    required
                    value={profile.availability_status_id}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        availability_status_id: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <label className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase">
                <input
                  type="checkbox"
                  checked={profile.is_available}
                  onChange={(e) =>
                    setProfile({ ...profile, is_available: e.target.checked })
                  }
                  className="h-4 w-4 accent-ink"
                />
                <span>Show Availability Badge</span>
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Headline (EN)</label>
                  <input
                    className={inputCls}
                    required
                    value={profile.headline_en}
                    onChange={(e) =>
                      setProfile({ ...profile, headline_en: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>Headline (ID)</label>
                  <input
                    className={inputCls}
                    required
                    value={profile.headline_id}
                    onChange={(e) =>
                      setProfile({ ...profile, headline_id: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Bio (EN)</label>
                  <textarea
                    rows={4}
                    className={inputCls}
                    required
                    value={profile.bio_en}
                    onChange={(e) =>
                      setProfile({ ...profile, bio_en: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>Bio (ID)</label>
                  <textarea
                    rows={4}
                    className={inputCls}
                    required
                    value={profile.bio_id}
                    onChange={(e) =>
                      setProfile({ ...profile, bio_id: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className={labelCls}>Email</label>
                  <input
                    type="email"
                    className={inputCls}
                    required
                    value={profile.email}
                    onChange={(e) =>
                      setProfile({ ...profile, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>GitHub URL</label>
                  <input
                    type="url"
                    className={inputCls}
                    required
                    value={profile.github_url}
                    onChange={(e) =>
                      setProfile({ ...profile, github_url: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>LinkedIn URL</label>
                  <input
                    type="url"
                    className={inputCls}
                    required
                    value={profile.linkedin_url}
                    onChange={(e) =>
                      setProfile({ ...profile, linkedin_url: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Featured GitHub Repositories Picker (Max 3) */}
              <div className="border-2 border-borderline bg-canvas p-3.5 sm:p-4">
                <div className="mb-3 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
                  <div className="min-w-0">
                    <label className={labelCls}>
                      Featured GitHub Repositories (
                      {(profile.featured_github_repos ?? []).length}/3 selected)
                    </label>
                    <p className="font-mono text-[11px] text-muted">
                      Leave empty to automatically display your top 3 best scored
                      repositories, or pick up to 3 specific repos below.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {(profile.featured_github_repos ?? []).length > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          setProfile({ ...profile, featured_github_repos: [] })
                        }
                        className="min-h-[36px] font-mono text-xs uppercase text-muted hover:text-ink"
                      >
                        Reset to Auto Top 3
                      </button>
                    )}
                    <BrutalButton
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={loadingGithubRepos}
                      onClick={handleLoadGitHubRepos}
                      className="w-full sm:w-auto"
                    >
                      <RefreshCw
                        className={`h-3.5 w-3.5 ${loadingGithubRepos ? "animate-spin" : ""}`}
                      />
                      <span>
                        {loadingGithubRepos ? "Loading..." : "Load GitHub Repos"}
                      </span>
                    </BrutalButton>
                  </div>
                </div>

                {(profile.featured_github_repos ?? []).length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {(profile.featured_github_repos ?? []).map((name, idx) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => handleToggleFeaturedRepo(name)}
                        className="inline-flex max-w-full items-center gap-1.5 border-2 border-borderline bg-ink px-2.5 py-1.5 font-mono text-xs font-bold text-canvas"
                      >
                        <span>#{idx + 1}</span>
                        <span className="truncate">{name}</span>
                        <span>×</span>
                      </button>
                    ))}
                  </div>
                )}

                {githubReposLoaded && githubRepos.length > 0 && (
                  <div className="grid max-h-72 grid-cols-1 gap-2 overflow-y-auto pt-1 sm:grid-cols-2">
                    {githubRepos.map((repo) => {
                      const selectedList = profile.featured_github_repos ?? [];
                      const selectedIdx = selectedList.findIndex(
                        (n) => n.toLowerCase() === repo.name.toLowerCase()
                      );
                      const isSelected = selectedIdx !== -1;

                      return (
                        <button
                          key={repo.id}
                          type="button"
                          onClick={() => handleToggleFeaturedRepo(repo.name)}
                          className={`flex min-w-0 flex-col items-start gap-1 border-2 p-3 text-left transition-colors ${
                            isSelected
                              ? "border-borderline bg-ink text-canvas"
                              : "border-borderline/40 bg-surface text-ink hover:border-borderline"
                          }`}
                        >
                          <div className="flex w-full min-w-0 items-center justify-between gap-2 font-mono text-xs font-bold">
                            <span className="truncate">{repo.name}</span>
                            <span className="shrink-0 text-[10px] uppercase">
                              {isSelected
                                ? `#${selectedIdx + 1}`
                                : repo.language || "Code"}
                            </span>
                          </div>
                          {repo.description && (
                            <p
                              className={`line-clamp-2 break-words text-xs ${
                                isSelected ? "text-canvas/80" : "text-muted"
                              }`}
                            >
                              {repo.description}
                            </p>
                          )}
                          <span
                            className={`font-mono text-[10px] ${
                              isSelected ? "text-canvas/70" : "text-muted"
                            }`}
                          >
                            ★ {repo.stars} · Updated {repo.pushedAt}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <BrutalButton type="submit" disabled={busy} className="w-full sm:w-auto">
                <Save className="h-4 w-4" />
                <span>{busy ? "Saving..." : "Save Profile"}</span>
              </BrutalButton>
            </form>
          </BrutalCard>
        )}

        {/* TAB: PROJECTS */}
        {activeTab === "projects" && (
          <div className="space-y-5 sm:space-y-6">
            <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
              <h2 className="font-display text-lg font-bold sm:text-xl">
                Projects &amp; Case Studies
              </h2>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                <BrutalButton
                  variant="secondary"
                  size="sm"
                  disabled={busy}
                  onClick={handleSeedInitialData}
                  className="w-full sm:w-auto"
                >
                  <Database className="h-4 w-4" />
                  <span>Sync Seed</span>
                </BrutalButton>
                <BrutalButton
                  size="sm"
                  onClick={startNewProject}
                  className="w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Project</span>
                </BrutalButton>
              </div>
            </div>

            {editingProjectId && (
              <BrutalCard className="w-full min-w-0 p-4 sm:p-6">
                <form onSubmit={handleSaveProject} className="space-y-4">
                  <div className="flex items-center justify-between border-b-2 border-borderline pb-3">
                    <h3 className="font-display text-lg font-bold">
                      {editingProjectId === "new" ? "Create Project" : "Edit Project"}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setEditingProjectId(null)}
                      className="font-mono text-xs uppercase text-muted hover:text-ink"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-4">
                    <div>
                      <label className={labelCls}>Slug (URL)</label>
                      <input
                        className={inputCls}
                        required
                        placeholder="my-project-slug"
                        value={projectForm.slug}
                        onChange={(e) =>
                          setProjectForm({ ...projectForm, slug: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Category</label>
                      <input
                        className={inputCls}
                        required
                        value={projectForm.category}
                        onChange={(e) =>
                          setProjectForm({ ...projectForm, category: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Year</label>
                      <input
                        className={inputCls}
                        required
                        value={projectForm.year}
                        onChange={(e) =>
                          setProjectForm({ ...projectForm, year: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Sort Order</label>
                      <input
                        type="number"
                        className={inputCls}
                        value={projectForm.sort_order}
                        onChange={(e) =>
                          setProjectForm({
                            ...projectForm,
                            sort_order: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelCls}>Title (EN)</label>
                      <input
                        className={inputCls}
                        required
                        value={projectForm.title_en}
                        onChange={(e) =>
                          setProjectForm({ ...projectForm, title_en: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Title (ID)</label>
                      <input
                        className={inputCls}
                        required
                        value={projectForm.title_id}
                        onChange={(e) =>
                          setProjectForm({ ...projectForm, title_id: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelCls}>Role (EN)</label>
                      <input
                        className={inputCls}
                        required
                        value={projectForm.role_en}
                        onChange={(e) =>
                          setProjectForm({ ...projectForm, role_en: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Role (ID)</label>
                      <input
                        className={inputCls}
                        required
                        value={projectForm.role_id}
                        onChange={(e) =>
                          setProjectForm({ ...projectForm, role_id: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Tech Stack (comma separated)</label>
                    <input
                      className={inputCls}
                      required
                      value={projectStackInput}
                      onChange={(e) => setProjectStackInput(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelCls}>Summary (EN)</label>
                      <textarea
                        rows={3}
                        className={inputCls}
                        required
                        value={projectForm.summary_en}
                        onChange={(e) =>
                          setProjectForm({
                            ...projectForm,
                            summary_en: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Summary (ID)</label>
                      <textarea
                        rows={3}
                        className={inputCls}
                        required
                        value={projectForm.summary_id}
                        onChange={(e) =>
                          setProjectForm({
                            ...projectForm,
                            summary_id: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelCls}>Problem (EN)</label>
                      <textarea
                        rows={3}
                        className={inputCls}
                        required
                        value={projectForm.problem_en}
                        onChange={(e) =>
                          setProjectForm({
                            ...projectForm,
                            problem_en: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Problem (ID)</label>
                      <textarea
                        rows={3}
                        className={inputCls}
                        required
                        value={projectForm.problem_id}
                        onChange={(e) =>
                          setProjectForm({
                            ...projectForm,
                            problem_id: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelCls}>Architecture (EN)</label>
                      <textarea
                        rows={3}
                        className={inputCls}
                        required
                        value={projectForm.architecture_en}
                        onChange={(e) =>
                          setProjectForm({
                            ...projectForm,
                            architecture_en: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Architecture (ID)</label>
                      <textarea
                        rows={3}
                        className={inputCls}
                        required
                        value={projectForm.architecture_id}
                        onChange={(e) =>
                          setProjectForm({
                            ...projectForm,
                            architecture_id: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelCls}>Challenges (EN)</label>
                      <textarea
                        rows={3}
                        className={inputCls}
                        required
                        value={projectForm.challenges_en}
                        onChange={(e) =>
                          setProjectForm({
                            ...projectForm,
                            challenges_en: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Challenges (ID)</label>
                      <textarea
                        rows={3}
                        className={inputCls}
                        required
                        value={projectForm.challenges_id}
                        onChange={(e) =>
                          setProjectForm({
                            ...projectForm,
                            challenges_id: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelCls}>Impact (EN)</label>
                      <textarea
                        rows={3}
                        className={inputCls}
                        required
                        value={projectForm.impact_en}
                        onChange={(e) =>
                          setProjectForm({
                            ...projectForm,
                            impact_en: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Impact (ID)</label>
                      <textarea
                        rows={3}
                        className={inputCls}
                        required
                        value={projectForm.impact_id}
                        onChange={(e) =>
                          setProjectForm({
                            ...projectForm,
                            impact_id: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelCls}>GitHub Repo URL (optional)</label>
                      <input
                        className={inputCls}
                        value={projectForm.repo_url ?? ""}
                        onChange={(e) =>
                          setProjectForm({
                            ...projectForm,
                            repo_url: e.target.value || null,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Live Demo URL (optional)</label>
                      <input
                        className={inputCls}
                        value={projectForm.live_url ?? ""}
                        onChange={(e) =>
                          setProjectForm({
                            ...projectForm,
                            live_url: e.target.value || null,
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* Project Thumbnail Upload & URL */}
                  <div className="border-2 border-borderline bg-canvas p-3.5 sm:p-4">
                    <label className={labelCls}>
                      Project Thumbnail (16:9 recommended — Upload or paste URL / /images/...)
                    </label>
                    <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                      {projectForm.cover_image_url && (
                        <div className="aspect-[16/9] w-full shrink-0 overflow-hidden border-2 border-borderline bg-surface sm:w-36">
                          <img
                            src={projectForm.cover_image_url}
                            alt="Thumbnail preview"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      <div className="min-w-0 flex-1 space-y-2">
                        <input
                          className={inputCls}
                          placeholder="https://... or /images/project-thumb.png"
                          value={projectForm.cover_image_url ?? ""}
                          onChange={(e) =>
                            setProjectForm({
                              ...projectForm,
                              cover_image_url: e.target.value || null,
                            })
                          }
                        />
                        <div className="flex flex-wrap items-center gap-3">
                          <label className="inline-flex min-h-[40px] cursor-pointer items-center gap-2 border-2 border-borderline bg-surface px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider text-ink hover:bg-ink hover:text-canvas sm:min-h-0">
                            <ImagePlus className="h-3.5 w-3.5" />
                            <span>
                              {uploadingTarget === "project"
                                ? "Uploading..."
                                : "Upload Thumbnail"}
                            </span>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp,image/avif"
                              className="hidden"
                              disabled={uploadingTarget !== null}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                e.target.value = "";
                                handleImageUpload(file, "projects", (url) =>
                                  setProjectForm((prev) => ({
                                    ...prev,
                                    cover_image_url: url,
                                  }))
                                );
                              }}
                            />
                          </label>
                          {projectForm.cover_image_url && (
                            <button
                              type="button"
                              disabled={busy || uploadingTarget !== null}
                              onClick={handleRemoveProjectThumbnail}
                              className="min-h-[36px] font-mono text-xs uppercase text-muted hover:text-ink disabled:opacity-50"
                            >
                              {busy ? "Removing..." : "Remove Thumbnail"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Documentation & Gallery Photos */}
                  <div className="border-2 border-borderline bg-canvas p-3.5 sm:p-4">
                    <div className="mb-3 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
                      <div className="min-w-0">
                        <label className={labelCls}>
                          Documentation &amp; Gallery Photos ({(projectForm.gallery_images ?? []).length})
                        </label>
                        <p className="font-mono text-[11px] text-muted">
                          Screenshots, architecture diagrams, demo photos, etc. Shown in Case Study with click-to-zoom lightbox.
                        </p>
                      </div>
                      <label className="inline-flex min-h-[40px] cursor-pointer items-center justify-center gap-2 border-2 border-borderline bg-surface px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider text-ink hover:bg-ink hover:text-canvas sm:min-h-0 sm:shrink-0">
                        <ImagePlus className="h-3.5 w-3.5" />
                        <span>
                          {uploadingTarget === "gallery"
                            ? "Uploading..."
                            : "Upload Photos (Multi)"}
                        </span>
                        <input
                          type="file"
                          multiple
                          accept="image/jpeg,image/png,image/webp,image/avif"
                          className="hidden"
                          disabled={uploadingTarget !== null}
                          onChange={(e) => {
                            const files = e.target.files;
                            handleGalleryFilesUpload(files);
                            e.target.value = "";
                          }}
                        />
                      </label>
                    </div>

                    {/* Optional add by URL */}
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row">
                      <input
                        className={inputCls}
                        placeholder="Or paste photo URL / /images/doc-1.png"
                        value={galleryUrlDraft}
                        onChange={(e) => setGalleryUrlDraft(e.target.value)}
                      />
                      <BrutalButton
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={handleAddGalleryUrl}
                        className="w-full shrink-0 sm:w-auto"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add URL</span>
                      </BrutalButton>
                    </div>

                    {(projectForm.gallery_images ?? []).length === 0 ? (
                      <p className="border border-dashed border-borderline/50 p-4 text-center font-mono text-xs text-muted">
                        No documentation photos added yet.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {(projectForm.gallery_images ?? []).map((item, idx) => (
                          <div
                            key={`${item.url}-${idx}`}
                            className="flex flex-col gap-3 border-2 border-borderline bg-surface p-3 sm:flex-row sm:items-start"
                          >
                            <div className="aspect-[16/10] w-full shrink-0 overflow-hidden border border-borderline bg-canvas sm:w-32">
                              <img
                                src={item.url}
                                alt={`Gallery ${idx + 1}`}
                                className="h-full w-full object-cover"
                              />
                            </div>

                            <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2">
                              <div>
                                <label className={labelCls}>
                                  Caption EN (optional)
                                </label>
                                <input
                                  className={inputCls}
                                  placeholder="e.g. Admin circulation dashboard"
                                  value={item.caption_en}
                                  onChange={(e) =>
                                    handleUpdateGalleryCaption(
                                      idx,
                                      "caption_en",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                              <div>
                                <label className={labelCls}>
                                  Caption ID (optional)
                                </label>
                                <input
                                  className={inputCls}
                                  placeholder="mis. Tampilan dashboard sirkulasi"
                                  value={item.caption_id}
                                  onChange={(e) =>
                                    handleUpdateGalleryCaption(
                                      idx,
                                      "caption_id",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 sm:flex-col sm:gap-1">
                              <button
                                type="button"
                                title="Move up"
                                disabled={idx === 0}
                                onClick={() => handleMoveGalleryItem(idx, -1)}
                                className="inline-flex h-10 w-10 items-center justify-center border border-borderline bg-canvas text-ink disabled:opacity-30 sm:h-7 sm:w-7"
                              >
                                <ArrowUp className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                              </button>
                              <button
                                type="button"
                                title="Move down"
                                disabled={
                                  idx ===
                                  (projectForm.gallery_images ?? []).length - 1
                                }
                                onClick={() => handleMoveGalleryItem(idx, 1)}
                                className="inline-flex h-10 w-10 items-center justify-center border border-borderline bg-canvas text-ink disabled:opacity-30 sm:h-7 sm:w-7"
                              >
                                <ArrowDown className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                              </button>
                              <button
                                type="button"
                                title="Remove photo"
                                disabled={busy || uploadingTarget !== null}
                                onClick={() => handleRemoveGalleryItem(idx)}
                                className="inline-flex h-10 w-10 items-center justify-center border border-borderline bg-canvas text-ink hover:bg-ink hover:text-canvas disabled:opacity-30 sm:h-7 sm:w-7"
                              >
                                <Trash2 className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-6 font-mono text-xs font-bold uppercase">
                    <label className="inline-flex min-h-[36px] items-center gap-2">
                      <input
                        type="checkbox"
                        checked={projectForm.published}
                        onChange={(e) =>
                          setProjectForm({
                            ...projectForm,
                            published: e.target.checked,
                          })
                        }
                        className="h-4 w-4 accent-ink"
                      />
                      <span>Published</span>
                    </label>
                    <label className="inline-flex min-h-[36px] items-center gap-2">
                      <input
                        type="checkbox"
                        checked={projectForm.featured}
                        onChange={(e) =>
                          setProjectForm({
                            ...projectForm,
                            featured: e.target.checked,
                          })
                        }
                        className="h-4 w-4 accent-ink"
                      />
                      <span>Featured</span>
                    </label>
                  </div>

                  <BrutalButton type="submit" disabled={busy} className="w-full sm:w-auto">
                    <Save className="h-4 w-4" />
                    <span>{busy ? "Saving..." : "Save Project"}</span>
                  </BrutalButton>
                </form>
              </BrutalCard>
            )}

            <div className="grid grid-cols-1 gap-4">
              {projects.map((p) => (
                <BrutalCard
                  key={p.id}
                  className="flex w-full min-w-0 flex-col items-stretch justify-between gap-4 p-4 sm:flex-row sm:items-center sm:p-5"
                >
                  <div className="min-w-0">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <Badge variant={p.published ? "solid" : "outline"}>
                        {p.published ? "Published" : "Draft"}
                      </Badge>
                      <Badge variant="outline">{p.year}</Badge>
                      <span className="break-all font-mono text-xs text-muted">
                        /{p.slug}
                      </span>
                    </div>
                    <h3 className="break-words font-display text-base font-bold sm:text-lg">
                      {p.title_en}
                    </h3>
                    <p className="mt-0.5 break-words font-mono text-xs text-muted">
                      {p.tech_stack.join(" · ")}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center justify-end gap-2 border-t border-borderline/20 pt-3 sm:border-t-0 sm:pt-0">
                    <BrutalButton
                      variant="secondary"
                      size="sm"
                      onClick={() => startEditProject(p)}
                      className="flex-1 sm:flex-none"
                    >
                      Edit
                    </BrutalButton>
                    <BrutalButton
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteProject(p.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </BrutalButton>
                  </div>
                </BrutalCard>
              ))}
            </div>
          </div>
        )}

        {/* TAB: CAPABILITIES */}
        {activeTab === "capabilities" && (
          <div className="space-y-5 sm:space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-lg font-bold sm:text-xl">
                Tech Stack Quadrants
              </h2>
              <BrutalButton
                size="sm"
                onClick={startNewCap}
                className="w-full sm:w-auto"
              >
                <Plus className="h-4 w-4" />
                <span>New Quadrant</span>
              </BrutalButton>
            </div>

            {editingCapId && (
              <BrutalCard className="w-full min-w-0 p-4 sm:p-6">
                <form onSubmit={handleSaveCap} className="space-y-4">
                  <div className="flex items-center justify-between border-b-2 border-borderline pb-3">
                    <h3 className="font-display text-lg font-bold">
                      {editingCapId === "new" ? "Add Quadrant" : "Edit Quadrant"}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setEditingCapId(null)}
                      className="font-mono text-xs uppercase text-muted hover:text-ink"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <label className={labelCls}>Key (frontend/backend/database/tools)</label>
                      <input
                        className={inputCls}
                        required
                        value={capForm.category_key}
                        onChange={(e) =>
                          setCapForm({ ...capForm, category_key: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Title (EN)</label>
                      <input
                        className={inputCls}
                        required
                        value={capForm.title_en}
                        onChange={(e) =>
                          setCapForm({ ...capForm, title_en: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Title (ID)</label>
                      <input
                        className={inputCls}
                        required
                        value={capForm.title_id}
                        onChange={(e) =>
                          setCapForm({ ...capForm, title_id: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelCls}>Description (EN)</label>
                      <input
                        className={inputCls}
                        required
                        value={capForm.description_en}
                        onChange={(e) =>
                          setCapForm({
                            ...capForm,
                            description_en: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Description (ID)</label>
                      <input
                        className={inputCls}
                        required
                        value={capForm.description_id}
                        onChange={(e) =>
                          setCapForm({
                            ...capForm,
                            description_id: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-4">
                    <div className="sm:col-span-3">
                      <label className={labelCls}>Items (comma separated)</label>
                      <input
                        className={inputCls}
                        required
                        value={capItemsInput}
                        onChange={(e) => setCapItemsInput(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Sort Order</label>
                      <input
                        type="number"
                        className={inputCls}
                        value={capForm.sort_order}
                        onChange={(e) =>
                          setCapForm({
                            ...capForm,
                            sort_order: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>

                  <BrutalButton type="submit" disabled={busy} className="w-full sm:w-auto">
                    <Save className="h-4 w-4" />
                    <span>Save Quadrant</span>
                  </BrutalButton>
                </form>
              </BrutalCard>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {capabilities.map((cap) => (
                <BrutalCard key={cap.id} className="w-full min-w-0 p-4 sm:p-5">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <h3 className="min-w-0 break-words font-display text-base font-bold sm:text-lg">
                      {cap.title_en}
                    </h3>
                    <div className="flex shrink-0 gap-2">
                      <BrutalButton
                        size="sm"
                        variant="secondary"
                        onClick={() => startEditCap(cap)}
                      >
                        Edit
                      </BrutalButton>
                      <BrutalButton
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteCap(cap.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </BrutalButton>
                    </div>
                  </div>
                  <p className="break-words font-mono text-xs text-muted">
                    {cap.items.join(" · ")}
                  </p>
                </BrutalCard>
              ))}
            </div>
          </div>
        )}

        {/* TAB: EXPERIENCE */}
        {activeTab === "experience" && (
          <div className="space-y-5 sm:space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-lg font-bold sm:text-xl">
                Experience &amp; Education
              </h2>
              <BrutalButton
                size="sm"
                onClick={startNewExp}
                className="w-full sm:w-auto"
              >
                <Plus className="h-4 w-4" />
                <span>Add Entry</span>
              </BrutalButton>
            </div>

            {editingExpId && (
              <BrutalCard className="w-full min-w-0 p-4 sm:p-6">
                <form onSubmit={handleSaveExp} className="space-y-4">
                  <div className="flex items-center justify-between border-b-2 border-borderline pb-3">
                    <h3 className="font-display text-lg font-bold">
                      {editingExpId === "new" ? "Add Experience" : "Edit Experience"}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setEditingExpId(null)}
                      className="font-mono text-xs uppercase text-muted hover:text-ink"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <label className={labelCls}>Organization</label>
                      <input
                        className={inputCls}
                        required
                        value={expForm.organization}
                        onChange={(e) =>
                          setExpForm({ ...expForm, organization: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Period</label>
                      <input
                        className={inputCls}
                        required
                        value={expForm.period}
                        onChange={(e) =>
                          setExpForm({ ...expForm, period: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Location</label>
                      <input
                        className={inputCls}
                        required
                        value={expForm.location}
                        onChange={(e) =>
                          setExpForm({ ...expForm, location: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelCls}>Role (EN)</label>
                      <input
                        className={inputCls}
                        required
                        value={expForm.role_en}
                        onChange={(e) =>
                          setExpForm({ ...expForm, role_en: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Role (ID)</label>
                      <input
                        className={inputCls}
                        required
                        value={expForm.role_id}
                        onChange={(e) =>
                          setExpForm({ ...expForm, role_id: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelCls}>Summary (EN)</label>
                      <textarea
                        rows={3}
                        className={inputCls}
                        required
                        value={expForm.summary_en}
                        onChange={(e) =>
                          setExpForm({ ...expForm, summary_en: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Summary (ID)</label>
                      <textarea
                        rows={3}
                        className={inputCls}
                        required
                        value={expForm.summary_id}
                        onChange={(e) =>
                          setExpForm({ ...expForm, summary_id: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelCls}>Highlights EN (one per line)</label>
                      <textarea
                        rows={3}
                        className={inputCls}
                        value={expHighlightsEn}
                        onChange={(e) => setExpHighlightsEn(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Highlights ID (one per line)</label>
                      <textarea
                        rows={3}
                        className={inputCls}
                        value={expHighlightsId}
                        onChange={(e) => setExpHighlightsId(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-6">
                    <label className="inline-flex min-h-[36px] items-center gap-2 font-mono text-xs font-bold uppercase">
                      <input
                        type="checkbox"
                        checked={expForm.published}
                        onChange={(e) =>
                          setExpForm({ ...expForm, published: e.target.checked })
                        }
                        className="h-4 w-4 accent-ink"
                      />
                      <span>Published</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <label className="font-mono text-xs font-bold uppercase">
                        Order
                      </label>
                      <input
                        type="number"
                        className="w-20 border-2 border-borderline bg-canvas px-2 py-1.5 text-base sm:text-sm"
                        value={expForm.sort_order}
                        onChange={(e) =>
                          setExpForm({
                            ...expForm,
                            sort_order: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>

                  <BrutalButton type="submit" disabled={busy} className="w-full sm:w-auto">
                    <Save className="h-4 w-4" />
                    <span>Save Experience</span>
                  </BrutalButton>
                </form>
              </BrutalCard>
            )}

            <div className="grid grid-cols-1 gap-4">
              {experiences.map((exp) => (
                <BrutalCard
                  key={exp.id}
                  className="flex w-full min-w-0 flex-col items-stretch justify-between gap-4 p-4 sm:flex-row sm:items-center sm:p-5"
                >
                  <div className="min-w-0">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <Badge variant={exp.published ? "solid" : "outline"}>
                        {exp.published ? "Published" : "Hidden"}
                      </Badge>
                      <span className="font-mono text-xs text-muted">
                        {exp.period}
                      </span>
                    </div>
                    <h3 className="break-words font-display text-base font-bold sm:text-lg">
                      {exp.organization}
                    </h3>
                    <p className="break-words text-sm text-muted">{exp.role_en}</p>
                  </div>
                  <div className="flex shrink-0 items-center justify-end gap-2 border-t border-borderline/20 pt-3 sm:border-t-0 sm:pt-0">
                    <BrutalButton
                      size="sm"
                      variant="secondary"
                      onClick={() => startEditExp(exp)}
                      className="flex-1 sm:flex-none"
                    >
                      Edit
                    </BrutalButton>
                    <BrutalButton
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteExp(exp.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </BrutalButton>
                  </div>
                </BrutalCard>
              ))}
            </div>
          </div>
        )}

        {/* TAB: MESSAGES INBOX */}
        {activeTab === "messages" && (
          <div className="space-y-4">
            <h2 className="font-display text-lg font-bold sm:text-xl">
              Contact Inbox
            </h2>
            {messages.length === 0 ? (
              <BrutalCard className="w-full min-w-0 p-6 text-center font-mono text-sm text-muted sm:p-8">
                No contact messages yet.
              </BrutalCard>
            ) : (
              messages.map((msg) => (
                <BrutalCard key={msg.id} className="w-full min-w-0 p-4 sm:p-5">
                  <div className="mb-3 flex flex-col items-start justify-between gap-2 border-b-2 border-borderline pb-3 sm:flex-row sm:items-center">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <Badge variant={msg.is_read ? "outline" : "solid"}>
                        {msg.is_read ? "Read" : "Unread"}
                      </Badge>
                      <span className="break-words font-display font-bold text-ink">
                        {msg.subject}
                      </span>
                    </div>
                    <span className="shrink-0 font-mono text-[11px] text-muted sm:text-xs">
                      {new Date(msg.created_at).toLocaleString()}
                    </span>
                  </div>

                  <p className="mb-2 flex items-start gap-2 break-all font-mono text-xs text-muted">
                    <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>
                      {msg.name} ({msg.email})
                    </span>
                  </p>
                  <p className="whitespace-pre-line break-words text-sm leading-relaxed text-ink">
                    {msg.message}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <BrutalButton
                      size="sm"
                      variant="secondary"
                      onClick={() => handleToggleRead(msg)}
                      className="flex-1 sm:flex-none"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>{msg.is_read ? "Mark Unread" : "Mark Read"}</span>
                    </BrutalButton>
                    <BrutalButton
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteMessage(msg.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </BrutalButton>
                  </div>
                </BrutalCard>
              ))
            )}
          </div>
        )}

        {/* TAB: ANALYTICS */}
        {activeTab === "analytics" && (
          <div className="space-y-5 sm:space-y-6">
            <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
              <div className="min-w-0">
                <h2 className="font-display text-lg font-bold sm:text-xl">
                  Portfolio Analytics
                </h2>
                <p className="font-mono text-xs text-muted">
                  First-party visitor metrics stored in Supabase (no third-party cookies).
                </p>
              </div>
              <div className="flex items-center gap-2">
                <BrutalButton
                  variant="secondary"
                  size="sm"
                  disabled={busy}
                  onClick={handleRefreshAnalytics}
                  className="flex-1 sm:flex-none"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Refresh</span>
                </BrutalButton>
                {analytics.tableReady && (
                  <BrutalButton
                    variant="ghost"
                    size="sm"
                    disabled={busy}
                    onClick={handleResetAnalytics}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Reset</span>
                  </BrutalButton>
                )}
              </div>
            </div>

            {!analytics.tableReady ? (
              <BrutalCard className="w-full min-w-0 p-4 font-mono text-xs sm:p-6">
                <div className="flex items-center gap-2 font-bold uppercase text-ink">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>Analytics Table Setup Needed</span>
                </div>
                <p className="mt-2 break-words leading-relaxed text-muted">
                  Run the <code>analytics_events</code> section from{" "}
                  <code>supabase/schema.sql</code> in Supabase SQL Editor, then click
                  Refresh above to start recording page views, case study opens,
                  and CV downloads.
                </p>
              </BrutalCard>
            ) : (
              <>
                {/* 4 KPI Cards (2x2 Grid on Mobile) */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                  {[
                    {
                      label: "TOTAL PAGE VIEWS",
                      value: analytics.totalPageViews,
                      note: "Landing page visits",
                    },
                    {
                      label: "CASE STUDY VIEWS",
                      value: analytics.totalProjectViews,
                      note: "Project detail opens",
                    },
                    {
                      label: "CV DOWNLOADS",
                      value: analytics.totalCvDownloads,
                      note: "Button & PDF print clicks",
                    },
                    {
                      label: "LAST 7 DAYS",
                      value: analytics.viewsLast7Days,
                      note: "Combined views (7d)",
                    },
                  ].map((kpi) => (
                    <BrutalCard key={kpi.label} className="w-full min-w-0 p-3.5 sm:p-5">
                      <div className="mb-2 flex items-start justify-between gap-1">
                        <span className="font-mono text-[10px] font-bold uppercase leading-tight tracking-wider text-muted sm:text-[11px]">
                          {kpi.label}
                        </span>
                        <BarChart3 className="h-3.5 w-3.5 shrink-0 text-muted sm:h-4 sm:w-4" />
                      </div>
                      <p className="font-display text-2xl font-bold text-ink sm:text-3xl">
                        {kpi.value}
                      </p>
                      <p className="mt-1 font-mono text-[10px] leading-snug text-muted sm:text-[11px]">
                        {kpi.note}
                      </p>
                    </BrutalCard>
                  ))}
                </div>

                {/* 14-Day Traffic Bar Chart */}
                <BrutalCard className="w-full min-w-0 max-w-full p-4 sm:p-6">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b-2 border-borderline pb-3 sm:mb-5">
                    <h3 className="font-display text-base font-bold text-ink sm:text-lg">
                      14-Day Activity Trend
                    </h3>
                    <div className="flex items-center gap-3 font-mono text-[10px] uppercase text-muted sm:gap-4 sm:text-[11px]">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="inline-block h-2.5 w-2.5 bg-ink" />
                        Views
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="inline-block h-2.5 w-2.5 border border-borderline bg-canvas" />
                        CV Clicks
                      </span>
                    </div>
                  </div>

                  {(() => {
                    const maxDaily = Math.max(
                      1,
                      ...analytics.dailyTrend.map((d) => d.views + d.cvDownloads)
                    );
                    return (
                      <div className="w-full max-w-full overflow-x-auto pb-1">
                        <div className="grid min-w-[520px] grid-cols-[repeat(14,minmax(0,1fr))] gap-2">
                          {analytics.dailyTrend.map((day) => {
                            const total = day.views + day.cvDownloads;
                            const heightPct = Math.max(
                              total > 0 ? 12 : 4,
                              Math.round((total / maxDaily) * 100)
                            );
                            return (
                              <div
                                key={day.date}
                                title={`${day.date}: ${day.views} views, ${day.cvDownloads} CV clicks`}
                                className="flex flex-col items-center gap-1.5"
                              >
                                <span className="font-mono text-[10px] font-bold text-muted">
                                  {total > 0 ? total : "·"}
                                </span>
                                <div className="flex h-28 w-full items-end border border-borderline/30 bg-canvas p-1">
                                  <div
                                    style={{ height: `${heightPct}%` }}
                                    className={`w-full transition-all ${
                                      total > 0 ? "bg-ink" : "bg-borderline/20"
                                    }`}
                                  />
                                </div>
                                <span className="font-mono text-[9px] text-muted">
                                  {day.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-muted sm:hidden">
                    ← Swipe chart →
                  </p>
                </BrutalCard>

                {/* Breakdowns */}
                <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2">
                  {/* Top Viewed Projects */}
                  <BrutalCard className="w-full min-w-0 p-4 sm:p-6">
                    <h3 className="mb-4 border-b-2 border-borderline pb-3 font-display text-base font-bold sm:text-lg">
                      Top Viewed Projects
                    </h3>
                    {analytics.topProjects.length === 0 ? (
                      <p className="font-mono text-xs text-muted">
                        No project case study views recorded yet.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {(() => {
                          const maxProj = Math.max(
                            1,
                            analytics.topProjects[0]?.views ?? 1
                          );
                          return analytics.topProjects.map((item) => (
                            <div key={item.slug} className="space-y-1">
                              <div className="flex min-w-0 items-center justify-between gap-2 font-mono text-xs">
                                <span className="truncate font-bold text-ink">
                                  {item.title}
                                </span>
                                <span className="shrink-0 text-muted">
                                  {item.views} views
                                </span>
                              </div>
                              <div className="h-2.5 w-full border border-borderline bg-canvas">
                                <div
                                  style={{
                                    width: `${Math.round((item.views / maxProj) * 100)}%`,
                                  }}
                                  className="h-full bg-ink"
                                />
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                    )}
                  </BrutalCard>

                  {/* Referrers & Devices */}
                  <BrutalCard className="w-full min-w-0 p-4 sm:p-6">
                    <h3 className="mb-4 border-b-2 border-borderline pb-3 font-display text-base font-bold sm:text-lg">
                      Referrers &amp; Devices
                    </h3>

                    <div className="mb-5 grid grid-cols-3 gap-2">
                      {(
                        [
                          ["Desktop", analytics.deviceBreakdown.desktop],
                          ["Mobile", analytics.deviceBreakdown.mobile],
                          ["Tablet", analytics.deviceBreakdown.tablet],
                        ] as const
                      ).map(([label, count]) => (
                        <div
                          key={label}
                          className="min-w-0 border-2 border-borderline bg-canvas p-2.5 text-center sm:p-3"
                        >
                          <p className="truncate font-mono text-[10px] uppercase tracking-wider text-muted">
                            {label}
                          </p>
                          <p className="mt-1 font-display text-lg font-bold text-ink sm:text-xl">
                            {count}
                          </p>
                        </div>
                      ))}
                    </div>

                    <p className="mb-2 font-mono text-[11px] font-bold uppercase tracking-wider text-muted">
                      TOP REFERRERS
                    </p>
                    {analytics.topReferrers.length === 0 ? (
                      <p className="font-mono text-xs text-muted">
                        No referrer data recorded yet.
                      </p>
                    ) : (
                      <ul className="space-y-1.5 font-mono text-xs">
                        {analytics.topReferrers.map((ref) => (
                          <li
                            key={ref.host}
                            className="flex min-w-0 items-center justify-between gap-2 border-b border-borderline/20 pb-1"
                          >
                            <span className="truncate text-ink">{ref.host}</span>
                            <span className="shrink-0 font-bold text-muted">
                              {ref.count}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </BrutalCard>
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB: CHAT INSIGHTS */}
        {activeTab === "chat" && (
          <ChatInsightsTab
            chatInsights={chatInsights}
            busy={busy}
            onRefresh={handleRefreshChatInsights}
            onResetAll={handleResetChatInsights}
            onDeleteOne={handleDeleteChatLog}
          />
        )}
      </div>
    </div>
  );
}
