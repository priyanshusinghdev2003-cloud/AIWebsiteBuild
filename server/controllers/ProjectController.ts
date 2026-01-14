import { Request, Response } from "express";
import prisma from "../lib/prisma.ts";
import openai from "../config/openAI.ts";

export const makeRevision = async (req: Request, res: Response) => {
  const userId = req.userId;

  try {
    const { projectId } = req.params;
    const { message } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!userId || !user) {
      return res.status(404).json({ message: "Unauthorized" });
    }
    if (user.credits < 2) {
      return res.status(403).json({ message: "Insufficient Credits" });
    }

    if (!message || message.trim() === "") {
      return res.status(400).json({ message: "Invalid Message" });
    }

    const currentProject = await prisma.websiteProject.findUnique({
      where: {
        id: projectId as string,
      },
      include: {
        versions: true,
      },
    });

    if (!currentProject) {
      return res.status(404).json({ message: "Project Not Found" });
    }
    await prisma.conversation.create({
      data: {
        role: "user",
        content: message,
        projectId: projectId as string,
      },
    });

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        credits: { decrement: 5 },
      },
    });

    const promptEnhanceResponse = await openai.chat.completions.create({
      model: "z-ai/glm-4.5-air:free",
      messages: [
        {
          role: "system",
          content: `You are a prompt enhancement specialist. The user wants to make changes to their website. Enhance their request to be more specific and actionable for a web developer.

    Enhance this by:
    1. Being specific about what elements to change
    2. Mentioning design details (colors, spacing, sizes)
    3. Clarifying the desired outcome
    4. Using clear technical terms

Return ONLY the enhanced request, nothing else. Keep it concise (1-2 sentences).`,
        },
        {
          role: "user",
          content: `User's request: "${message}"`,
        },
      ],
    });

    const enhancedPrompt = promptEnhanceResponse.choices[0].message.content;
    await prisma.conversation.create({
      data: {
        role: "assistant",
        content: `T've enhanced your prompt to: "${enhancedPrompt}"`,
        projectId: projectId as string,
      },
    });
    await prisma.conversation.create({
      data: {
        role: "assistant",
        content: "Now making changes to your website...",
        projectId: projectId as string,
      },
    });
    const codeGenerationResponse = await openai.chat.completions.create({
      model: "z-ai/glm-4.5-air:free",
      messages: [
        {
          role: "system",
          content: `You are an expert web developer. 

    CRITICAL REQUIREMENTS:
    - Return ONLY the complete updated HTML code with the requested changes.
    - Use Tailwind CSS for ALL styling (NO custom CSS).
    - Use Tailwind utility classes for all styling changes.
    - Include all JavaScript in <script> tags before closing </body>
    - Make sure it's a complete, standalone HTML document with Tailwind CSS
    - Return the HTML Code Only, nothing else

    Apply the requested changes while maintaining the Tailwind CSS styling approach.`,
        },
        {
          role: "user",
          content: `Here is the current website code: "${currentProject.current_code}" The useres want this changes: "${enhancedPrompt}"`,
        },
      ],
    });
    const code = codeGenerationResponse.choices[0].message.content || "";
    const versions = await prisma.version.create({
      data: {
        code: code
          .replace(/```[a-z]*\n?/gi, "")
          .replace(/```$/g, "")
          .trim(),
        description: "changes made",
        projectId: projectId as string,
      },
    });
    await prisma.conversation.create({
      data: {
        role: "assistant",
        content:
          "I've made the changes to your website! you can now preview it.",
        projectId: projectId as string,
      },
    });
    await prisma.websiteProject.update({
      where: {
        id: projectId as string,
      },
      data: {
        current_code: code
          .replace(/```[a-z]*\n?/gi, "")
          .replace(/```$/g, "")
          .trim(),
        current_version_index: versions.id,
      },
    });
    res.status(200).json({
      message: "Changes made successfully",
    });
  } catch (error: any) {
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        credits: { increment: 5 },
      },
    });
    console.log(error);
    res.status(500).json({
      message: error.code || error.message || "Internal Server Error",
    });
  }
};

export const roolbackToVersion = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(404).json({ message: "Unauthorized" });
    }
    const { projectId, versionId } = req.params;

    const project = await prisma.websiteProject.findUnique({
      where: {
        id: projectId as string,
        userId,
      },
      include: {
        versions: true,
      },
    });

    if (!project) {
      return res.status(404).json({ message: "Project Not Found" });
    }
    const version = project.versions.find(
      (version) => version.id === versionId
    );
    if (!version) {
      return res.status(404).json({ message: "Version Not Found" });
    }
    await prisma.websiteProject.update({
      where: {
        id: projectId as string,
      },
      data: {
        current_code: version.code,
        current_version_index: version.id,
      },
    });
    await prisma.conversation.create({
      data: {
        role: "assistant",
        content:
          "I've rolled back your website to selected version. You can now preview it",
        projectId: projectId as string,
      },
    });
    res.status(200).json({
      message: "Version Rolled Back.",
    });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({
      message: error.code || error.message || "Internal Server Error",
    });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { projectId } = req.params;
    if (!userId) {
      return res.status(404).json({ message: "Unauthorized" });
    }
    const project = await prisma.websiteProject.delete({
      where: {
        id: projectId as string,
        userId,
      },
    });
    res.status(200).json({
      message: "Project Deleted Successfully",
    });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({
      message: error.code || error.message || "Internal Server Error",
    });
  }
};

export const getProjectCodePreview = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { projectId } = req.params;
    if (!userId) {
      return res.status(404).json({ message: "Unauthorized" });
    }
    const project = await prisma.websiteProject.findFirst({
      where: {
        id: projectId as string,
        userId,
      },
      include: {
        versions: true,
      },
    });
    if (!project) {
      return res.status(404).json({ message: "Project Not Found" });
    }
    res.status(200).json({
      project,
    });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({
      message: error.code || error.message || "Internal Server Error",
    });
  }
};
