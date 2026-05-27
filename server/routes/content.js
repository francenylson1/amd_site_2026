import express from 'express';
import { listEvents }      from '../controllers/eventController.js';
import { listProjects }    from '../controllers/projectController.js';
import { listSchools }     from '../controllers/schoolController.js';
import { listCourses }     from '../controllers/courseController.js';
import { listAboutPhotos } from '../controllers/aboutController.js';
import { getConfigPublic } from '../controllers/configController.js';
import { listPosts, getPost } from '../controllers/blogController.js';

const router = express.Router();

router.get('/events',       listEvents);
router.get('/projects',     listProjects);
router.get('/schools',      listSchools);
router.get('/courses',      listCourses);
router.get('/about-photos', listAboutPhotos);
router.get('/config',       getConfigPublic);
router.get('/posts',        listPosts);
router.get('/posts/:slug',  getPost);

export default router;
