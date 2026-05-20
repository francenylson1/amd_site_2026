import express from 'express';
import { loginLimiter } from '../middleware/rateLimiter.js';
import { requireAuth }  from '../middleware/auth.js';
import { login }        from '../controllers/adminController.js';
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

const router = express.Router();

router.post('/login',    loginLimiter, login);
router.get('/contacts',  requireAuth,  listContacts);
router.get('/visits',    requireAuth,  listVisits);

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

export default router;
