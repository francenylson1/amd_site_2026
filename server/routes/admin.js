import express from 'express';
import multer  from 'multer';
import { loginLimiter } from '../middleware/rateLimiter.js';
import { requireAuth }  from '../middleware/auth.js';
import { login }        from '../controllers/adminController.js';
import { uploadImage }  from '../controllers/uploadController.js';
import { listContacts } from '../controllers/contactController.js';
import { listVisits }   from '../controllers/visitController.js';
import {
  adminListEvents, createEvent, updateEvent, deleteEvent,
  addPhoto, updatePhoto, deletePhoto,
} from '../controllers/eventController.js';
import {
  adminListProjects, createProject, updateProject, deleteProject,
} from '../controllers/projectController.js';
import {
  adminListSchools, createSchool, updateSchool, deleteSchool,
} from '../controllers/schoolController.js';
import {
  adminListCourses, createCourse, updateCourse, deleteCourse,
} from '../controllers/courseController.js';
import {
  adminListAboutPhotos, createAboutPhoto, updateAboutPhoto, deleteAboutPhoto,
} from '../controllers/aboutController.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    cb(null, file.mimetype.startsWith('image/'));
  },
});

const router = express.Router();

router.post('/login',    loginLimiter, login);
router.get('/contacts',  requireAuth,  listContacts);
router.get('/visits',    requireAuth,  listVisits);

// Upload de imagem
router.post('/upload', requireAuth, upload.single('file'), uploadImage);

// Eventos
router.get('/events',                        requireAuth, adminListEvents);
router.post('/events',                       requireAuth, createEvent);
router.put('/events/:id',                    requireAuth, updateEvent);
router.delete('/events/:id',                 requireAuth, deleteEvent);
router.post('/events/:id/photos',            requireAuth, addPhoto);
router.put('/events/:id/photos/:photoId',    requireAuth, updatePhoto);
router.delete('/events/:id/photos/:photoId', requireAuth, deletePhoto);

// Projetos
router.get('/projects',     requireAuth, adminListProjects);
router.post('/projects',    requireAuth, createProject);
router.put('/projects/:id', requireAuth, updateProject);
router.delete('/projects/:id', requireAuth, deleteProject);

// Escolas
router.get('/schools',     requireAuth, adminListSchools);
router.post('/schools',    requireAuth, createSchool);
router.put('/schools/:id', requireAuth, updateSchool);
router.delete('/schools/:id', requireAuth, deleteSchool);

// Cursos
router.get('/courses',     requireAuth, adminListCourses);
router.post('/courses',    requireAuth, createCourse);
router.put('/courses/:id', requireAuth, updateCourse);
router.delete('/courses/:id', requireAuth, deleteCourse);

// Sobre
router.get('/about-photos',     requireAuth, adminListAboutPhotos);
router.post('/about-photos',    requireAuth, createAboutPhoto);
router.put('/about-photos/:id', requireAuth, updateAboutPhoto);
router.delete('/about-photos/:id', requireAuth, deleteAboutPhoto);

export default router;
