import path from 'path';
import os from 'os';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Diretório raiz das imagens públicas.
// Em produção: ~/domains/alunomakerdigital.com.br/public_html/assets/images
// Localmente: pode ser sobrescrito via IMAGES_DIR no .env
const IMAGES_DIR = process.env.IMAGES_DIR ||
  path.join(os.homedir(), 'domains', 'alunomakerdigital.com.br', 'public_html', 'assets', 'images');

const ALLOWED_FOLDERS = new Set(['eventos', 'projetos', 'escolas', 'cursos', 'sobre']);

export async function uploadImage(req, res) {
  if (!req.file) {
    return res.status(400).json({ erro: 'Nenhum arquivo enviado.' });
  }

  const folder = (req.body.folder || '').trim().toLowerCase();
  if (!ALLOWED_FOLDERS.has(folder)) {
    return res.status(400).json({ erro: 'Pasta inválida. Use: eventos, projetos, escolas ou cursos.' });
  }

  const destDir = path.join(IMAGES_DIR, folder);
  await fs.mkdir(destDir, { recursive: true });

  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}.webp`;
  const destPath = path.join(destDir, filename);

  try {
    // Importação dinâmica para tolerar ambientes sem sharp instalado
    const { default: sharp } = await import('sharp');
    await sharp(req.file.buffer)
      .rotate()             // auto-corrige orientação EXIF (evita fotos de cabeça para baixo)
      .webp({ quality: 82 })
      .toFile(destPath);
  } catch {
    // Fallback: salva o arquivo original sem conversão
    const ext = path.extname(req.file.originalname).toLowerCase() || '.jpg';
    const fallbackFilename = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}${ext}`;
    const fallbackPath = path.join(destDir, fallbackFilename);
    await fs.writeFile(fallbackPath, req.file.buffer);
    const relativePath = `assets/images/${folder}/${fallbackFilename}`;
    return res.status(201).json({ path: relativePath, webp: false });
  }

  const relativePath = `assets/images/${folder}/${filename}`;
  res.status(201).json({ path: relativePath, webp: true });
}
