import { useEffect, useState } from "react";
import SoftBackdrop from "../components/SoftBackdrop";
import { useParams } from "react-router-dom";
import { dummyProjects } from "../assets/assets";
import { Loader2Icon } from "lucide-react";
import ProjectPreview from "../components/ProjectPreview";
import type { Project } from "../types";

function Preview() {
  const [code, setCode] = useState<string>("");
  const { projectId, versionId } = useParams();
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCode = async () => {
    try {
      setTimeout(() => {
        const project = dummyProjects.find(
          (project) => project.id === projectId
        )?.current_code;
        if (project) {
          setCode(project);
          setLoading(false);
        }
      }, 2000);
    } catch (error) {
      console.error(error);
      setLoading(false);
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

export default Preview;
