import { z } from "zod";

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),
  email: z.string().trim().email("Please enter a valid email address").max(160),
  subject: z
    .string()
    .trim()
    .min(3, "Subject must be at least 3 characters")
    .max(160, "Subject is too long"),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(3000, "Message is too long"),
  website: z.string().optional().default(""), // honeypot
});

const nullableUrlSchema = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((val) => (val && val.length > 0 ? val : null))
  .refine(
    (val) =>
      val === null ||
      val.startsWith("http://") ||
      val.startsWith("https://") ||
      val.startsWith("/"),
    { message: "Must be a valid http(s) URL or relative path" }
  );

export const profileSchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  brand_name: z.string().trim().min(1).max(30),
  role_en: z.string().trim().min(2).max(120),
  role_id: z.string().trim().min(2).max(120),
  location: z.string().trim().min(2).max(120),
  timezone: z.string().trim().min(2).max(60),
  availability_status_en: z.string().trim().min(2).max(80),
  availability_status_id: z.string().trim().min(2).max(80),
  is_available: z.boolean(),
  headline_en: z.string().trim().min(5).max(240),
  headline_id: z.string().trim().min(5).max(240),
  bio_en: z.string().trim().min(10).max(1500),
  bio_id: z.string().trim().min(10).max(1500),
  email: z.string().trim().email().max(160),
  github_url: z.string().trim().url().max(300),
  linkedin_url: z.string().trim().url().max(300),
  cv_url: z.string().trim().min(1).max(500),
  avatar_url: nullableUrlSchema,
  featured_github_repos: z
    .array(z.string().trim().min(1).max(120))
    .max(3)
    .optional()
    .default([]),
});

export const galleryImageSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1)
    .max(500)
    .refine(
      (val) =>
        val.startsWith("http://") ||
        val.startsWith("https://") ||
        val.startsWith("/"),
      { message: "Gallery image URL must be a valid http(s) URL or relative path" }
    ),
  caption_en: z.string().trim().max(240).optional().default(""),
  caption_id: z.string().trim().max(240).optional().default(""),
});

export const projectSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Slug must contain lowercase letters, numbers, and hyphens only"),
  title_en: z.string().trim().min(2).max(180),
  title_id: z.string().trim().min(2).max(180),
  summary_en: z.string().trim().min(10).max(600),
  summary_id: z.string().trim().min(10).max(600),
  category: z.string().trim().min(2).max(80),
  year: z.string().trim().min(2).max(40),
  role_en: z.string().trim().min(2).max(120),
  role_id: z.string().trim().min(2).max(120),
  tech_stack: z.array(z.string().trim().min(1)).min(1),
  problem_en: z.string().trim().min(10).max(4000),
  problem_id: z.string().trim().min(10).max(4000),
  architecture_en: z.string().trim().min(10).max(4000),
  architecture_id: z.string().trim().min(10).max(4000),
  challenges_en: z.string().trim().min(10).max(4000),
  challenges_id: z.string().trim().min(10).max(4000),
  impact_en: z.string().trim().min(10).max(4000),
  impact_id: z.string().trim().min(10).max(4000),
  live_url: nullableUrlSchema,
  repo_url: nullableUrlSchema,
  cover_image_url: nullableUrlSchema,
  gallery_images: z.array(galleryImageSchema).max(20).optional().default([]),
  featured: z.boolean(),
  published: z.boolean(),
  sort_order: z.coerce.number().int().min(0).max(999),
});

export const capabilitySchema = z.object({
  category_key: z
    .string()
    .trim()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9_-]+$/, "Key must be lowercase alphanumeric/hyphen/underscore"),
  title_en: z.string().trim().min(2).max(120),
  title_id: z.string().trim().min(2).max(120),
  description_en: z.string().trim().min(5).max(400),
  description_id: z.string().trim().min(5).max(400),
  items: z.array(z.string().trim().min(1)).min(1),
  sort_order: z.coerce.number().int().min(0).max(999),
});

export const experienceSchema = z.object({
  organization: z.string().trim().min(2).max(160),
  role_en: z.string().trim().min(2).max(160),
  role_id: z.string().trim().min(2).max(160),
  period: z.string().trim().min(2).max(80),
  location: z.string().trim().min(2).max(120),
  summary_en: z.string().trim().min(5).max(1000),
  summary_id: z.string().trim().min(5).max(1000),
  highlights_en: z.array(z.string().trim().min(1)).default([]),
  highlights_id: z.array(z.string().trim().min(1)).default([]),
  published: z.boolean(),
  sort_order: z.coerce.number().int().min(0).max(999),
});

export const messagePatchSchema = z.object({
  id: z.string().uuid(),
  is_read: z.boolean(),
});

export const analyticsEventSchema = z.object({
  event_type: z.enum(["page_view", "project_view", "cv_download"]),
  path: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .refine((val) => val.startsWith("/"), {
      message: "Path must start with /",
    }),
  project_slug: z.string().trim().max(120).optional().nullable(),
  referrer: z.string().trim().max(500).optional().nullable(),
});

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z
    .string()
    .trim()
    .min(1, "Message cannot be empty")
    .max(1500, "Message is too long"),
});

export const chatRequestSchema = z.object({
  messages: z
    .array(chatMessageSchema)
    .min(1, "Please enter a question.")
    .max(12, "Conversation history limit reached.")
    .refine((msgs) => msgs[msgs.length - 1]?.role === "user", {
      message: "Last message must be sent by the user.",
    })
    .refine((msgs) => (msgs[msgs.length - 1]?.content.length ?? 0) <= 600, {
      message: "Question must be 600 characters or fewer.",
    }),
  locale: z.enum(["en", "id"]).optional().default("en"),
  currentPage: z.string().trim().max(140).optional().nullable(),
});
