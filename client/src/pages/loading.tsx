import SoftBackdrop from "@/components/SoftBackdrop";
import { Loader2Icon } from "lucide-react";
import { useEffect } from "react";

function loading() {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = "/";
    }, 6000);
    return () => {
      clearTimeout(timer);
    };
  }, []);
  return (
    <div className="h-screen flex flex-col">
      <SoftBackdrop />
      <div className="flex items-center justify-center flex-1">
        <Loader2Icon className="size-7 animate-spin text-indigo-200" />
      </div>
    </div>
  );
}

export default loading;
