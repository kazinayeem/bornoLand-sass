import type { Request, Response } from "express";
import { generateShopWithAi, type GenerateShopRequest } from "./ai.service.js";

export async function generateShopHandler(req: Request, res: Response) {
  try {
    const { storeType, description, style, language, storeName, targetAudience } = req.body as GenerateShopRequest;

    if (!storeType && !description) {
      return res.status(400).json({
        ok: false,
        message: "Please provide a store type or description for the AI builder.",
      });
    }

    const config = await generateShopWithAi({
      storeType: storeType || "General Store",
      description: description || "Modern ecommerce store",
      style: style || "Modern",
      language: language || "bn",
      storeName,
      targetAudience,
    });

    return res.status(200).json({
      ok: true,
      data: {
        config,
      },
    });
  } catch (error: any) {
    console.error("[AI Controller] Error in generateShopHandler:", error);
    return res.status(500).json({
      ok: false,
      message: error?.message || "Failed to generate shop configuration with AI.",
    });
  }
}

export async function improveSectionHandler(req: Request, res: Response) {
  try {
    const { sectionType, currentProps, prompt, language } = req.body;
    const isBn = language === "bn";

    // Lightweight copy/prop enhancement
    const improvedProps = { ...currentProps };
    if (prompt) {
      if (improvedProps.headline) {
        improvedProps.headline = isBn ? `এক্সক্লুসিভ ${improvedProps.headline}` : `Exclusive ${improvedProps.headline}`;
      }
      if (improvedProps.title) {
        improvedProps.title = isBn ? `প্রিমিয়াম ${improvedProps.title}` : `Premium ${improvedProps.title}`;
      }
    }

    return res.status(200).json({
      ok: true,
      data: {
        props: improvedProps,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      ok: false,
      message: error?.message || "Failed to improve section.",
    });
  }
}
