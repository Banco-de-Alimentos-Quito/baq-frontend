import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface BlogPost {
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  author: {
    name: string;
    avatar: string;
    bio: string;
  };
  publishedAt: string;
  lastModified: string;
  coverImage: string;
  tags: string[];
  readTime: number;
}

const postsDirectory = path.join(process.cwd(), 'src/app/blog/posts');

export function getAllPosts(): BlogPost[] {
  // Verificar si el directorio existe
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      // Remover ".md" del nombre del archivo para obtener el slug
      const slug = fileName.replace(/\.md$/, '');

      // Leer el archivo markdown como string
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');

      // Usar gray-matter para parsear la metadata del post
      const matterResult = matter(fileContents);

      return {
        slug,
        title: matterResult.data.title || '',
        content: matterResult.content,
        excerpt: matterResult.data.excerpt || '',
        author: {
          name: matterResult.data.author || '',
          avatar: matterResult.data.author_avatar || '',
          bio: matterResult.data.author_bio || '',
        },
        publishedAt: matterResult.data.published_at || '',
        lastModified: matterResult.data.last_modified || matterResult.data.published_at || '',
        coverImage: matterResult.data.cover_image || '',
        tags: matterResult.data.tags || [],
        readTime: matterResult.data.read_time || 5,
      };
    });

  // Ordenar posts por fecha de publicación (más recientes primero)
  return allPostsData.sort((a, b) => {
    if (a.publishedAt < b.publishedAt) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getPostBySlug(slug: string): BlogPost | null {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`);
    
    if (!fs.existsSync(fullPath)) {
      return null;
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);

    return {
      slug,
      title: matterResult.data.title || '',
      content: matterResult.content,
      excerpt: matterResult.data.excerpt || '',
      author: {
        name: matterResult.data.author || '',
        avatar: matterResult.data.author_avatar || '',
        bio: matterResult.data.author_bio || '',
      },
      publishedAt: matterResult.data.published_at || '',
      lastModified: matterResult.data.last_modified || matterResult.data.published_at || '',
      coverImage: matterResult.data.cover_image || '',
      tags: matterResult.data.tags || [],
      readTime: matterResult.data.read_time || 5,
    };
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error);
    return null;
  }
}

export function getAllSlugs(): string[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => fileName.replace(/\.md$/, ''));
} 