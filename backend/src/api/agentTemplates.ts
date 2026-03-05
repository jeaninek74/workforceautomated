import { Router } from "express";
import { AGENT_TEMPLATES, TEMPLATE_CATEGORIES, getTemplateById, getTemplatesByCategory } from "../data/agentTemplates.js";

const router = Router();

// GET /api/agent-templates — list all templates (public, no auth required)
router.get("/", (_req, res) => {
  res.json({
    templates: AGENT_TEMPLATES,
    categories: TEMPLATE_CATEGORIES,
    total: AGENT_TEMPLATES.length,
  });
});

// GET /api/agent-templates/categories — list categories
router.get("/categories", (_req, res) => {
  res.json({ categories: TEMPLATE_CATEGORIES });
});

// GET /api/agent-templates/:id — get a single template
router.get("/:id", (req, res) => {
  const template = getTemplateById(req.params.id);
  if (!template) {
    return res.status(404).json({ error: "Template not found" });
  }
  res.json(template);
});

// GET /api/agent-templates/category/:category — get templates by category
router.get("/category/:category", (req, res) => {
  const templates = getTemplatesByCategory(req.params.category);
  res.json({ templates, category: req.params.category });
});

export default router;
