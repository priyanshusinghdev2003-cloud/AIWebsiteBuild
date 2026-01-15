import { useEffect, useState } from "react";
import SoftBackdrop from "../components/SoftBackdrop";
import type { Project } from "../types";
import { dummyProjects } from "../assets/assets";
import { Loader2Icon, PlusIcon, TrashIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import api from "@/configs/axios";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

function MyProject() {
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/user/projects");
      setProjects(data?.project);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async (projectId: string) => {
    try {
      const confirm = window.confirm(
        "Are you sure you want to delete this project?"
      );
      if (!confirm) return;
      setLoading(true);
      setIsDeleting(projectId);
      const { data } = await api.delete(`/project/${projectId}`);
      toast.success(data?.message);
      fetchProjects();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
      setIsDeleting(null);
    }
  };

  useEffect(() => {
    if (session?.user && !isPending) {
      fetchProjects();
    } else if (!isPending && !session?.user) {
      navigate("/");
      toast.error("Please login to view your projects");
    }
  }, [session?.user]);

  return (
    <>
      <SoftBackdrop />
      <div className="px-4 md:px-16 lg:px-24 xl:px-32">
        {loading ? (
          <div className="flex items-center justify-center h-[80vh]">
            <Loader2Icon className="animate-spin text-indigo-200 size-7" />
          </div>
        ) : projects.length > 0 ? (
          <div className="py-10 min-h-[80vh]">
            <div className="flex items-center justify-between mb-12">
              <h1 className="text-2xl font-medium text-white">My Projects</h1>
              <button
                className="flex items-center gap-2 text-white px-3 sm:px-6 py-1 sm:py-2 rounded bg-linear-to-br from-indigo-500 to-indigo-600 hover:opacity-90 transition-all active:scale-95"
                onClick={() => navigate("/")}
              >
                <PlusIcon size={18} /> Create New
              </button>
            </div>
            <div className="flex flex-wrap gap-3.5">
              {projects.map((project) => (
                <div
                  onClick={() => navigate(`/project/${project.id}`)}
                  key={project.id}
                  className={`relative group w-72 max-sm:mx-auto cursor-pointer bg-gray-900/60 border border-gray-700 rounded-lg overflow-hidden shadow-md group hover:shadow-indigo-700/30 hover:border-indigo-800/80  transition-all duration-500 ${
                    isDeleting === project.id ? "opacity-0 scale-75" : ""
                  }`}
                >
                  {/* Desktop-liki mini Preview */}
                  <div className="relative w-full h-40 bg-gray-900 overflow-hidden border-b border-gray-800">
                    {project.current_code ? (
                      <iframe
                        srcDoc={project.current_code}
                        className="absolute top-0 left-0 w-[1200px] h-[800px] origin-top-left pointer-events-none"
                        sandbox="allow-scripts allow-same-origin "
                        style={{
                          transform: "scale(0.25)",
                        }}
                      />
                    ) : (
                      <div className="h-full text-gray-500 flex items-center justify-center">
                        <p>No Preview </p>
                      </div>
                    )}
                  </div>
                  {/* content */}
                  <div className="p-4 text-white bg-linear-180 from-transparent group-hover:from-indigo-950 to-transparent transition-colors">
                    <div className="flex items-start justify-between">
                      <h2 className="text-lg font-medium line-clamp-2">
                        {project.name}
                      </h2>
                      <button className="px-2.5 py-0.5 mt-1 ml-2 text-xs bg-gray-800 border border-gray-700 rounded-full">
                        Website
                      </button>
                    </div>
                    <p className="text-gray-400 mt-1 text-sm line-clamp-2">
                      {project.initial_prompt}
                    </p>
                    <div
                      className="flex justify-between items-center mt-6"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="text-xs text-gray-500">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex gap-3 text-white text-sm">
                        <button
                          className="px-3 py-1.5 bg-white/10 hover:bg-white/15 rounded-md transition-all"
                          onClick={() => navigate(`/preview/${project.id}`)}
                        >
                          Preview
                        </button>
                        <button
                          className="px-3 py-1.5 bg-white/10 hover:bg-white/15 rounded-md transition-colors"
                          onClick={() => navigate(`/project/${project.id}`)}
                        >
                          Open
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="" onClick={(e) => e.stopPropagation()}>
                    <TrashIcon
                      className="absolute top-3 right-3 scale-0 group-hover:scale-100 bg-white p-1.5 size-7 rounded text-red-500 text-xl cursor-pointer transition-all"
                      onClick={() => handleDelete(project.id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[80vh]">
            <h1 className="text-3xl font-semibold text-gray-300">
              You have no projects yet!
            </h1>
            <button
              className="text-white px-5 py-2 mt-5 rounded-md bg-indigo-500 hover:bg-indigo-600 transition-all active:scale-95"
              onClick={() => navigate("/")}
            >
              Create New
            </button>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

export default MyProject;
