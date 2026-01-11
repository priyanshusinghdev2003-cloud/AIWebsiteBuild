import React from "react";
import { useParams } from "react-router-dom";

function View() {
  const { projectId } = useParams();
  console.log(projectId);
  return <div>View</div>;
}

export default View;
