import { useParams } from "react-router-dom";
import SoftBackdrop from "../components/SoftBackdrop";
import { useEffect, useState } from "react";
import { Loader2Icon } from "lucide-react";
import ProjectPreview from "../components/ProjectPreview";
import type { Project } from "../types";
import { toast } from "sonner";
import api from "@/configs/axios";

function View() {
  const { projectId } = useParams();
  const [code, setCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCode = async () => {
    try {
      const { data } = await api.get(`/project/published/${projectId}`);
      setCode(data?.code);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
      toast.error("Something went wrong");
    }
  };

  useEffect(() => {
    fetchCode();
  }, []);

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

export default View;
