import { Router } from "express";
import { z } from "zod";

export const customBuildRouter = Router();

const customBuildSchema = z.object({
  department: z.string().min(1),
  useCase: z.string().min(1),
  integrations: z.array(z.string()).optional(),
  budget: z.string().optional(),
  timeline: z.string().optional(),
  requirements: z.string().optional(),
  contactEmail: z.string().email().optional(),
  companyName: z.string().optional(),
  teamSize: z.string().optional(),
  // Step-based fields from the CustomBuild wizard
  step1: z.any().optional(),
  step2: z.any().optional(),
  step3: z.any().optional(),
  step4: z.any().optional(),
  step5: z.any().optional(),
});

customBuildRouter.post("/", async (req, res) => {
  try {
    const data = customBuildSchema.parse(req.body);
    // In production this would send an email or create a CRM entry
    // For now we log and return a success response
    console.log("[CustomBuild] New request received:", JSON.stringify(data, null, 2));
    res.status(201).json({
      success: true,
      message: "Your custom build request has been received. Our team will contact you within 24 hours.",
      requestId: `CB-${Date.now()}`,
      data: {
        department: data.department,
        useCase: data.useCase,
        submittedAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return res.status(400).json({ error: err.errors });
    }
    res.status(500).json({ error: err.message });
  }
});

customBuildRouter.get("/", (_req, res) => {
  res.json({ message: "Custom Build API is available. POST to this endpoint to submit a request." });
});
