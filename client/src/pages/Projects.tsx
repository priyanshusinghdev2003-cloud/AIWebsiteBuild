import { Link, useNavigate, useParams } from "react-router-dom";
import SoftBackdrop from "../components/SoftBackdrop";
import { useEffect, useRef, useState } from "react";
import type { Project } from "../types";
import {
  ArrowBigDownDashIcon,
  EyeIcon,
  EyeOffIcon,
  FullscreenIcon,
  LaptopIcon,
  Loader2Icon,
  MessageSquareIcon,
  Save,
  SaveIcon,
  SmartphoneIcon,
  TabletIcon,
  XIcon,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import ProjectPreview, {
  type ProjectPreviewRef,
} from "../components/ProjectPreview";
import { toast } from "sonner";
import api from "@/configs/axios";
import { authClient } from "@/lib/auth-client";

function Projects() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(true);
  const [device, setDevice] = useState<"phone" | "tablet" | "desktop">(
    "desktop"
  );

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const previewRef = useRef<ProjectPreviewRef>(null);

  const fetchProject = async () => {
    try {
      const { data } = await api.get(`/user/project/${projectId}`);
      setProject(data.project);
      setIsGenerating(data.project.current_code ? false : true);
      setLoading(false);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Error fetching project:"
      );
      setLoading(false);
    }
  };

  const togglePublish = async () => {
    if (!previewRef.current) return;
    const code = previewRef.current.getCode();
    if (!code) return;
    try {
      const { data } = await api.get(`/user/publish-toggle/${projectId}`);
      toast.success(data?.message);
      setProject((prev) =>
        prev ? { ...prev, published: !prev.isPublished } : null
      );
    } catch (error: any) {
      toast.error(
        error?.message ||
          error?.response?.data?.message ||
          "Something went wrong"
      );
    }
  };
  const downLoadCode = async () => {
    const code = previewRef.current?.getCode() || project?.current_code;
    if (!code) {
      if (isGenerating) {
        return;
      }
      return;
    }
    const element = document.createElement("a");
    const file = new Blob([code], { type: "text/html" });
    element.href = URL.createObjectURL(file);
    element.download = "index.html";
    document.body.appendChild(element);
    element.click();
  };
  const saveProject = async () => {
    if (!previewRef.current) return;
    const code = previewRef.current.getCode();
    if (!code) return;
    try {
      setIsSaving(true);
      const { data } = await api.put(`/project/save/${projectId}`, { code });
      toast.success(data?.message);
      setIsSaving(false);
    } catch (error: any) {
      toast.error(
        error?.message ||
          error?.response?.data?.message ||
          "Something went wrong"
      );
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchProject();
    } else if (!isPending && !session?.user) {
      navigate("/");
      toast.error("You are not logged in");
    }
  }, [session?.user]);

  useEffect(() => {
    if (project && !project?.current_code) {
      const intervalId = setInterval(() => {
        fetchProject();
      }, 10000);
      return () => clearInterval(intervalId);
    }
  }, [project]);
  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center h-screen">
          <Loader2Icon className="animate-spin size-7 text-violet-200" />
        </div>
      </>
    );
  }
  return project ? (
    <>
      <div className="flex flex-col h-screen w-full bg-gray-900 text-white">
        {/* builder navbar */}
        <div className="flex max-sm:flex-col sm:items-center gap-4 px-4 py-2 no-scrollbar">
          {/* Left */}
          <div className="flex items-center gap-2 sm:min-w-90 text-nowrap">
            <img
              src="/favicon.svg"
              alt="logo"
              className="h-6 cursor-pointer"
              onClick={() => navigate("/")}
            />
            <div className="max-w-64 sm:max-w-xs">
              <p className="text-sm text-medium capitalize truncate">
                {project.name}
              </p>
              <p className="text-xs text-gray-400 -mt-0.5">
                Previewing last saved version
              </p>
            </div>
            <div className="sm:hidden flex-1 flex justify-end">
              {isMenuOpen ? (
                <MessageSquareIcon
                  className="size-6 cursor-pointer"
                  onClick={() => setIsMenuOpen(false)}
                />
              ) : (
                <XIcon
                  className="size-6 cursor-pointer"
                  onClick={() => setIsMenuOpen(true)}
                />
              )}
            </div>
          </div>
          {/* middle */}
          <div className="hidden sm:flex gap-2 bg-gray-950 p-1.5 rounded-md">
            <SmartphoneIcon
              onClick={() => setDevice("phone")}
              className={`size-6 p-1 rounded cursor-pointer ${
                device === "phone" ? "bg-gray-700" : ""
              }`}
            />
            <TabletIcon
              onClick={() => setDevice("tablet")}
              className={`size-6 p-1 rounded cursor-pointer ${
                device === "tablet" ? "bg-gray-700" : ""
              }`}
            />
            <LaptopIcon
              onClick={() => setDevice("desktop")}
              className={`size-6 p-1 rounded cursor-pointer ${
                device === "desktop" ? "bg-gray-700" : ""
              }`}
            />
          </div>
          {/* right */}
          <div className="flex items-center justify-end gap-3 flex-1 text-xs sm:text-sm">
            <button
              className="max-sm:hidden bg-gray-800 hover:bg-gray-700 text-white px-3.5 py-1 flex items-center gap-2 rounded sm:rounded-sm  transition-colors border border-gray-700"
              disabled={isSaving}
              onClick={saveProject}
            >
              {isSaving ? (
                <Loader2Icon className="animate-spin" size={16} />
              ) : (
                <SaveIcon size={16} />
              )}
              Save
            </button>
            <Link
              target="_blank"
              to={`/preview/${projectId}`}
              className="flex items-center gap-2 px-4 py-1 rounded sm:rounded-sm border border-gray-700 hover:border-gray-500 transition-colors"
            >
              <FullscreenIcon size={16} /> Preview
            </Link>
            <button
              className="bg-linear-to-br from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 transition-colors text-white px-3.5 py-1 flex items-center gap-2 rounded sm:rounded-sm"
              onClick={downLoadCode}
            >
              <ArrowBigDownDashIcon size={16} /> Download
            </button>
            <button
              className="bg-linear-to-br from-indigo-700 to-indigo-600 hover:from-indigo-600 hover:to-indigo-500 transition-colors text-white px-3.5 py-1 flex items-center gap-2 rounded sm:rounded-sm"
              onClick={togglePublish}
            >
              {project.isPublished ? (
                <EyeOffIcon size={16} />
              ) : (
                <EyeIcon size={16} />
              )}
              {project.isPublished ? "Unpublish" : "Publish"}
            </button>
          </div>
        </div>
        <div className="flex-1 flex overflow-auto">
          <Sidebar
            isGenerating={isGenerating}
            setIsGenerating={setIsGenerating}
            isMenuOpen={isMenuOpen}
            project={project}
            setProject={(p) => setProject(p)}
          />
          <div className="flex-1 p-2 pl-0">
            <ProjectPreview
              device={device}
              isGenerating={isGenerating}
              project={project}
              showEditorPanel={true}
              ref={previewRef}
            />
          </div>
        </div>
      </div>
    </>
  ) : (
    <>
      <SoftBackdrop />
      <div className="flex items-center justify-center h-screen">
        <p className="text-2xl font-medium text-gray-200">
          Unable to load project!
        </p>
      </div>
    </>
  );
}

export default Projects;
