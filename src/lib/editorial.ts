import { z } from 'astro/zod';
import { getMovies } from './movies';
import { personProfiles } from '../data/personProfiles';

const localImage = z.string().regex(/^assets\/editorial\/[a-z0-9/-]+\.(webp|avif)$/);
const imageSchema = z.object({
  src: localImage,
  srcSmall: localImage.optional(),
  alt: z.string().trim().min(15),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  caption: z.string().optional(),
  source: z.url().refine((url) => url.startsWith('https://')).optional(),
  license: z.url().refine((url) => url.startsWith('https://')).optional(),
});
const headingSchema = z.object({
  type: z.literal('heading'),
  level: z.union([z.literal(2), z.literal(3)]),
  text: z.string().trim().min(1),
});
const bioLinkSchema = z.object({
  type: z.literal('bioLink'),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  label: z.string().trim().min(1),
});
const schema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().trim().min(1),
  excerpt: z.string().trim().min(1),
  author: z.string().trim().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((date) => {
    const parsed = new Date(`${date}T12:00:00Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date;
  }, 'Fecha inválida'),
  type: z.enum(['editorial', 'nota', 'especial', 'opinión']),
  movieSlug: z.string().optional(),
  tags: z.array(z.string().trim().min(1)),
  featured: z.boolean(),
  spoilers: z.boolean().default(false),
  cover: imageSchema,
  content: z.array(z.discriminatedUnion('type', [
    z.object({ type: z.literal('paragraph'), text: z.string().trim().min(1) }),
    headingSchema,
    bioLinkSchema,
    imageSchema.extend({ type: z.literal('image') }),
  ])).min(1).refine((blocks) => blocks.some((block) => block.type === 'paragraph'), 'Falta texto'),
});

export type EditorialImage = z.infer<typeof imageSchema>;
export type Editorial = z.infer<typeof schema> & { readingTime: number };
const files = import.meta.glob('../data/editorials/*.json', { eager: true, import: 'default' });
const slugs = new Set<string>();
const movieSlugs = new Set(getMovies().map((movie) => movie.slug));
const entries: Editorial[] = Object.entries(files).map(([path, data]) => {
  const entry = schema.parse(data);
  if (slugs.has(entry.slug)) throw new Error(`Editorial duplicada: ${entry.slug}`);
  if (!path.endsWith(`/${entry.slug}.json`)) throw new Error(`Slug y archivo no coinciden: ${path}`);
  if (entry.movieSlug && !movieSlugs.has(entry.movieSlug)) throw new Error(`Película inexistente: ${entry.movieSlug}`);
  for (const block of entry.content) {
    if (block.type === 'bioLink' && !personProfiles[block.slug]) {
      throw new Error(`Biografía inexistente: ${block.slug}`);
    }
  }
  slugs.add(entry.slug);
  const words = entry.content.flatMap((block) => block.type === 'paragraph' ? block.text.split(/\s+/u) : []).length;
  return { ...entry, readingTime: Math.max(1, Math.ceil(words / 220)) };
}).sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));

export const getEditorials = () => [...entries];
export const getMovieEditorials = (slug: string) => entries.filter((entry) => entry.movieSlug === slug);
export const getFeaturedEditorials = (limit = 3) => [...entries].sort((a, b) => Number(b.featured) - Number(a.featured) || b.date.localeCompare(a.date)).slice(0, limit);
export const getEditorialPath = (slug: string) => `${import.meta.env.BASE_URL}editorial/${slug}/`;
export const editorialAsset = (src: string) => `${import.meta.env.BASE_URL}${src}`;
export const formatEditorialDate = (date: string) => new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`));
