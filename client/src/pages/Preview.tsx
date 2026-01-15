import { useEffect, useState } from "react";
import SoftBackdrop from "../components/SoftBackdrop";
import { useParams } from "react-router-dom";
import { Loader2Icon } from "lucide-react";
import ProjectPreview from "../components/ProjectPreview";
import type { Project, Version } from "../types";
import api from "@/configs/axios";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

function Preview() {
  const [code, setCode] = useState<string>("");
  const { projectId, versionId } = useParams();
  const [loading, setLoading] = useState<boolean>(true);
  const { data: session, isPending } = authClient.useSession();

  const fetchCode = async () => {
    try {
      const { data } = await api.get(`/project/preview/${projectId}`);
      setCode(data?.project?.current_code);
      if (versionId) {
        data.project?.versions.forEach((version: Version) => {
          if (version.id === versionId) {
            setCode(version.code);
          }
        });
      }
      setLoading(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch code");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user && !isPending) {
      fetchCode();
    }
  }, [session?.user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <SoftBackdrop />
        <Loader2Icon className="animate-spin size-7 text-indigo-200" />
      </div>
    );
  }

  return (
    <div className="h-screen">
      <SoftBackdrop />
      {code && (
        <ProjectPreview
          project={{ current_code: code } as Project}
          isGenerating={false}
          device="desktop"
          showEditorPanel={false}
        />
      )}
    </div>
  );
}

export default Preview;
